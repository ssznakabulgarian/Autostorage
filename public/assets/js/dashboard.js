window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "dashboard.html") return;
    setUtilityVars();

    genStorageUnitCards();
    cardsUpdateInterval = setInterval(() => {
        genStorageUnitCards();
    }, 5000);

});