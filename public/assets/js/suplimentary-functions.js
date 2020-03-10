window.onRedirect = [];
window.curentPage = "";

function fireRedirect() {
    window.onRedirect.forEach(funct => {
        funct();
    });
}

function request(url, urlParams, data, onLoad /*(bool success, Object result, String error, Event e)*/ ) {
    var request = new XMLHttpRequest();
    request.addEventListener("load", (e) => {
        if (request.getResponseHeader('Content-Type') == 'application/json; charset=utf-8') {
            try {
                var result = JSON.parse(request.responseText);
            } catch (error) {
                onLoad(false, null, ["invlaidServerResponse", error], e);
                return;
            }
            if (result && result.error && result.error.length > 0) {
                onLoad(false, null, result.error, e);
            } else {
                onLoad(true, result.data, null, e);
            }
        } else {
            if (request.responseText) {
                onLoad(true, request.responseText, null, e);
            } else {
                onLoad(false, null, 'emptyResponse', e);
            }
        }
    });
    request.addEventListener("error", (e) => {
        onLoad(false, null, e.error, e);
    });
    if (urlParams) {
        url += (url.indexOf("?") >= 0) ? "&" : "?";
        for (var keyName in urlParams) {
            url += encodeURIComponent(keyName) + "=" + encodeURIComponent(urlParams[keyName]) + "&";
        }
    }
    request.open(data ? "POST" : "GET", url, true);
    if (data) {
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(data));
    } else {
        request.send();
    }
}

function redirect(page) {
    request('/redirect', null, {
        page: page
    }, function (success, result, error, e) {
        if (!success) console.log(error);
        else {
            result = result.substring(result.indexOf('<body'), result.indexOf('</body>'));
            document.body.innerHTML = result;
            window.currentPage = page;
            fireRedirect();
        }
    });
}

function handleErrors(errors) {
    console.log(errors);
    errors.forEach(error => {
        var message = error;
        switch (error) {
            case 'invlaidServerResponse':
                break;
            case 'invalidRequest':
                console.log('An invalid request has been sent!');
                message = 'An unexpected comunications error occured. Please reload and try again.';
                break;
            case 'invalidUsername':
                break;
            case 'invalidEmail':
                break;
            case 'invalidAge':
                break;
            case 'invalidPassword':
                break;
            case 'invalidName':
                break;
            case 'invalidToken':
                break;
            case 'wrongOrExpiredToken':
                break;
            case 'wrongPassword':
                break;
            case 'wrongEmail':
                break;
            case 'wrongUsername':
                break;
            case 'usernameTaken':
                break;
            case 'emailTaken':
                break;
            case 'tooManyFailedLogins':
                break;
            case 'emptyResponse':
                break;
            default:
                //unknown error
                break;
        }
        alert(message);
    });
}

var importCard,
    exportCard,
    importCardTemplate,
    exportCardTemplate,
    dashboardMainContainer,
    storageUnitCard,
    storageUnitCardTemplate,
    isImportDialogueOpen = false,
    isExportDialogueOpen = false,
    isMaintenanceDialogueOpen = false,
    navbarNameElement,
    localStorage,
    loginButton,
    registerButton,
    openProfileEditButton,
    purchasePriceSpan,
    purchaseStorageNumber,
    purchaseStorageNumberInput,
    purchaseSubmitButton,
    maintenanceCard,
    maintenanceCardTemplate,
    cardTimeIntervals = [],
    liabilitiesTableContainer,
    liabilitiesTable,
    liabilitiesTableRow,
    liabilitiesTableRowTemplate,
    operationsTableContainer,
    operationsTable,
    operationsTableRow,
    operationsTableRowTemplate,
    cardsContainerElement,
    liabilitiesTableRefreshButton,
    cardsUpdateInterval;

