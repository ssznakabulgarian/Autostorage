window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "login.html" && window.currentPage != "register.html" && window.currentPage != "forgot-password.html") return;
    setUtilityVars();

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

    if (registerButton) {
        registerButton.addEventListener("click", function (e) {
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
                    redirect('dashboard.html');
                } else {
                    handleErrors(error);
                }
            });
            return false;
        });
    }
});