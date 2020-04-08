window.onRedirect.push(function () {
    if (window.currentPage != "finances.html") return;
    
    genLiabilitiesTable();
    liabilitiesTableRefreshButton.addEventListener('click', genLiabilitiesTable);
});