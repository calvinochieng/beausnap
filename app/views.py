import os
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout, get_user_model
from django.http import JsonResponse, HttpResponseForbidden
from django.utils import timezone
from django.urls import reverse
from app.forms import CustomUserCreationForm, CustomAuthenticationForm

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
            next_url = request.POST.get('next') or request.GET.get('next') or reverse('index') + '#pricing'
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
            return redirect(reverse('index') + '#pricing')
    else:
        form = CustomUserCreationForm()
    return render(request, 'auth/signup.html', {'form': form})

def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return redirect('index')

@login_required
def editor(request):
    from .utils import get_user_access_status
    access_status = get_user_access_status(request.user)

    # Redirect to upgrade page if trial expired (but not for admins)
    if access_status['trial_expired'] and not access_status.get('is_admin', False):
        return redirect('upgrade')

    return render(request, 'app/editor.html', {'access_status': access_status})

@login_required
def upgrade(request):
    from .utils import get_user_access_status
    access_status = get_user_access_status(request.user)
    return render(request, 'upgrade.html', {'access_status': access_status})

@login_required
def checkout_one_time(request):
    """
    Redirect to Gumroad lifetime purchase.
    """
    if request.method == "POST":
        # Redirect to Gumroad lifetime purchase
        gumroad_url = "https://gum.co/BEAUSNAP_LIFETIME?wanted=true"
        return redirect(gumroad_url)

    return render(request, 'checkout.html', {'plan': 'one-time', 'user': request.user})

@login_required
def checkout_yearly(request):
    """
    Redirect to Gumroad yearly subscription.
    """
    if request.method == "POST":
        # Redirect to Gumroad yearly purchase
        gumroad_url = "https://gum.co/BEAUSNAP_YEARLY?wanted=true"
        return redirect(gumroad_url)

    return render(request, 'checkout.html', {'plan': 'yearly', 'user': request.user})

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
import json
import hmac
import hashlib
from django.utils.dateparse import parse_datetime
from .models import License

@csrf_exempt
def gumroad_webhook(request):
    """
    Handle Gumroad webhook for license purchases.

    Configure this webhook URL in Gumroad:
    https://beausn.app/api/gumroad/webhook/
    """
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)

    payload = request.body
    signature = request.headers.get("X-Gumroad-Signature")

    # Verify Gumroad webhook signature
    from django.conf import settings
    expected = hmac.new(settings.GUMROAD_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    if signature != expected:
        return JsonResponse({"error": "invalid signature"}, status=400)

    data = request.POST
    buyer_email = data.get("email")
    license_key = data.get("license_key")
    purchase_id = data.get("purchase_id")
    product_name = data.get("product_name")
    subscription_end_date = data.get("subscription_end_date")

    plan_type = "lifetime" if "Lifetime" in product_name else "yearly"

    # Do NOT override login email → store buyer email in License
    user = request.user if request.user.is_authenticated else None

    license, created = License.objects.update_or_create(
        gumroad_purchase_id=purchase_id,
        defaults={
            "user": None,   # will try to associate below
            "license_key": license_key,
            "buyer_email": buyer_email,
            "plan_type": plan_type,
            "active": True,
            "expires_at": parse_datetime(subscription_end_date) if subscription_end_date else None,
        }
    )
    
    # Auto-associate license to user if email matches an existing account
    if buyer_email:
        try:
            matching_user = get_user_model().objects.get(email=buyer_email)
            license.user = matching_user
            license.save()
        except get_user_model().DoesNotExist:
            pass  # License remains unassociated until manual redeem
    
    # get all the data for debu
    print(data)
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