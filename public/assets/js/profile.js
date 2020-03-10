window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "finances.html") return;
    
    setUtilityVars();
    genLiabilitiesTable();
    
    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);

    //profile stuff here
});