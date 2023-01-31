# main.py

import webapp2
import webapp2_extras
from authomatic import Authomatic
from authomatic.adapters import Webapp2Adapter
from webapp2_extras import securecookie

import config
# Need a local app_secrets.py file containing the secrets.
# Use app_secrets.tmpl as a template.
import app_secrets

# Instantiate Authomatic.
authomatic = Authomatic(config=config.CONFIG, secret=app_secrets.SECRET)

COOKIES = securecookie.SecureCookieSerializer(app_secrets.SECRET)

# Create a simple request handler for the login procedure.
class Login(webapp2.RequestHandler):
    # The handler must accept GET and POST http methods and
    # Accept any HTTP method and catch the "provider_name" URL variable.
    def any(self, provider_name):
                
        # It all begins with login.
        result = authomatic.login(Webapp2Adapter(self), provider_name)
        
        # Do not write anything to the response if there is no result!
        if result:            
            if result.error:
                # Login procedure finished with an error.
                self.response.write(u'<h2>Damn that error: {}</h2>'.format(result.error.message))
            
            elif result.user:
                # Hooray, we have the user!
                
                # OAuth 2.0 and OAuth 1.0a provide only limited user data on login,
                # We need to update the user to get more info.
                if not (result.user.name and result.user.id):
                    result.user.update()
                
                # Auth was successful; store the user identity inside a signed sookie.
                cookie = COOKIES.serialize('user', result.user.email)
                self.response.set_cookie('user', cookie)
                self.redirect('/');

class Logout(webapp2.RequestHandler):
    def get(self):
        self.response.delete_cookie('user')
        self.redirect('/');
