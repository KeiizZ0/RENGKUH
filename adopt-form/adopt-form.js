// ===== STATE =====
var namaHewan = "Mochi";   // diganti otomatis dari data hewan yang dipilih
var idHewan = "";

// ===== ISI HALAMAN DENGAN DATA HEWAN =====
function terapkanHewan(hewan) {
    namaHewan = hewan.nama;
    idHewan = String(hewan.id);

    // semua teks nama hewan
    var daftarNama = document.querySelectorAll(".nama-hewan");
    for (var i = 0; i < daftarNama.length; i++) {
        daftarNama[i].textContent = hewan.nama;
    }

    // foto: URL penuh dipakai langsung, selain itu ambil dari folder Assets
    var fotoSumber = hewan.gambar || "";
    if (Array.isArray(hewan.foto) && hewan.foto.length > 0) {
        fotoSumber = hewan.foto[0];
    }
    if (fotoSumber !== "" && fotoSumber.indexOf("http") !== 0) {
        fotoSumber = "../Assets/" + fotoSumber;
    }
    var foto = document.getElementById("foto-hewan");
    if (fotoSumber !== "") {
        foto.src = fotoSumber;
    }
    foto.alt = "Foto " + hewan.nama + ", " + hewan.jenis + " " + hewan.ras;

    document.getElementById("hewan-ras").textContent = hewan.jenis + " \u2022 " + hewan.ras;
    document.getElementById("id-hewan").value = idHewan;
    document.getElementById("link-kembali-profil").href = "../pet-detail/pet-detail.html?id=" + encodeURIComponent(idHewan);
    document.title = "Adopsi " + hewan.nama + " - RENGKUH";
}

// ===== AMBIL HEWAN DARI URL (?id=...) =====
function muatHewan() {
    var parameterURL = new URLSearchParams(window.location.search);
    var idDipilih = parameterURL.get("id");

    fetch("../data/pets.json")
        .then(function (res) {
            if (!res.ok) {
                throw new Error("pets.json tidak ditemukan");
            }
            return res.json();
        })
        .then(function (daftar) {
            var hewan = null;
            for (var i = 0; i < daftar.length; i++) {
                if (String(daftar[i].id) === String(idDipilih)) {
                    hewan = daftar[i];
                }
            }
            if (hewan === null) {
                hewan = daftar[0]; // id tidak ada di URL: pakai hewan pertama
            }
            terapkanHewan(hewan);
        })
        .catch(function (err) {
            console.error(err);
        });
}

