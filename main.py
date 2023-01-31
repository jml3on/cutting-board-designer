#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import datetime
import json
import os
import time

import jinja2
import webapp2
from webapp2_extras import securecookie

import config
from signin import *

# Need a local app_secrets.py file containing the secrets.
# Use app_secrets.tmpl as a template.
import app_secrets

from google.appengine.ext import db
from google.appengine.api import namespace_manager

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

COOKIES = securecookie.SecureCookieSerializer(app_secrets.SECRET)

class BoardSpecs(db.Model):
  spec = db.StringProperty()
  date = db.StringProperty()
  id = db.IntegerProperty();

class BaseHandler(webapp2.RequestHandler):
  def SignedInIdentity(self):
    if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
      return 'dev@home'
    cookie = self.request.cookies.get('user')
    user = COOKIES.deserialize('user', cookie)
    if user is None:
      template = JINJA_ENVIRONMENT.get_template('templates/signin.html')
      self.response.write(template.render({}))
      return None
    else:
      namespace_manager.set_namespace(user.replace('@', '_'))
      return user
      

class MainHandler(BaseHandler):
  def get(self):
    user = self.SignedInIdentity()
    if user is None: return

    template = JINJA_ENVIRONMENT.get_template('templates/index.html')
    self.response.write(template.render(user=user))
    

class saveSpecHandler(BaseHandler):
  def post(self):
    user = self.SignedInIdentity()
    if user is None: return
	
    print(self.request.body);
    dict = json.loads(self.request.body);
    entry = BoardSpecs()
    if 'id' in dict:
      id = long(dict['id']);
      entry = BoardSpecs(key=db.Key.from_path('BoardSpecs', id));
      entry.id = id;
    entry.spec = json.dumps(dict['spec'])
    entry.date = str(datetime.datetime.now())
    entry.put()
    if entry.id is None:
      entry.id = entry.key().id();
      entry.put();
    self.response.write(entry.key().id())
    

class deleteSpecHandler(BaseHandler):
  def post(self):
    user = self.SignedInIdentity()
    if user is None: return
	
    print(self.request.body);
    dict = json.loads(self.request.body);
    id = long(dict['id']);
    print(id);
    entry = BoardSpecs(key=db.Key.from_path('BoardSpecs', id));
    entry.delete()
    self.response.write('OK')
    
  
class listSpecsHandler(BaseHandler):
  def get(self):
    user = self.SignedInIdentity()
    if user is None: return

    time.sleep(1)
    entries = db.GqlQuery("SELECT * from BoardSpecs ORDER BY date DESC")
    print('list ', json.dumps([db.to_dict(e) for e in entries]))
    self.response.out.write(json.dumps([db.to_dict(e) for e in entries]))

ROUTES = [
    ('/deleteSpec', deleteSpecHandler),
    ('/saveSpec', saveSpecHandler),
    ('/listSpecs', listSpecsHandler),
    ('/logout', Logout),
    webapp2.Route(r'/login/<:.*>', Login, handler_method='any'),
    ('/.*', MainHandler),
]

app = webapp2.WSGIApplication(ROUTES, debug=True)
