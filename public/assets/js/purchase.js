window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "storage_purchase.html") return;
    
    setUtilityVars();
    
    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);
    
    var storageUnitPrice = 2.4916,
        vatRate = 20;
    var price = () => {
        purchaseStorageNumber = purchaseStorageNumberInput.valueAsNumber;
        return Math.floor((purchaseStorageNumber * storageUnitPrice * (100 + vatRate) / 100) * 100) / 100;
    }
    purchaseStorageNumberInput.onkeydown = purchaseStorageNumberInput.onkeyup = purchaseStorageNumberInput.onclick = () => {
        purchaseStorageNumber = purchaseStorageNumberInput.valueAsNumber;
        purchasePriceSpan.innerHTML = 'Price per hour (will be added to liabilities upon submission): $' + price() + '/ hour';
    }
    purchaseSubmitButton.onclick = () => {
        purchaseStorageNumber = purchaseStorageNumberInput.valueAsNumber;
        if (!confirm('Are you sure you want to purchase ' + purchaseStorageNumber + ' storage units for $' + price() + '/ hour ?')) return;
        request('/users/purchase', null, {
            token: localStorage.getItem('token'),
            amount: purchaseStorageNumber
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                console.log(result);
                redirect('dashboard.html');
            }
        });
    }
});