 
 function validateEmail(emailField, errorField) 
 { 
 matchResult = 
 emailField.value.match('([a-z]|[0-9])+@([a-z]|[0-9])+\.com'); 
 if (matchResult != null) 
 { 
 errorField.innerHTML = ""; 
 } 
 else 
 { 
 errorField.innerHTML = 
 "email address is not in valid format"; 
 } 
 } 
