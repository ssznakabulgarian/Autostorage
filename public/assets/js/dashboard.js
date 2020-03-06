window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "dashboard.html") return;
    setUtilityVars();

    genStorageUnitCards();
    cardsUpdateInterval = setInterval(() => {
        genStorageUnitCards();
    }, 5000);

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
                    clearInterval(cardsUpdateInterval);
                    localStorage.removeItem('token');
                    redirect("login.html");
                });
            }
        }
    }

    if (openProfileEditButton) {
        openProfileEditButton.onclick = function () {
            clearInterval(cardsUpdateInterval);
            redirect("profile.html");
        }
    }
});