# config.py

from __future__ import absolute_import
from authomatic.providers import oauth2

# Need a local app_secrets.py file containing the secrets.
# Use app_secrets.tmpl as a template.
import app_secrets

CONFIG = {
    'facebook': {
        'class_': oauth2.Facebook,
        'short_name': 1,
        
        'consumer_key': app_secrets.FACEBOOK_APP_ID,
        'consumer_secret': app_secrets.FACEBOOK_APP_SECRET,
        
        'scope': ['email'],
    },
    
    'google': {           
        'class_': oauth2.Google,
        'short_name': 2,

        'consumer_key': app_secrets.GOOGLE_OAUTH2_CLIENT_ID,
        'consumer_secret': app_secrets.GOOGLE_OAUTH2_CLIENT_SECRET,
        
        'scope': ['https://www.googleapis.com/auth/userinfo.email']
    },
}
