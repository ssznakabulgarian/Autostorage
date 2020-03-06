window.onRedirect.push(function () {
    if (window.currentPage != "liabilities.html") return;
    else {
        setUtilityVars();
        if(cardsUpdateInterval) clearInterval(cardsUpdateInterval);
        if(localStorage.getItem('token')){
            genLiabilitiesTable();
            liabilitiesTableRefreshButton.addEventListener('click', ()=>{
                genLiabilitiesTable();
            });
        }
    }
});