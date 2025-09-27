from django.urls import path
from .views import *

urlpatterns = [
    # Main pages
    path('', index, name='index'),
    path('signin/', signin, name='signin'),
    path('signup/', signup, name='signup'),
    path('logout/', logout_view, name='logout'),
    path('app/', editor, name='editor'),
    path('upgrade/', upgrade, name='upgrade'),
    # Payment URLs
    path('checkout/one-time/', checkout_one_time, name='checkout_one_time'),
    path('checkout/yearly/', checkout_yearly, name='checkout_yearly'),
    path('checkout/success/', checkout_success, name='checkout_success'),
    path('checkout/cancel/', checkout_cancel, name='checkout_cancel'),
    # Lemon Squeezy webhook
    path('webhook/lemon/', lemon_webhook, name='lemon_webhook'),
    path('redeem/', redeem_license, name='redeem_license'),
    path('my-purchases/', my_purchases, name='my_purchases'),
    # Legacy webhook (keep for now)
    path('webhooks/payment/', webhooks_polar, name='webhooks_payment'),
    # Legal pages
    path('terms/', terms, name='terms'),
    path('privacy/', privacy, name='privacy'),
    path('refund/', refund, name='refund'),
]