function setUtilityVars() {
    // ------ window/general ------
    localStorage = window.localStorage;
    navbarNameElement = document.getElementById('navbar-user-name');
    if (navbarNameElement) request('/users/read', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else navbarNameElement.innerHTML = result.name.first + ' ' + result.name.last;
    });
    // ------ dashboard ------
    dashboardMainContainer = document.getElementById('main-cards-container');
    importCard = document.getElementById('import-card');
    exportCard = document.getElementById('export-card');
    maintenanceCard = document.getElementById('maintenance-card');
    storageUnitCard = document.getElementById('storage-unit-card');
    cardsContainerElement = document.getElementById('my-storage-units-crads-container');
    if (importCard) {
        importCardTemplate = importCard.cloneNode(true);
        importCard.parentElement.removeChild(importCard);
    }
    if (exportCard) {
        exportCardTemplate = exportCard.cloneNode(true);
        exportCard.parentElement.removeChild(exportCard);
    }
    if (maintenanceCard) {
        maintenanceCardTemplate = maintenanceCard.cloneNode(true);
        maintenanceCard.parentElement.removeChild(maintenanceCard);
    }
    if (storageUnitCard) {
        storageUnitCardTemplate = storageUnitCard.cloneNode(true);
        storageUnitCard.parentElement.removeChild(storageUnitCard);
    }
    // ------ liabilities ------
    liabilitiesTableContainer = document.getElementById('my-liabilities-table-container');
    liabilitiesTable = document.getElementById('liabilities-table-main');
    liabilitiesTableRow = document.getElementById('liabilities-table-row');
    liabilitiesTableRefreshButton = document.getElementById('liabilities-table-refresh-button');
    if (liabilitiesTableRow) {
        liabilitiesTableRowTemplate = liabilitiesTableRow.cloneNode(true);
        liabilitiesTableRow.parentElement.removeChild(liabilitiesTableRow);
    }
    // ------ operations ------
    operationsTableContainer = document.getElementById('operations-table-container');
    operationsTable = document.getElementById('operations-table-main');
    operationsTableRow = document.getElementById('operations-table-row');
    operationsTableRefreshButton = document.getElementById('operations-table-refresh-button');
    if (operationsTableRow) {
        operationsTableRowTemplate = operationsTableRow.cloneNode(true);
        operationsTableRow.parentElement.removeChild(operationsTableRow);
    }
    // ------ login/register ------
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    // ------ purchse ------
    purchasePriceSpan = document.getElementById('storage-unit-purchase-price-span');
    purchaseStorageNumberInput = document.getElementById('storage-unit-purchase-number');
    purchaseSubmitButton = document.getElementById('storage-unit-purchase-submit-button');
}

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor(duration / (1000 * 60 * 60));

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

function logout() {
    if (localStorage.getItem('token')) {
        request('/users/logout', null, {
            token: localStorage.getItem('token')
        }, (success, result, err, e) => {
            if (!success) handleErrors(err);
            else alert("successfully logged out: " + result.name.first + " " + result.name.last);
            localStorage.removeItem('token');
            redirect("login.html");
        });
    }
}

function closeExportDialogue() {
    var card = document.getElementById('export-card');
    card.parentElement.removeChild(card);
    isExportDialogueOpen = false;
}

function closeImportDialogue() {
    var card = document.getElementById('import-card');
    card.parentElement.removeChild(card);
    isImportDialogueOpen = false;
}

function closeMaintenanceDialogue() {
    var card = document.getElementById('maintenance-card');
    card.parentElement.removeChild(card);
    isMaintenanceDialogueOpen = false;
}

// function setAvailableSlots(element) {
//     var availableSlotsContainer = element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
//     var availableSlotTemplate = element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.cloneNode(true);
//     availableSlotsContainer.removeChild(element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild);
//     request('/warehouse/list_available_slots', null, {
//         data: 'data'
//     }, (success, result, error, e) => {
//         if (!success) handleErrors(error);
//         else {
//             result.forEach(element => {
//                 var availableSlotTmp = availableSlotTemplate.cloneNode(true);
//                 availableSlotTmp.setAttribute('value', element.address);
//                 availableSlotTmp.innerHTML = element.name;
//                 availableSlotsContainer.appendChild(availableSlotTmp);
//             });
//             availableSlotsContainer.firstElementChild.setAttribute('selected', '');
//         }
//     });
// }

function openExportDialogue(item) {
    if (isExportDialogueOpen) closeExportDialogue();
    if (isImportDialogueOpen) closeImportDialogue();
    if (isMaintenanceDialogueOpen) closeMaintenanceDialogue();
    var selectedCardAddress = item.id;
    var tmp = exportCardTemplate.cloneNode(true);
    //  setAvailableSlots(tmp);
    isExportDialogueOpen = true;
    dashboardMainContainer.appendChild(tmp);
    document.getElementById('export-submit-button').addEventListener('click', (e) => {
        e.preventDefault();
        request('/warehouse/export', null, {
            token: localStorage.getItem('token'),
            //  slot: document.getElementById('export-slot-select').value,
            itemAddress: selectedCardAddress
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                console.log(result);
                genStorageUnitCards();
            }
        });
        dashboardMainContainer.removeChild(tmp);
        isExportDialogueOpen = false;
    });
}

function updateCards() {
    if (isExportDialogueOpen) closeExportDialogue();
    if (isImportDialogueOpen) closeImportDialogue();
    if (isMaintenanceDialogueOpen) closeMaintenanceDialogue();
    genStorageUnitCards();
}

function openImportDialogue(item) {
    if (isExportDialogueOpen) closeExportDialogue();
    if (isImportDialogueOpen) closeImportDialogue();
    if (isMaintenanceDialogueOpen) closeMaintenanceDialogue();
    var selectedCardAddress = item.id;
    var tmp = importCardTemplate.cloneNode(true);
    //  setAvailableSlots(tmp);
    isImportDialogueOpen = true;
    dashboardMainContainer.appendChild(tmp);
    document.getElementById('import-submit-button').addEventListener('click', (e) => {
        e.preventDefault();
        request('/warehouse/import', null, {
            token: localStorage.getItem('token'),
            item: {
                name: document.getElementById('import-item-name').value,
                description: document.getElementById('import-item-description').value,
                address: selectedCardAddress
            }
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                console.log(result);
                genStorageUnitCards();
            }
        });
        dashboardMainContainer.removeChild(tmp);
        isImportDialogueOpen = false;
    });
}

