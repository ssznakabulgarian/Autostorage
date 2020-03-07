window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "operations_history.html") return;
    
    setUtilityVars();
    genOperationsTable();
    
    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);
    
    if (navbarNameElement) request('/users/read', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else navbarNameElement.innerHTML = result.name.first + ' ' + result.name.last;
    });

    if (operationsTableRefreshButton) {
        operationsTableRefreshButton.addEventListener('click', () => {
            genOperationsTable();
        });
    }
});