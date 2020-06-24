window.onRedirect = [];
window.currentPage = "";

function fireRedirect() {
    if (window.currentPage != "dashboard.html" && cardsUpdateInterval) clearInterval(cardsUpdateInterval);
    if (window.currentPage != "login.html" && window.currentPage != "register.html" && window.currentPage != "forgot-password.html" && !localStorage.getItem('token')) redirect('login.html');
    setUtilityVars();
    window.onRedirect.forEach(eventListener => {
        eventListener();
    });
}

function redirect(page) {
    if (page == window.currentPage) return;
    request('/redirect', null, {
        page: page
    }, function (success, result, errors, e) {
        if (!success) console.log(errors);
        else {
            result = result.substring(result.indexOf('<body'), result.indexOf('<script'));
            document.body.innerHTML = result;
            if (page == "login.html" || page == "register.html" || page == "forgot_password.html") document.body.classList.add("bg-gradient-info");
            else document.body.id = "page-top";
            window.currentPage = page;
            fireRedirect();
        }
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

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var bytes = new Uint8Array(binary_string.length);
    for (var i = 0; i < binary_string.length; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        var fileReader = new FileReader();
        fileReader.addEventListener('error', () => {
            reject(fileReader.error);
        });
        fileReader.addEventListener('load', () => {
            resolve(fileReader.result);
        });
        fileReader.readAsArrayBuffer(file);
    });
}

function readArrayBufferAsFile(buffer) {
    return new Blob([buffer]);
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

function handleErrors(errors) {
    console.log(errors);
    errors.forEach(error => {
        var message = error;
        switch (error) {
            case 'invlaidServerResponse':
                break;
            case 'invalidRequest':
                //console.log('An invalid request has been sent!');
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
                setTimeout(() => {
                    redirect('login.html');
                }, 2000);
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
    navbarImageElement,
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
    profileUpdateFileUpload,
    profileUpdateFirstNameInput,
    profileUpdateLastNameInput,
    profileUpdateEmailInput,
    profileUpdateUsernameInput,
    profileUpdateAddressInput,
    profileUpdatePasswordWarning,
    profileUpdatePasswordInput,
    profileUpdateRepeatPasswordInput,
    profileUpdateSubmitButton,
    profileUpdateFileUploadLabel,
    profileUpdateThumbnail,
    resetPasswordEmailInput,
    resetPasswordButton,
    cardsUpdateInterval,
    storageUnitPrice = 2.4916,
    vatRate = 20,
    QRCodeVideo;

function setUtilityVars() {
    // ------ window/general ------
    localStorage = window.localStorage;
    navbarNameElement = document.getElementById('navbar-username');
    navbarImageElement = document.getElementById('navbar-profile-picture');
    if (navbarNameElement) request('/users/read', null, {
        token: localStorage.getItem('token')
    }, (success, result, errors, e) => {
        if (!success) handleErrors(errors);
        else {
            navbarNameElement.innerHTML = result.name.first + ' ' + result.name.last;
            navbarImageElement.src = URL.createObjectURL(readArrayBufferAsFile(base64ToArrayBuffer(result.profile_picture)));
        }
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
    // ------ login/register/reset ------
    loginButton = document.getElementById("login-button");
    registerButton = document.getElementById("register-button");
    resetPasswordButton = document.getElementById("reset-password-button");
    resetPasswordEmailInput = document.getElementById("reset-password-email");
    // ------ profile update ------
    profileUpdateFileUpload = document.getElementById('profile-update-file-upload');
    profileUpdateFirstNameInput = document.getElementById('profile-update-first-name-input');
    profileUpdateLastNameInput = document.getElementById('profile-update-last-name-input');
    profileUpdateEmailInput = document.getElementById('profile-update-email-input');
    profileUpdateUsernameInput = document.getElementById('profile-update-username-input');
    profileUpdatePasswordWarning = document.getElementById('profile-update-password-match-warning');
    profileUpdatePasswordInput = document.getElementById('profile-update-password-input');
    profileUpdateRepeatPasswordInput = document.getElementById('profile-update-repeat-password-input');
    profileUpdateAddressInput = document.getElementById('profile-update-address-input');
    profileUpdateSubmitButton = document.getElementById('profile-update-submit-button');
    profileUpdateFileUploadLabel = document.getElementById('profile-update-file-upload-label');
    profileUpdateThumbnail = document.getElementById('profile-update-thumbnail');
    // ------ purchse ------
    purchasePriceSpan = document.getElementById('storage-unit-purchase-price-span');
    purchaseStorageNumberInput = document.getElementById('storage-unit-purchase-number');
    purchaseSubmitButton = document.getElementById('storage-unit-purchase-submit-button');
}

function logout() {
    if (localStorage.getItem('token')) {
        request('/users/logout', null, {
            token: localStorage.getItem('token')
        }, (success, result, errors, e) => {
            if (!success) handleErrors(errors);
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
    if (QRCodeVideo && QRCodeVideo.srcObject) QRCodeVideo.srcObject.getTracks().forEach((track) => {
        track.stop();
    });
    var card = document.getElementById('import-card');
    card.parentElement.removeChild(card);
    isImportDialogueOpen = false;
}

function closeMaintenanceDialogue() {
    var card = document.getElementById('maintenance-card');
    card.parentElement.removeChild(card);
    isMaintenanceDialogueOpen = false;
}

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
            item: {
                address: selectedCardAddress
            }
        }, (success, result, errors, e) => {
            if (!success) handleErrors(errors);
            else {
                console.log(result);
                genStorageUnitCards();
            }
            closeExportDialogue();
        });
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
    isImportDialogueOpen = true;
    var operationCode = null;
    var useQRCodeButton = tmp.querySelector('#import-use-QR-code');
    var useNumberCodeButton = tmp.querySelector('#import-use-number-code');
    var printQRcodeIframe = tmp.querySelector('#import-QR-code-print-iframe');
    var printQRcodeSizeInput = tmp.querySelector('#import-QR-code-print-size-input');
    var printQRcodeButton = tmp.querySelector("#import-print-QR-code-button");
    var QRCodeInputBody = tmp.querySelector('#import-QR-code-input-body');
    var printQRcodeBody = tmp.querySelector('#import-print-QR-code-body');
    var numberCodeInput = tmp.querySelector('#import-number-code-input');
    QRCodeVideo = tmp.querySelector('#import-card-video');
    var QRCodeCanvas = tmp.querySelector('#import-card-canvas');
    numberCodeInput.value = operationCode = Math.round(Math.random() * 8999999) + 1000000;
    useQRCodeButton.onclick = function () {
        document.getElementById("import-use-number-code-radio-input").removeAttribute('checked');
        document.getElementById("import-use-QR-code-radio-input").setAttribute('checked', '');
        QRCodeInputBody.style = 'display: inline-block';
        printQRcodeBody.style = 'display: none';

        var ctx = QRCodeCanvas.getContext('2d');
        var decoder = new Worker('assets/js/decoder.js');

        function updatePrintPreview() {
            printQRcodeIframe.src = "https://api.qrserver.com/v1/create-qr-code/?size=" + printQRcodeSizeInput.value + "x" + printQRcodeSizeInput.value + "&data=" + numberCodeInput.value;
        }

        numberCodeInput.addEventListener('change', ()=>{updatePrintPreview();});
        numberCodeInput.addEventListener('keyup', ()=>{updatePrintPreview();});
        numberCodeInput.addEventListener('mouseup', ()=>{updatePrintPreview();});
        printQRcodeSizeInput.addEventListener('change', ()=>{updatePrintPreview();});
        printQRcodeSizeInput.addEventListener('keyup', ()=>{updatePrintPreview();});
        printQRcodeSizeInput.addEventListener('mouseup', ()=>{updatePrintPreview();});

        printQRcodeButton.onclick = () => {
            printQRcodeIframe.contentWindow.print();
        }

        function foundCode(code) {
            operationCode = code;
            console.log(code);

            if (isNaN(code)) alert('Your code must contain only numbers!\ncode: ' + code);
            else {
                numberCodeInput.value = operationCode;
                updatePrintPreview();
            }
        }

        function startCapture(constraints) {
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    QRCodeVideo.srcObject = stream;
                    QRCodeVideo.setAttribute('playsinline', true);
                    QRCodeVideo.setAttribute('controls', true);
                    setTimeout(() => {
                        document.querySelector('video').removeAttribute('controls');
                    });
                })
                .catch(function (err) {
                    handleErrors([err]);
                });
        }

        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                var device = devices.filter(function (device) {
                    if (device.kind == 'videoinput') {
                        return device;
                    }
                });
                var constraints;
                if (device.length > 1) {
                    constraints = {
                        video: {
                            mandatory: {
                                sourceId: device[1].deviceId ? device[1].deviceId : null
                            }
                        },
                        audio: false
                    };
                    if (window.iOS) {
                        constraints.video.facingMode = 'environment';
                    }
                } else if (device.length) {
                    constraints = {
                        video: {
                            mandatory: {
                                sourceId: device[0].deviceId ? device[0].deviceId : null
                            }
                        },
                        audio: false
                    };
                    if (window.iOS) {
                        constraints.video.facingMode = 'environment';
                    }
                } else {
                    // constraints = {
                    //     video: true
                    // };
                }
                constraints = {
                    video: true
                };

                startCapture(constraints);
            });

        decoder.onmessage = (e) => {
            if (e.data.length > 0) foundCode(e.data[0][2]);
            setTimeout(decodeFrame, 0);
        }

        function decodeFrame() {
            try {
                ctx.drawImage(QRCodeVideo, 0, 0, QRCodeCanvas.width, QRCodeCanvas.height);
                var imgData = ctx.getImageData(0, 0, QRCodeCanvas.width, QRCodeCanvas.height);

                if (imgData.data) {
                    decoder.postMessage(imgData);
                }
            } catch (e) {
                console.log(e);

                // Try-Catch to circumvent Firefox Bug #879717
                if (e.name == 'NS_ERROR_NOT_AVAILABLE') setTimeout(decodeFrame, 0);
            }
        };

        decodeFrame();
    }
    useNumberCodeButton.onclick = function () {
        document.getElementById("import-use-number-code-radio-input").setAttribute('checked', '');
        document.getElementById("import-use-QR-code-radio-input").removeAttribute('checked');
        printQRcodeBody.style = 'display: inline-block';
        QRCodeInputBody.style = 'display: none';
        if (QRCodeVideo) QRCodeVideo.srcObject.getTracks().forEach((track) => {
            track.stop();
        });
    }
    numberCodeInput.onclick = numberCodeInput.onkeyup = () => {
        operationCode = numberCodeInput.value;
    }
    dashboardMainContainer.appendChild(tmp);
    document.getElementById('import-submit-button').addEventListener('click', (e) => {
        e.preventDefault();
        if (!operationCode) alert('You must enter a number code or scan a QR code.');
        else {
            QRCodeVideo.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
            request('/warehouse/import', null, {
                token: localStorage.getItem('token'),
                item: {
                    name: document.getElementById('import-item-name').value,
                    description: document.getElementById('import-item-description').value,
                    address: selectedCardAddress
                },
                code: operationCode
            }, (success, result, errors, e) => {
                if (!success) handleErrors(errors);
                else {
                    console.log(result);
                    closeImportDialogue();
                    genStorageUnitCards();
                }
            });
        }
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
    if (item.getAttribute('status') == 'processing') {
        document.getElementById('release-storage-unit-button').setAttribute('disabled', '');
        document.getElementById('cancel-operation-button').addEventListener('click', (e) => {
            e.preventDefault();
            request('/warehouse/cancel_operation', null, {
                token: localStorage.getItem('token'),
                address: selectedCardAddress
            }, (success, result, errors, e) => {
                if (!success) handleErrors(errors);
                else {
                    console.log(result);
                    closeMaintenanceDialogue();
                    genStorageUnitCards();
                }
            });
        });
    } else {
        document.getElementById('cancel-operation-button').setAttribute('disabled', '');
        document.getElementById('release-storage-unit-button').addEventListener('click', (e) => {
            e.preventDefault();
            request('/warehouse/release', null, {
                token: localStorage.getItem('token'),
                address: selectedCardAddress
            }, (success, result, errors, e) => {
                if (!success) handleErrors(errors);
                else {
                    console.log(result);
                    closeMaintenanceDialogue();
                    genStorageUnitCards();
                }
            });
        });
    }
}

function genStorageUnitCards() {
    var cardType, template, currentCard, codeElement, nameElement, descriptionElement, statusElement, timeOwnedElement;

    request('/warehouse/list_storage_units', null, {
        token: localStorage.getItem('token')
    }, (success, result, errors, e) => {
        if (!success) handleErrors(errors);
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
    request('/warehouse/list_liabilities', null, {
        token: localStorage.getItem('token')
    }, (success, result, errors, e) => {
        if (!success) handleErrors(errors);
        else {
            while (liabilitiesTable.firstElementChild) {
                liabilitiesTable.removeChild(liabilitiesTable.firstElementChild)
            }

            function addEntry(element) {
                var tmp;
                tmp = liabilitiesTableRowTemplate.cloneNode(true);
                tmp.children[0].innerHTML = element.type;
                tmp.children[1].innerHTML = element.item_name;
                tmp.children[2].innerHTML = element.value;
                tmp.children[3].innerHTML = element.state == 'not_paid' ? 'not paid' : 'paid';
                var date = new Date();
                date.setTime(element.date);
                tmp.children[4].innerHTML = date.toLocaleString();
                liabilitiesTable.appendChild(tmp);
            };
            request('/warehouse/list_storage_units', null, {
                token: localStorage.getItem('token')
            }, (success, result1, error, e) => {
                if (!success) handleErrors(error);
                else {
                    result1.forEach((element) => {
                        addEntry({
                            type: 'storage unit (price until ' + new Date().toLocaleString() + ')',
                            item_name: element.name,
                            value: '$' + Math.round(Math.floor((Date.now() - element.time_purchased) / (1000 * 60 * 60)) * storageUnitPrice * (100 + vatRate)) / 100,
                            state: 'not_paid',
                            date: Date.now()
                        });
                    });
                }
            });
            result.forEach((element) => {
                addEntry(element);
            });
        }
    });
}

function genOperationsTable() {
    request('/warehouse/list_operations', null, {
        token: localStorage.getItem('token')
    }, (success, result, errors, e) => {
        if (!success) handleErrors(errors);
        else {
            while (operationsTable.firstElementChild) {
                operationsTable.removeChild(operationsTable.firstElementChild)
            }
            result.forEach((element) => {
                var tmp;
                tmp = operationsTableRowTemplate.cloneNode(true);
                tmp.children[0].innerHTML = element.type;
                tmp.children[1].innerHTML = element.item_name;
                tmp.children[2].innerHTML = element.status;
                var date = new Date();
                date.setTime(element.time_added);
                tmp.children[3].innerHTML = date.toLocaleString();
                operationsTable.appendChild(tmp);
            });
        }
    });
}