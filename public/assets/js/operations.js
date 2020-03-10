window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "operations_history.html") return;
    
    setUtilityVars();
    genOperationsTable();
    
    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);

    if (operationsTableRefreshButton) {
        operationsTableRefreshButton.addEventListener('click', () => {
            genOperationsTable();
        });
    }
});