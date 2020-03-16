window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "profile.html") return;

    setUtilityVars();

    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);

    request('/users/read', null, {
        token: localStorage.getItem('token')
    }, (success, result, error, e) => {
        if (!success) handleErrors(error);
        else {
            profileUpdateThumbnail.src = URL.createObjectURL(readArrayBufferAsFile(base64ToArrayBuffer(result.profile_picture)));
            profileUpdateUsernameInput.value = result.username;
            profileUpdateFirstNameInput.value = result.name.first;
            profileUpdateLastNameInput.value = result.name.last;
            profileUpdateEmailInput.value = result.email;
            profileUpdateAddressInput.value = result.address;
        }
    });

    var updates = {};
    updates.token = localStorage.getItem('token');

    profileUpdateFileUploadLabel.onclick = () => {
        profileUpdateFileUpload.click();
    };

    profileUpdateFileUpload.onchange = async function () {
        var fullPath = profileUpdateFileUpload.value;
        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
            document.getElementById('profile-update-file-upload-label').innerHTML = filename;
        }
        profileUpdateThumbnail.src = URL.createObjectURL(profileUpdateFileUpload.files[0]);
        updates.profile_picture = arrayBufferToBase64(await readFileAsArrayBuffer(profileUpdateFileUpload.files[0]));
    };

    profileUpdateFirstNameInput.onchange = profileUpdateFirstNameInput.onkeyup = (e) => {
        if (!updates.hasOwnProperty('name')) updates.name = {};
        updates.name.first = profileUpdateFirstNameInput.value;
    };
    profileUpdateLastNameInput.onchange = profileUpdateLastNameInput.onkeyup = (e) => {
        if (!updates.hasOwnProperty('name')) updates.name = {};
        updates.name.last = profileUpdateLastNameInput.value;
    };
    profileUpdateUsernameInput.onchange = profileUpdateUsernameInput.onkeyup = (e) => {
        updates.username = profileUpdateUsernameInput.value;
    };
    profileUpdateEmailInput.onchange = profileUpdateEmailInput.onkeyup = (e) => {
        updates.email = profileUpdateEmailInput.value;
    };
    profileUpdateAddressInput.onchange = profileUpdateAddressInput.onkeyup = (e) => {
        updates.address = profileUpdateAddressInput.value;
    };

    profileUpdateSubmitButton.onclick = (e) => {
        e.preventDefault();
        request('/users/update', null, updates, (success, result, error, e) => {
            if (!success) handleErrors(error);
            else {
                console.log(result);
            }
        });
    }

});