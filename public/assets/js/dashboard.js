window.onRedirect.push(function () {
    if (window.currentPage != "dashboard.html") return;
    
    isExportDialogueOpen=isImportDialogueOpen=isMaintenanceDialogueOpen=false;

    genStorageUnitCards();
    cardsUpdateInterval = setInterval(genStorageUnitCards, 5000);
});