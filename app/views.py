import os
import requests
import json
import hmac
import hashlib
import base64
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout, get_user_model
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.utils import timezone
from django.urls import reverse
from app.forms import CustomUserCreationForm, CustomAuthenticationForm
from django.conf import settings

def index(request):
    return render(request, 'index.html')

def signin(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            # Handle remember me
            remember = request.POST.get('remember-me') == 'on'
            if remember:
                request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
            else:
                request.session.set_expiry(0)  # Session expires on browser close

            user = form.get_user()
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next') or reverse('editor')
            return redirect(next_url)
    else:
        form = CustomAuthenticationForm(request)
    return render(request, 'auth/signin.html', {'form': form})

def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            return redirect(reverse('editor'))
    else:
        form = CustomUserCreationForm()
    return render(request, 'auth/signup.html', {'form': form})

def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return redirect('index')

def editor(request):
    from .utils import get_user_access_status
    from datetime import datetime, timedelta

    # Handle anonymous users - give them trial access
    if request.user.is_authenticated:
        access_status = get_user_access_status(request.user)
        user = request.user
    else:
        # Anonymous users get trial access - track trial start in session
        trial_start_key = 'anonymous_trial_start'
        if trial_start_key not in request.session:
            request.session[trial_start_key] = datetime.now().isoformat()
            request.session.set_expiry(60 * 60 * 24 * 14)  # 14 days

        trial_start = datetime.fromisoformat(request.session[trial_start_key])
        trial_end = trial_start + timedelta(days=14)
        days_remaining = max(0, (trial_end - datetime.now()).days)
        trial_expired = datetime.now() > trial_end

        access_status = {
            'has_access': not trial_expired,
            'is_premium': False,
            'in_trial': not trial_expired,
            'trial_expired': trial_expired,
            'days_remaining': days_remaining,
            'trial_end_date': trial_end,
            'is_admin': False
        }
        user = None

    # Redirect to upgrade page if trial expired (but not for admins)
    if access_status['trial_expired'] and not access_status.get('is_admin', False):
        return redirect('upgrade')

    return render(request, 'app/editor.html', {'access_status': access_status, 'user': user})

@login_required
def upgrade(request):
    from .utils import get_user_access_status
    access_status = get_user_access_status(request.user)
    return render(request, 'upgrade.html', {'access_status': access_status})

@login_required
def checkout_one_time(request):
    """
    Create Lemon Squeezy checkout for lifetime purchase.
    """
    if not settings.LEMONSQUEEZY_API_KEY or not settings.LEMONSQUEEZY_PRODUCTS.get('one_time'):
        messages.error(request, "Payment configuration error. Please contact support.")
        return redirect('upgrade')

    url = "https://api.lemonsqueezy.com/v1/checkouts"
    headers = {
        "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
        "Content-Type": "application/vnd.api+json",
    }

    # Try with variant_id first (most common)
    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "custom": {"user_id": request.user.id},
                "variant_id": int(settings.LEMONSQUEEZY_PRODUCTS['one_time']),
                "redirect_url": request.build_absolute_uri(reverse('checkout_success')),
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        checkout_url = data['data']['attributes']['url']
        return redirect(checkout_url)
    except requests.RequestException as e:
        # If variant_id fails, try with product_id
        try:
            payload_fallback = {
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "custom": {"user_id": request.user.id},
                        "product_id": int(settings.LEMONSQUEEZY_PRODUCTS['one_time']),
                        "redirect_url": request.build_absolute_uri(reverse('checkout_success')),
                    }
                }
            }
            response = requests.post(url, json=payload_fallback, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            checkout_url = data['data']['attributes']['url']
            return redirect(checkout_url)
        except requests.RequestException:
            messages.error(request, "Failed to create checkout. Please check your payment configuration.")
            return redirect('upgrade')

@login_required
def checkout_yearly(request):
    """
    Create Lemon Squeezy checkout for yearly subscription.
    """
    if not settings.LEMONSQUEEZY_API_KEY or not settings.LEMONSQUEEZY_PRODUCTS.get('yearly'):
        messages.error(request, "Payment configuration error. Please contact support.")
        return redirect('upgrade')

    url = "https://api.lemonsqueezy.com/v1/checkouts"
    headers = {
        "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
        "Content-Type": "application/vnd.api+json",
    }

    # Try with variant_id first (most common)
    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "custom": {"user_id": request.user.id},
                "variant_id": int(settings.LEMONSQUEEZY_PRODUCTS['yearly']),
                "redirect_url": request.build_absolute_uri(reverse('checkout_success')),
            }
        }
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        checkout_url = data['data']['attributes']['url']
        return redirect(checkout_url)
    except requests.RequestException as e:
        # If variant_id fails, try with product_id
        try:
            payload_fallback = {
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "custom": {"user_id": request.user.id},
                        "product_id": int(settings.LEMONSQUEEZY_PRODUCTS['yearly']),
                        "redirect_url": request.build_absolute_uri(reverse('checkout_success')),
                    }
                }
            }
            response = requests.post(url, json=payload_fallback, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            checkout_url = data['data']['attributes']['url']
            return redirect(checkout_url)
        except requests.RequestException:
            messages.error(request, "Failed to create checkout. Please check your payment configuration.")
            return redirect('upgrade')

@login_required
def checkout_success(request):
    """
    Handle successful checkout return from Gumroad.
    """
    # For Gumroad, we don't need to verify checkout_id as webhooks handle license creation
    # Users will be redirected here after successful purchase
    return render(request, 'checkout_success.html', {'user': request.user})

@login_required
def checkout_cancel(request):
    return render(request, 'checkout_cancel.html')

@login_required
def redeem_license(request):
    """
    Allow users to redeem their license key and link it to their account.
    """
    if request.method == "POST":
        license_key = request.POST.get("license_key")
        try:
            license = License.objects.get(license_key=license_key, user__isnull=True)
            license.user = request.user
            license.save()
            messages.success(request, "✅ License successfully linked to your account.")
        except License.DoesNotExist:
            messages.error(request, "❌ Invalid or already claimed license key.")
        return redirect("my_purchases")
    return render(request, "redeem_license.html")

@login_required
def my_purchases(request):
    """
    Display user's licenses and purchases.
    """
    licenses = request.user.licenses.all()
    return render(request, "my_purchases.html", {"licenses": licenses})

def terms(request):
    return render(request, 'terms.html')

def privacy(request):
    return render(request, 'privacy.html')

def refund(request):
    return render(request, 'refund.html')


from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from .models import License

# Utility function to help debug Lemon Squeezy configuration
def debug_lemon_squeezy_config():
    """
    Debug function to check Lemon Squeezy variants and products.
    Call this in Django shell to see available variants.
    """
    if not settings.LEMONSQUEEZY_API_KEY:
        return "No API key configured"

    headers = {
        "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
        "Accept": "application/vnd.api+json",
    }

    # Try to list variants
    try:
        response = requests.get(f"https://api.lemonsqueezy.com/v1/variants", headers=headers, timeout=30)
        if response.status_code == 200:
            variants = response.json()
            return f"Available variants: {[v['id'] for v in variants.get('data', [])]}"
        else:
            return f"Failed to fetch variants: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error fetching variants: {e}"

@csrf_exempt
def lemon_webhook(request):
    """
    Handle Lemon Squeezy webhook for purchases and subscriptions.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    signature = request.headers.get("X-Signature")
    computed_sig = hmac.new(
        settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
        request.body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, computed_sig):
        return JsonResponse({"error": "Invalid signature"}, status=400)

    payload = json.loads(request.body)
    event_name = payload.get("meta", {}).get("event_name")
    data = payload.get("data", {})
    attributes = data.get("attributes", {})
    custom = attributes.get("custom", {})

    user_id = custom.get("user_id")
    if not user_id:
        return JsonResponse({"status": "no user_id"})

    user = get_object_or_404(get_user_model(), id=user_id)

    if event_name == "order_created":
        # Create lifetime license
        License.objects.get_or_create(
            lemonsqueezy_order_id=str(data['id']),
            defaults={
                'user': user,
                'purchase_id': str(data['id']),
                'license_key': f"LS-{data['id']}",
                'buyer_email': user.email,
                'plan_type': "lifetime",
                'active': True,
                'is_pro': True,
            }
        )

    elif event_name == "subscription_created":
        # Create subscription license
        License.objects.get_or_create(
            lemonsqueezy_subscription_id=str(data['id']),
            defaults={
                'user': user,
                'purchase_id': str(data['id']),
                'license_key': f"LS-SUB-{data['id']}",
                'buyer_email': user.email,
                'plan_type': "yearly",
                'active': True,
                'is_pro': True,
                'expires_at': parse_datetime(attributes.get("ends_at")),
            }
        )

    elif event_name == "subscription_cancelled":
        license_obj = License.objects.filter(lemonsqueezy_subscription_id=str(data['id'])).first()
        if license_obj:
            license_obj.active = False
            license_obj.save()

    print(f"Webhook received: {event_name}")
    return JsonResponse({"status": "ok"})

@csrf_exempt
def webhooks_polar(request):
    if request.method == "POST":
        from django.conf import settings

        # Verify webhook signature if webhook secret is configured
        if hasattr(settings, 'POLAR_WEBHOOK_SECRET') and settings.POLAR_WEBHOOK_SECRET:
            signature = request.headers.get('polar-signature')
            if signature:
                # Verify the webhook signature
                expected_signature = hmac.new(
                    settings.POLAR_WEBHOOK_SECRET.encode(),
                    request.body,
                    hashlib.sha256
                ).hexdigest()

                if not hmac.compare_digest(signature, expected_signature):
                    return JsonResponse({'error': 'Invalid signature'}, status=400)

        try:
            payload = json.loads(request.body)
            event_type = payload.get("type")

            # TODO: Handle Paddle webhook events
            # Replace Polar event handling with Paddle equivalents
            if event_type == "checkout.completed":
                # Handle Paddle checkout completion
                pass
            elif event_type == "subscription.active":
                # Handle Paddle subscription activation
                pass
            elif event_type == "subscription.cancelled":
                # Handle Paddle subscription cancellation
                pass

            return JsonResponse({"status": "ok"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)