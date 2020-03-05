window.onRedirect.push(function () {
    if (window.currentPage != "dashboard.html") return;
    else {
        setUtilityVars();

        if (localStorage.getItem('token')) {
            genStorageUnitCards();
        }

        if (navbarNameElement) request('/users/read', null, {
            token: localStorage.getItem('token')
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else navbarNameElement.innerHTML = result.name.first + ' ' + result.name.last;
        });

        if (logoutButton) {
            logoutButton.onclick = function () {
                if (localStorage.getItem('token')) {
                    request('/users/logout', null, {
                        token: localStorage.getItem('token')
                    }, (success, result, err, e) => {
                        if (!success) handleErrors(err);
                        else alert("successfully logged out: " + result.name.first + " " + result.name.last);
                        localStorage.removeItem('token');
                        redirect("login.html");
                    });
                }
            }
        }

        if (openProfileEditButton) {
            openProfileEditButton.onclick = function () {
                redirect("profile.html");
            }
        }
    }
});