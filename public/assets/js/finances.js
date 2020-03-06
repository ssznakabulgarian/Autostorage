window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "finances.html") return;
    
    setUtilityVars();
    genLiabilitiesTable();
    
    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);
    
    if (navbarNameElement) request('/users/read', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else navbarNameElement.innerHTML = result.name.first + ' ' + result.name.last;
    });

    if (liabilitiesTableRefreshButton) {
        liabilitiesTableRefreshButton.addEventListener('click', () => {
            genLiabilitiesTable();
        });
    }
});