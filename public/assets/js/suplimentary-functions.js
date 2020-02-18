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
            document.open('text/html');
            document.write(result);
            document.close();
        }
    });
    //!!! store the [static]pages somehow, so they don't !!!
    //!!! have to be loaded with a new request each time !!!
    //on second thoughts the browser already does that so...
}

function handleErrors(errors) {
    console.log(errors);
    errors.forEach(error => {
        var message = '';
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
    });
}

function genStorageUnitCards() {
    var cardType, template, currentCard, nameElement, descriptionElement, statusElement, timeFilledElement, cardsContainerElement;

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
                nameElement = currentCard.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                descriptionElement = currentCard.firstElementChild.firstElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild;
                statusElement = currentCard.firstElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.firstElementChild;
                timeFilledElement = currentCard.firstElementChild.firstElementChild.firstElementChild.lastElementChild.lastElementChild.firstElementChild;
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
                nameElement.parentElement.setAttribute('calss', 'text-uppercase text-' + cardType + ' font-weight-bold mb-1 h-4');

                nameElement.innerHTML = element.name;
                descriptionElement.innerHTML = element.description;
                statusElement.innerHTML = 'status: ' + element.status;
                var timeFilled = new Date;
                timeFilled.setTime(element.time_filled);
                timeFilledElement.innerHTML = 'time filled: ' + timeFilled.toLocaleString();

                cardsContainerElement.appendChild(currentCard);
            });
        }
    });
}