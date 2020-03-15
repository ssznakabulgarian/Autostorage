window.onRedirect.push(function () {
    if (!localStorage.getItem('token')) return;
    if (window.currentPage != "profile.html") return;

    setUtilityVars();

    if (cardsUpdateInterval) clearInterval(cardsUpdateInterval);

    var fileReader = new FileReader();

    profileUpdateFileUploadLabel.onclick = ()=>{
        profileUpdateFileUpload.click();
    };

    profileUpdateFileUpload.onchange = function(){
        var fullPath = profileUpdateFileUpload.value;
        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
            document.getElementById('profile-update-file-upload-label').innerHTML=filename;
        }
        console.log(profileUpdateFileUpload.files[0]);
        profileUpdateThumbnail.src = URL.createObjectURL(profileUpdateFileUpload.files[0]);
    };
    
});