window.onRedirect.push(function () {
    if (window.currentPage != "storage_purchase.html") return;
    else {
        var storageUnitPrice = 2.99,
            vatRate = 20;
        setUtilityVars();
        purchaseStorageNumberInput.onchange = () => {
            purchaseStorageNumber = purchaseStorageNumberInput.valueAsNumber;
            purchasePriceSpan.innerHTML = 'Price per hour (will be added to liabilities upon submission): $' + purchaseStorageNumber * storageUnitPrice * (100 + vatRate) / 100 + '/ hour';
        }
        purchaseSubmitButton.onclick = () => {
            purchaseStorageNumber = purchaseStorageNumberInput.valueAsNumber;
            if (!confirm('Are you sure you want to purchase ' + purchaseStorageNumber + ' storage units for $' + purchaseStorageNumber * storageUnitPrice * (100 + vatRate) / 100 + '/ hour ?')) return;
            request('/users/purchase', null, {
                token: localStorage.getItem('token'),
                amount: purchaseStorageNumber
            }, (success, result, error, e) => {
                if (!success) handleErrors(error);
                else {
                    console.log(result);
                }
            });
        }
    }
});