// ===== VALIDASI SEMUA ISIAN SEKALIGUS =====
function validasiForm() {
    var errors = [];

    // --- text field ---
    var nama = document.getElementById("nama").value.trim();
    var email = document.getElementById("email").value.trim();
    var alasan = document.getElementById("alasan").value.trim();

    if (nama === "") {
        errors.push("Nama lengkap wajib diisi.");
    }

    if (email === "") {
        errors.push("Email wajib diisi.");
    } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
        errors.push("Format email belum benar, contoh: nama@email.com.");
    }

    var telepon = document.getElementById("telepon").value.trim();
    var digit = telepon.replace(/[\s-]/g, "");
    if (telepon === "") {
        errors.push("Nomor WhatsApp wajib diisi.");
    } else if (isNaN(digit)) {
        errors.push("Nomor WhatsApp hanya boleh berisi angka.");
    } else if (digit.length < 10 || digit.length > 15) {
        errors.push("Nomor WhatsApp harus 10 sampai 15 digit.");
    }

    if (alasan === "") {
        errors.push("Alasan ingin mengadopsi wajib diisi.");
    } else if (alasan.length < 20) {
        errors.push("Alasan terlalu singkat, tulis minimal 20 karakter.");
    }

    // --- radio button: dicek null dulu ---
    var tempat = document.querySelector('input[name="tempat"]:checked');
    if (tempat === null) {
        errors.push("Pilih jenis tempat tinggal.");
    }

    if (document.getElementById("kepemilikan").value === "") {
        errors.push("Pilih status tempat tinggal.");
    }

    // .value selalu String, ubah ke angka dengan parseInt
    var anggota = parseInt(document.getElementById("anggota").value);
    if (isNaN(anggota)) {
        errors.push("Jumlah anggota rumah harus berupa angka.");
    } else if (anggota < 1 || anggota > 20) {
        errors.push("Jumlah anggota rumah harus antara 1 sampai 20.");
    }

    if (document.getElementById("sendirian").value === "") {
        errors.push("Pilih berapa lama hewan ditinggal sendiri.");
    }

    if (document.getElementById("pengalaman").value.trim() === "") {
        errors.push("Pengalaman merawat hewan wajib diisi.");
    }

    // --- tanggal & waktu ---
    var tanggal = document.getElementById("tanggal").value;
    if (tanggal === "") {
        errors.push("Tanggal bertemu " + namaHewan + " wajib dipilih.");
    } else {
        var dipilih = new Date(tanggal);
        var hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);
        if (dipilih < hariIni) {
            errors.push("Tanggal tidak boleh sebelum hari ini.");
        }
    }

    if (document.getElementById("waktu").value === "") {
        errors.push("Pilih waktu kunjungan.");
    }

    // --- checkbox tunggal: pakai .checked ---
    if (document.getElementById("setuju-rawat").checked === false) {
        errors.push("Centang komitmen merawat " + namaHewan + ".");
    }
    if (document.getElementById("setuju-kunjungan").checked === false) {
        errors.push("Centang persetujuan kunjungan tim Rengkuh.");
    }

    // tampilkan semua pesan dengan textContent
    document.getElementById("error-form").textContent = errors.join("\n");

    return errors.length === 0;
}

// ===== TAMPILKAN HALAMAN SUKSES + RINGKASAN =====
function tampilkanSukses() {
    var nama = document.getElementById("nama").value.trim();
    var email = document.getElementById("email").value.trim();
    var tempat = document.querySelector('input[name="tempat"]:checked').value;
    var anggota = parseInt(document.getElementById("anggota").value);

    // checkbox banyak: querySelectorAll + perulangan
    var hewanDicentang = document.querySelectorAll('input[name="hewan_lain"]:checked');
    var daftarHewan = [];
    for (var i = 0; i < hewanDicentang.length; i++) {
        daftarHewan.push(hewanDicentang[i].value);
    }
    var teksHewan = "Tidak ada";
    if (daftarHewan.length > 0) {
        teksHewan = daftarHewan.join(", ");
    }

    var tanggal = new Date(document.getElementById("tanggal").value);
    var teksTanggal = tanggal.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    var waktu = document.getElementById("waktu").value;

    document.getElementById("sukses-judul").textContent = "Terima kasih, " + nama + "!";
    document.getElementById("r-hewan-adopsi").textContent = namaHewan;
    document.getElementById("r-nama").textContent = nama;
    document.getElementById("r-email").textContent = email;
    document.getElementById("r-tempat").textContent = tempat;
    document.getElementById("r-anggota").textContent = anggota + " orang";
    document.getElementById("r-hewan").textContent = teksHewan;
    document.getElementById("r-jadwal").textContent = teksTanggal + ", " + waktu;
    document.getElementById("r-telepon").textContent = document.getElementById("telepon").value.trim();

    document.getElementById("area-form").style.display = "none";
    document.getElementById("sukses").style.display = "block";
    window.scrollTo(0, 0);
}

// ===== EVENT SUBMIT =====
document.getElementById("form-adopsi").addEventListener("submit", function (e) {
    e.preventDefault(); // cegah halaman dimuat ulang

    if (validasiForm() === false) {
        document.getElementById("error-form").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    tampilkanSukses();
});

// tanggal minimal = hari ini
var hariIniStr = new Date().toISOString().split("T")[0];
document.getElementById("tanggal").min = hariIniStr;

// jalankan saat halaman dibuka
muatHewan();