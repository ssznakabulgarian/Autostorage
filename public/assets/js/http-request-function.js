function request(url, urlParams, data, onLoad /*(bool success, Object result, String error, Event e)*/ ) {
    var request = new XMLHttpRequest();
    request.addEventListener("load", (e) => {
        try {
            var result = JSON.parse(request.responseText);
        } catch (error) {
            onLoad(false, null, "Invlaid server response: " + error, e);
            return;
        }
        if (result && result.error && result.error.length > 0) {
            onLoad(false, null, result.error, e);
        } else {
            onLoad(true, result.data, null, e);
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