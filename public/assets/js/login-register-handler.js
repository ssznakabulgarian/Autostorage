var localStorage, loginButton, registerButton, logoutButton, openProfileEditButton;
window.onload = function(){
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    localStorage = window.localStorage;
    logoutButton = document.getElementById("logout-button");
    openProfileEditButton = document.getElementById("open-profile-edit-button");

    if(loginButton){
        loginButton.addEventListener("click", function (e) {
            e.preventDefault();
            var data = {
                username: document.getElementById("username-input").value,
                password: document.getElementById("password-input").value
            };
            request("/users/login", null, data, function (success, result, error, e) {
                if (success) {
                    console.log(result);
                    localStorage.setItem('token', result.token);
                    redirect('dashboard.html');
                } else {
                    handleErrors(error);
                }
            });
            return false;
        });
    }

    if(registerButton){
        registerButton.addEventListener("click", function (e){
            e.preventDefault();

            var data = {
                name: {
                    first: document.getElementById("first-name-input").value,
                    last: document.getElementById("last-name-input").value
                },
                username: document.getElementById("username-input").value,
                password: document.getElementById("password-input").value,
                email: document.getElementById("email-input").value
            };
            request("/users/register", null, data, function (success, result, error, e) {
                if (success) {
                    console.log(result);
                    localStorage.setItem('token', result.token);
                    redirect('login.html');
                } else {
                    handleErrors(error);
                }
            });
            return false;
        });
    }
    
    if(logoutButton){
        logoutButton.onclick = function(){
            if(localStorage.getItem('token')){
                request('/users/logout', null, {token: localStorage.getItem('token')}, (success, result, err, e)=>{
                    if(success){
                        localStorage.removeItem('token');
                        alert("successfully logged out: "+result.name.first+" "+result.name.last);
                        redirect("index.html");
                    }else{
                        handleErrors(err);
                    }
                });
            }
        }
    }
    
    if(openProfileEditButton){
        openProfileEditButton.onclick = function(){
            redirect("profile.html");
        }
    }
}