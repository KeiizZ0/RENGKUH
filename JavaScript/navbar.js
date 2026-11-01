function navAuth(){
    const tombolNavAuth = document.getElementById('nav-auth');
    
    if (!tombolNavAuth) return; 

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if(currentUser && typeof currentUser.nama === 'string'){
        tombolNavAuth.innerHTML = `<span style="font-weight: bold; margin-right: 10px; font-size: 15px; color: #2F3E46;">
            Hai, ${currentUser.nama}
        </span>
        <a href="#" onclick="logout()" style="background-color: #c0392b; border-color: #c0392b;">Logout</a>`;
    } else {
        tombolNavAuth.innerHTML = `<a href="/auth/login.html">Masuk</a>`;
    }
}

function logout(){
    localStorage.removeItem('currentUser');
    navAuth();
}

navAuth();