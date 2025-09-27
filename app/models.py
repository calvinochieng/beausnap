from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Track authentication method
    auth_provider = models.CharField(
        max_length=50,
        default='manual',
        choices=[
            ('manual', 'Email/Password'),
            ('google', 'Google'),
            ('github', 'GitHub'),
            ('facebook', 'Facebook'),
            ('twitter', 'Twitter'),
        ],
        help_text="How this user authenticated"
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class License(models.Model):
    PLAN_CHOICES = [
        ("yearly", "Yearly Subscription"),
        ("lifetime", "Lifetime Access"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="licenses", null=True, blank=True)
    purchase_id = models.CharField(max_length=100, unique=True)  # Generic for any payment provider
    license_key = models.CharField(max_length=200, unique=True)
    buyer_email = models.EmailField()
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES)
    active = models.BooleanField(default=True)
    is_pro = models.BooleanField(default=True)  # Grants pro access
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # only for yearly
    # Lemon Squeezy specific fields
    lemonsqueezy_order_id = models.CharField(max_length=100, blank=True, null=True)
    lemonsqueezy_subscription_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.plan_type} | {self.buyer_email}"

    def is_valid(self):
        """Check if license is still valid"""
        if not self.active:
            return False
        if self.plan_type == "lifetime":
            return True
        if self.plan_type == "yearly" and self.expires_at:
            return self.expires_at > timezone.now()
        return False


# class UserTrial(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     start_date = models.DateTimeField(default=timezone.now)
#     end_date = models.DateTimeField()
#     is_active = models.BooleanField(default=True)
#     features_used = models.JSONField(default=dict)  # Track feature usage

#     def days_remaining(self):
#         if self.is_active and timezone.now() < self.end_date:
#             return (self.end_date - timezone.now()).days
#         return 0

#     def is_expired(self):
#         return timezone.now() > self.end_date

# class UserSubscription(models.Model):
#     STATUS_CHOICES = [
#         ("active", "Active"),
#         ("canceled", "Canceled"),
#         ("trialing", "Trialing"),
#         ("incomplete", "Incomplete"),
#         ("past_due", "Past Due"),
#     ]

#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     payment_subscription_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
#     payment_customer_id = models.CharField(max_length=255, blank=True)
#     payment_price_id = models.CharField(max_length=255, blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="incomplete")
#     current_period_start = models.DateTimeField(null=True, blank=True)
#     current_period_end = models.DateTimeField(null=True, blank=True)
#     cancel_at_period_end = models.BooleanField(default=False)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

# class OneTimePurchase(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     payment_order_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=3, default='USD')
#     status = models.CharField(max_length=50, default='completed')
#     purchased_at = models.DateTimeField(default=timezone.now)

# class Product(models.Model):
#     payment_product_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
#     name = models.CharField(max_length=255)
#     type = models.CharField(max_length=50)  # subscription, one_time
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=3, default='USD')
#     interval = models.CharField(max_length=50, null=True, blank=True)  # month, year for subscriptions
#     is_active = models.BooleanField(default=True)
