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
    //!!! store the [static]pages somehow, so they don't !!!
    //!!! have to be loaded with a new request each time !!!
    //on second thoughts the browser already does that so...
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
    mainContainer,
    isImportDialogueOpen = false,
    isExportDialogueOpen = false,
    navbarNameElement,
    localStorage,
    loginButton,
    registerButton,
    logoutButton,
    openProfileEditButton,
    purchasePriceSpan,
    purchaseStorageNumber,
    purchaseStorageNumberInput,
    purchaseSubmitButton;

function setUtilityVars() {
    mainContainer = document.getElementById('main-cards-container');
    importCard = document.getElementById('import-card');
    exportCard = document.getElementById('export-card');
    if (importCard) {
        importCardTemplate = importCard.cloneNode(true);
        importCard.parentElement.removeChild(importCard);
    }
    if (exportCard) {
        exportCardTemplate = exportCard.cloneNode(true);
        exportCard.parentElement.removeChild(exportCard);
    }
    navbarNameElement = document.getElementById('navbar-user-name');
    logoutButton = document.getElementById("logout-button");
    openProfileEditButton = document.getElementById("open-profile-edit-button");
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    purchasePriceSpan = document.getElementById('storage-unit-purchase-price-span');
    purchaseStorageNumberInput = document.getElementById('storage-unit-purchase-number');
    purchaseSubmitButton = document.getElementById('storage-unit-purchase-submit-button');
    localStorage = window.localStorage;
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function genStorageUnitCards() {

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

    function setAvailableSlots(element) {
        var availableSlotsContainer = element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
        var availableSlotTemplate = element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.cloneNode(true);
        availableSlotsContainer.removeChild(element.firstElementChild.firstElementChild.lastElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild);
        request('/warehouse/list_available_slots', null, {
            data: 'data'
        }, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                result.forEach(element => {
                    var availableSlotTmp = availableSlotTemplate.cloneNode(true);
                    availableSlotTmp.setAttribute('value', element.address);
                    availableSlotTmp.innerHTML = element.name;
                    availableSlotsContainer.appendChild(availableSlotTmp);
                });
                availableSlotsContainer.firstElementChild.setAttribute('selected', '');
            }
        });
    }

    function openExportDialogue(item) {
        if (isExportDialogueOpen) closeExportDialogue();
        if (isImportDialogueOpen) closeImportDialogue();
        var selectedCardAddress = item.id;
        var tmp = exportCardTemplate.cloneNode(true);
        //  setAvailableSlots(tmp);
        isExportDialogueOpen = true;
        setTimeout(() => {
            mainContainer.appendChild(tmp);
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
                mainContainer.removeChild(tmp);
                isExportDialogueOpen = false;
            });
        }, 1000);
    }

    function updateCards() {
        if (isExportDialogueOpen) closeExportDialogue();
        if (isImportDialogueOpen) closeImportDialogue();
        //genStorageUnitCards();
    }

    function openImportDialogue(item) {
        if (isExportDialogueOpen) closeExportDialogue();
        if (isImportDialogueOpen) closeImportDialogue();
        var selectedCardAddress = item.id;
        var tmp = importCardTemplate.cloneNode(true);
        //  setAvailableSlots(tmp);
        isImportDialogueOpen = true;
        setTimeout(() => {
            mainContainer.appendChild(tmp);
            document.getElementById('import-submit-button').addEventListener('click', (e) => {
                e.preventDefault();
                request('/warehouse/import', null, {
                    token: localStorage.getItem('token'),
                    //  slot: document.getElementById('import-slot-select').value,
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
                mainContainer.removeChild(tmp);
                isImportDialogueOpen = false;
            });
        }, 1000);
    }
    //---------------------------------------------------------------------------------------
    var cardType, template, currentCard, codeElement, nameElement, descriptionElement, statusElement, timeOwnedElement, cardsContainerElement;

    cardsContainerElement = document.getElementById('my-storage-units-crads-container');
    request('/warehouse/list', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else {
            template = document.getElementsByClassName('storage-unit-card').item(0).cloneNode(true);
            while (cardsContainerElement.firstChild) {
                cardsContainerElement.removeChild(cardsContainerElement.lastChild);
            }
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
                    case 'taken':
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
                var now = Date.now();
                var timeOwned = now - time_purchased;
                timeOwnedElement.innerHTML = 'time used: ' + msToTime(timeOwned);
                codeElement.innerHTML = (element.operation_code) ? 'code: ' + element.operation_code : '';

                currentCard.addEventListener('click', (e) => {
                    var element = e.srcElement;
                    while (!element.hasAttribute('status')) element = element.parentElement;

                    switch (element.getAttribute('status')) {
                        case 'vacant':
                            openImportDialogue(element);
                            break;
                        case 'processing':
                            updateCards();
                            break;
                        case 'taken':
                            openExportDialogue(element);
                            break;
                    }
                });

                cardsContainerElement.appendChild(currentCard);
            });
        }
    });
}