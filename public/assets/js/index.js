window.onload = function () {
    if(window.localStorage.getItem('token'))redirect('dashboard.html');
    else redirect('login.html');
}