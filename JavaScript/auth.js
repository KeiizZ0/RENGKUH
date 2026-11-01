        
        
    function switchForm(tipe){
        const formMasuk = document.getElementById('formMasuk');
        const formDaftar = document.getElementById('formDaftar');
        const btnMasuk = document.getElementById('btnMasuk');
        const btnDaftar = document.getElementById('btnDaftar');
        if(tipe === 'login'){
            formMasuk.classList.remove('hidden');
            formDaftar.classList.add('hidden');
            btnMasuk.classList.add('active');
            btnDaftar.classList.remove('active')
        } else if(tipe === 'register') {
            formMasuk.classList.add('hidden');
            formDaftar.classList.remove('hidden');
            btnMasuk.classList.remove('active');
            btnDaftar.classList.add('active');
        }
    }
    function register(){
        const nama = document.getElementById('reg-nama').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const pesan = document.getElementById('pesanDaftar');

        pesan.textContent = '';
        pesan.style.color = 'red';

        if(!nama || !email || !password){
            pesan.textContent = 'Semua kolom wajib diisi.';
            return;
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            pesan.textContent = 'Format email tidak valid. Contoh: nama@gmail.com.';
            return;
        }

        if(password.length < 8){
            pesan.textContent = 'Password harus terdiri dari minimal 8 karakter.';
            return;
        }

        let users;
        try {
            users = JSON.parse(localStorage.getItem('users') || '[]');
        } catch {
            pesan.textContent = 'Data akun yang tersimpan tidak dapat dibaca. Coba bersihkan data akun browser lalu daftar lagi.';
            return;
        }

        if(!Array.isArray(users)){
            pesan.textContent = 'Format data akun tidak valid. Data akun tidak disimpan.';
            return;
        }

        if(users.some(user => user && typeof user.email === 'string' && user.email.toLowerCase() === email.toLowerCase())){
            pesan.textContent = 'Email ini sudah terdaftar. Gunakan email lain atau masuk ke akun tersebut.';
            return;
        }

        users.push({nama, email, password});
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch {
            pesan.textContent = 'Akun tidak dapat disimpan di browser. Periksa ruang penyimpanan atau pengaturan privasi browser.';
            return;
        }

        document.getElementById('reg-nama').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        pesan.style.color = 'green';
        switchForm('login')
        alert('Akun berhasil dibuat. Silakan masuk dengan email dan password tersebut.');
    }   
    function login(){
        
        const email = document.getElementById('log-email').value;
        const password = document.getElementById('log-password').value;
        const pesan = document.getElementById('pesanMasuk');
        if(!email || !password){
            pesan.textContent = 'Masukkan data lengkap akunmu!';
            pesan.style.color = 'red';
            return;
        }
        let users = JSON.parse(localStorage.getItem('users') || "[]")
        const validUser = users.find(u => u.email === email && u.password === password)
        if(validUser){
            localStorage.setItem('currentUser', JSON.stringify(validUser));
            alert('Login berhasil!')
            window.location.href = '../index.html'
        } else{
            pesan.textContent = 'Email atau Password tidak valid!'
        }
        
    }
