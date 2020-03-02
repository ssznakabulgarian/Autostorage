window.onload = function () {
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
}