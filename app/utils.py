from .models import License
from django.utils import timezone
from datetime import timedelta

TRIAL_DURATION_DAYS = 14

def user_has_premium(user):
    """
    Check if a user has premium access based on their licenses.
    Returns True if user has any valid license (lifetime or active yearly).
    """
    if not user or not user.is_authenticated:
        return False

    licenses = License.objects.filter(user=user, active=True)
    for license in licenses:
        if license.plan_type == "lifetime":
            return True
        elif license.plan_type == "yearly" and license.expires_at and license.expires_at > timezone.now():
            return True
    return False

def user_is_in_trial(user):
    """
    Check if a user is currently in their free trial period.
    Returns True if user has no premium license and trial hasn't expired.
    """
    if not user or not user.is_authenticated:
        return False

    # If user has premium, they're not in trial
    if user_has_premium(user):
        return False

    # Check if trial has expired
    trial_end_date = user.date_joined + timedelta(days=TRIAL_DURATION_DAYS)
    return timezone.now() < trial_end_date

def user_trial_expired(user):
    """
    Check if a user's trial has expired.
    Returns True if user has no premium license and trial has expired.
    """
    if not user or not user.is_authenticated:
        return False

    # If user has premium, trial is not expired
    if user_has_premium(user):
        return False

    # Check if trial has expired
    trial_end_date = user.date_joined + timedelta(days=TRIAL_DURATION_DAYS)
    return timezone.now() > trial_end_date

def get_trial_days_remaining(user):
    """
    Get the number of days remaining in the user's trial.
    Returns positive number if in trial, 0 if expired, None if not applicable.
    """
    if not user or not user.is_authenticated:
        return None

    if user_has_premium(user):
        return None

    trial_end_date = user.date_joined + timedelta(days=TRIAL_DURATION_DAYS)
    remaining = trial_end_date - timezone.now()

    if remaining.total_seconds() > 0:
        return remaining.days
    else:
        return 0

def get_user_access_status(user):
    """
    Get comprehensive access status for a user.
    Returns dict with access information.
    """
    if not user or not user.is_authenticated:
        return {
            'has_access': False,
            'is_premium': False,
            'in_trial': False,
            'trial_expired': False,
            'days_remaining': None,
            'trial_end_date': None,
            'is_admin': False
        }

    # Admin override - staff and superusers have full access
    is_admin = user.is_staff or user.is_superuser
    if is_admin:
        return {
            'has_access': True,
            'is_premium': True,  # Treat as premium for UI purposes
            'in_trial': False,
            'trial_expired': False,
            'days_remaining': None,
            'trial_end_date': None,
            'is_admin': True
        }

    is_premium = user_has_premium(user)
    in_trial = user_is_in_trial(user)
    trial_expired = user_trial_expired(user)
    days_remaining = get_trial_days_remaining(user)

    has_access = is_premium or in_trial

    trial_end_date = None
    if not is_premium:
        trial_end_date = user.date_joined + timedelta(days=TRIAL_DURATION_DAYS)

    return {
        'has_access': has_access,
        'is_premium': is_premium,
        'in_trial': in_trial,
        'trial_expired': trial_expired,
        'days_remaining': days_remaining,
        'trial_end_date': trial_end_date,
        'is_admin': False
    }