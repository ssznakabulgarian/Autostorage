function request(url, urlParams, data, onLoad /*(bool success, Object result, String error, Event e)*/ ) {
    var request = new XMLHttpRequest();
    request.addEventListener("load", (e) => {
        if(request.getResponseHeader('Content-Type')=='application/json; charset=utf-8'){
            try {
                var result = JSON.parse(request.responseText);
            } catch (error) {
                onLoad(false, null, ["invlaidServerResponse", error] , e);
                return;
            }
            if (result && result.error && result.error.length > 0) {
                onLoad(false, null, result.error, e);
            } else {
                onLoad(true, result.data, null, e);
            }
        }else{
            if(request.responseText){
                onLoad(true, request.responseText, null, e);
            }else{
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

function redirect(page){
    request('/redirect', null, {page: page}, function(success, result, error, e){
        if(!success) console.log(error);
        else{
            document.open('text/html');
            document.write(result);
            document.close();
        }
    });
    //!!! store the [static]pages somehow, so they don't !!!
    //!!! have to be loaded with a new request each time !!!
}

function handleErrors(errors) {
    errors.forEach(error=>{
        var message='';
        switch (error) {
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
            default:
                //unknown error
                break;
        }
    });
}