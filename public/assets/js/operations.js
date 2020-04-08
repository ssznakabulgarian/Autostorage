window.onRedirect.push(function () {
    if (window.currentPage != "operations_history.html") return;
    
    genOperationsTable();
    operationsTableRefreshButton.addEventListener('click', genOperationsTable);
});