function openMaintenanceDialogue(item) {
    if (isMaintenanceDialogueOpen) closeMaintenanceDialogue();
    if (isExportDialogueOpen) closeExportDialogue();
    if (isImportDialogueOpen) closeImportDialogue();
    var selectedCardAddress = item.id;
    var tmp = maintenanceCardTemplate.cloneNode(true);
    dashboardMainContainer.appendChild(tmp);
    isMaintenanceDialogueOpen = true;
    document.getElementById('release-submit-button').addEventListener('click', (e) => {
        e.preventDefault();
        request('/warehouse/release', null, {
            token: localStorage.getItem('token'),
            address: selectedCardAddress
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                console.log(result);
                closeMaintenanceDialogue();
            }
        });
    });
}

function genStorageUnitCards() {
    var cardType, template, currentCard, codeElement, nameElement, descriptionElement, statusElement, timeOwnedElement;

    request('/warehouse/list_storage_units', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else {
            template = storageUnitCardTemplate;
            while (cardsContainerElement.firstChild) cardsContainerElement.removeChild(cardsContainerElement.lastChild);
            while (cardTimeIntervals.length) clearInterval(cardTimeIntervals.pop());

            result.forEach(element => {
                currentCard = template.cloneNode(true);

                nameElement = currentCard.querySelector("#nameElement");
                descriptionElement = currentCard.querySelector("#descriptionElement");
                statusElement = currentCard.querySelector("#statusElement");
                timeOwnedElement = currentCard.querySelector("#timeFilledElement");
                codeElement = currentCard.querySelector("#codeElement");
                currentCard.setAttribute('id', element.address.toString());
                switch (element.status) {
                    case 'vacant':
                        cardType = 'danger';
                        break;
                    case 'occupied':
                        cardType = 'success';
                        break;
                    case 'processing':
                        cardType = 'warning';
                        break;
                    default:
                        cardType = 'primary';
                        break;
                }
                currentCard.firstElementChild.setAttribute('class', 'card shadow border-left-' + cardType + ' py-2');
                nameElement.parentElement.setAttribute('class', 'text-uppercase text-' + cardType + ' font-weight-bold mb-1 h-4');

                nameElement.innerHTML = element.name;
                descriptionElement.innerHTML = element.description;
                currentCard.setAttribute('status', element.status);
                statusElement.innerHTML = 'status: ' + element.status;

                var tmpCopy1 = timeOwnedElement;
                tmpCopy1.innerHTML = 'time used: ' + msToTime(Date.now() - element.time_purchased);
                cardTimeIntervals.push(setInterval(() => {
                    tmpCopy1.innerHTML = 'time used: ' + msToTime(Date.now() - element.time_purchased);
                }, 1000));

                codeElement.innerHTML = (element.operation_code) ? 'code: ' + element.operation_code : '';

                currentCard.oncontextmenu = (e) => {
                    e.preventDefault();
                    return false;
                };
                currentCard.onmousedown = (e) => {
                    var element = e.srcElement;
                    var mouseButton = e.button;
                    while (!element.hasAttribute('status')) element = element.parentElement;

                    if (mouseButton == 0) {
                        switch (element.getAttribute('status')) {
                            case 'vacant':
                                openImportDialogue(element);
                                break;
                            case 'processing':
                                updateCards();
                                break;
                            case 'occupied':
                                openExportDialogue(element);
                                break;
                        }
                    } else if (mouseButton == 2) {
                        openMaintenanceDialogue(element);
                    }
                };

                cardsContainerElement.appendChild(currentCard);
            });
        }
    });
}

function genLiabilitiesTable() {
    var tmp;
    request('/warehouse/list_liabilities', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else {
            while (liabilitiesTable.firstElementChild) {
                liabilitiesTable.removeChild(liabilitiesTable.firstElementChild)
            }
            result.forEach((element) => {
                tmp = liabilitiesTableRowTemplate.cloneNode(true);
                tmp.children[0].innerHTML = element.type;
                tmp.children[1].innerHTML = element.value;
                tmp.children[2].innerHTML = element.state == 'not_paid' ? 'not paid' : 'paid';
                var date = new Date();
                date.setTime(element.date);
                tmp.children[3].innerHTML = date.toLocaleString();
                liabilitiesTable.appendChild(tmp);
            });
        }
    });
}

function genOperationsTable() {
    var tmp;
    request('/warehouse/list_operations', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else {
            while (operationsTable.firstElementChild) {
                operationsTable.removeChild(operationsTable.firstElementChild)
            }
            result.forEach((element) => {
                tmp = operationsTableRowTemplate.cloneNode(true);
                tmp.children[0].innerHTML = element.type;
                tmp.children[1].innerHTML = element.name;
                tmp.children[2].innerHTML = element.status;
                var date = new Date();
                date.setTime(element.time_added);
                tmp.children[3].innerHTML = date.toLocaleString();
                operationsTable.appendChild(tmp);
            });
        }
    });
}