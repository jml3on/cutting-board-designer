# config.py

from authomatic.providers import oauth2

# Need a local file containing the secrets.
import app_secrets

CONFIG = {
    
    'facebook': {
           
        'class_': oauth2.Facebook,
        'short_name': 1,
        
        'consumer_key': app_secrets.FACEBOOK_APP_ID, # App ID
        'consumer_secret': app_secrets.FACEBOOK_APP_SECRET, # App Secret
        
        'scope': ['email'],
    },
    
    'google': {
           
        'class_': oauth2.Google,
        'short_name': 2,

        'consumer_key': app_secrets.GOOGLE_APP_ID,
        'consumer_secret': app_secrets.GOOGLE_APP_SECRET,
        
        'scope': ['https://www.googleapis.com/auth/userinfo.email']
    },
}
