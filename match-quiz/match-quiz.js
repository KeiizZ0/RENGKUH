//data pertanyaan

const daftarPertanyaan = [
    {
        id: "tempatTinggal",
        teks: "Seperti apa tempat tinggalmu?",
        opsi: [
            { value: "Apartemen", label: "Apartemen / Kos", desc: "Ruang terbatas, tanpa halaman", icon: "🏢" },
            { value: "Rumah tanpa halaman", label: "Rumah tanpa halaman", desc: "Ada ruang, tapi tanpa halaman", icon: "🏠" },
            { value: "Rumah dengan halaman", label: "Rumah dengan halaman", desc: "Ada area luas untuk bermain", icon: "🌳" }
        ]
    },
    {
        id: "bolehPelihara",
        teks: "Apakah tempat tinggalmu memperbolehkan memelihara hewan?",
        opsi: [
            { value: "Ya", label: "Ya, boleh", desc: "Tidak ada aturan melarang", icon: "✅" },
            { value: "Tidak", label: "Tidak boleh", desc: "Ada aturan ketat", icon: "❌" }
        ]
    },
    {
        id: "waktuSendiri",
        teks: "Berapa lama hewan akan ditinggal sendirian di rumah setiap hari?",
        opsi: [
            { value: "Kurang dari 2 jam", label: "Kurang dari 2 jam", desc: "Sering ada di rumah", icon: "⏱️" },
            { value: "2 - 5 jam", label: "2 - 5 jam", desc: "Bekerja paruh waktu", icon: "🕒" },
            { value: "Lebih dari 5 jam", label: "Lebih dari 5 jam", desc: "Bekerja penuh waktu", icon: "🌙" }
        ]
    },
    {
        id: "punyaAnak",
        teks: "Apakah kamu memiliki anak kecil di rumah (di bawah 10 tahun)?",
        opsi: [
            { value: "Ya", label: "Ya, ada anak kecil", desc: "Perlu hewan yang ramah anak", icon: "👶" },
            { value: "Tidak", label: "Tidak ada", desc: "Hanya orang dewasa", icon: "🧑" }
        ]
    },
    {
        id: "punyaHewanLain",
        teks: "Apakah kamu sudah memiliki hewan peliharaan lain?",
        opsi: [
            { value: "Ya", label: "Ya, sudah ada", desc: "Perlu sosialisasi antar hewan", icon: "🐾" },
            { value: "Tidak", label: "Belum ada", desc: "Ini hewan pertamaku", icon: "🚫" }
        ]
    },
    {
        id: "pengalaman",
        teks: "Bagaimana pengalamanmu memelihara hewan?",
        opsi: [
            { value: "Pemula", label: "Pemula", desc: "Belum pernah atau baru sedikit", icon: "🌱" },
            { value: "Berpengalaman", label: "Berpengalaman", desc: "Sudah sering memelihara", icon: "⭐" }
        ]
    },
    {
        id: "budget",
        teks: "Berapa budget bulanan yang siap kamu keluarkan untuk hewan?",
        opsi: [
            { value: "Rp150.000 - Rp350.000", label: "Rp150rb - Rp350rb", desc: "Budget standar", icon: "💵" },
            { value: "Rp350.000 - Rp500.000", label: "Rp350rb - Rp500rb", desc: "Budget menengah", icon: "💳" },
            { value: "Lebih dari Rp500.000", label: "Di atas Rp500rb", desc: "Budget premium", icon: "💎" }
        ]
    },
    {
        id: "alasan",
        teks: "Apa alasan utama kamu ingin mengadopsi hewan?",
        opsi: [
            { value: "Teman bermain", label: "Teman bermain", desc: "Untuk menemani aktivitas", icon: "🎾" },
            { value: "Menemani", label: "Menemani", desc: "Mengurangi kesepian", icon: "🤝" },
            { value: "Hobi", label: "Hobi", desc: "Suka memelihara hewan", icon: "🎨" }
        ]
    }
]

let indeksPertanyaan = 0;
let jawabanUser = {}
let dataHewan = []

//elemen Jquery

const $teksProgress = $('#teks-progress')
const $isiProgress = $('#progress-isi')
const $bagianKuesioner = $('#bagian-kuesioner')
const $teksPertanyaan = $('#teks-pertanyaan')
const $containerOpsi = $('#container-opsi')
const $tombolLanjut = $('#tombol-lanjut')
const $bagianHasil = $('#bagian-hasil')
const $ringkasanProfil = $('#ringkasan-profil')
const $containerHewan = $('#container-hewan')
const $tombolUlangi = $('#tombol-ulangi')


function renderPertanyaan(){
    let pertanyaanAktif = daftarPertanyaan[indeksPertanyaan]

    $teksPertanyaan.text(pertanyaanAktif.teks)
    $teksProgress.text(`Pertanyaan ${indeksPertanyaan + 1} dari ${daftarPertanyaan.length}`)
    $isiProgress.css('width', `${((indeksPertanyaan + 1) / daftarPertanyaan.length) * 100}%`);

    //reset tombol lanjut juga kosongin container
    $tombolLanjut.prop('disabled', true)
    $containerOpsi.empty()

    //misal i=0, opsi value "Apartemen"
    //render opsi
    $.each(pertanyaanAktif.opsi, function(i, opsi){
        const $tombol = $('<button>', {
            class: 'quiz-option-btn',
            html: `
            <div class="quiz-option-icon">${opsi.icon}</div>
                <div class="quiz-option-text">
                    <strong>${opsi.label}</strong>
                    <span>${opsi.desc}</span>
                </div>
            `
        })
        //kalau jawaban user sama dengan opsi tombol yang di render akan diberi class selected
        if(jawabanUser[pertanyaanAktif.id] === opsi.value){
            $tombol.addClass('selected')
            $tombolLanjut.prop('disabled', false)
        }

        //event click
        $tombol.on('click', function(){
            pilihOpsi(opsi.value,  $(this), pertanyaanAktif.id)
        })

        //masukkan $tombol opsi jawaban user ke containerOpsi
        $containerOpsi.append($tombol)
    })
}

function pilihOpsi(opsiValue, $elemenTombol, idPertanyaan){
    jawabanUser[idPertanyaan] = opsiValue;

    //reset semua tombol. tandai tombol yang dipilih
    $('.quiz-option-btn').removeClass('selected')
    $elemenTombol.addClass('selected')

    $tombolLanjut.prop('disabled', false);
}

//Untuk tombol lanjut
$tombolLanjut.on('click', function(){
    if(indeksPertanyaan < daftarPertanyaan.length -1){
        indeksPertanyaan++
        renderPertanyaan();
    } else {
        tampilkanHasil()
    }
})

//Tampilkan hasil dari kuesioner
async function tampilkanHasil(){
    $bagianKuesioner.addClass('hidden')
    $bagianHasil.removeClass('hidden')

    renderRingkasanProfile()

    //ambil atau fetch data hewan, async = menunggu waktu proses karena ada await
    if(dataHewan.length == 0){
        try{
            const response = await fetch('../data/pets.json')
            dataHewan = await response.json()
        } catch (error){
            console.log("Gagal mengambil data hewan", error);
            $containerHewan.html("<p>Gagal memuat data hewan</p>")
            return;
        }
    }

    const hewanCocok = cocokHewan(dataHewan, jawabanUser)
    renderKartuHewan(hewanCocok)
}

function renderRingkasanProfile(){
    $ringkasanProfil.empty()

    //dari seluruh jawaban user{} key = tempatTinggal value = Rumah dengan halaman
    $.each(jawabanUser, function(key, value){

        //cari dari daftarPertanyaan id yang sama dengan key, cari id dideklarasi oleh 'pertanyaan'
        const pertanyaanObj =daftarPertanyaan.find((pertanyaan => pertanyaan.id == key))

        //kalau true tampilkan teks pertanyaan, false key sebagaia pengganti
        const teksPertanyaan = pertanyaanObj ? pertanyaanObj.teks : key;

        $ringkasanProfil.append(`
            <div class="hasil-ringkasan-item">
                <small>${teksPertanyaan}</small>
                <p><strong>${value}</strong></p>
            </div>
        `)
    })
}

function cocokHewan(hewan, jawaban){

    //filter json data hewan return untuk ke renderKartuHewan(hewan)
    return hewan.filter(h =>{
        let cocok = true;

         // 1. Tempat tinggal (array)
        if (jawaban.tempatTinggal && h.traits.tempatTinggal) {
            if (!h.traits.tempatTinggal.includes(jawaban.tempatTinggal)) cocok = false;
        }

        // 2. Boleh pelihara (boolean)
        if (jawaban.bolehPelihara && h.traits.bolehPelihara !== undefined) {
            const userBoleh = jawaban.bolehPelihara === "Ya";
            if (h.traits.bolehPelihara !== userBoleh) cocok = false;
        }

        // 3. Waktu sendiri............................................................................................................................................................................................................................................................................................
        // cek user udah jawab atau belum jika user menjawab pertanyaan waktuSendiri dan data hewa juga ada waktu Sendiri yang sama
        if (jawaban.waktuSendiri && h.traits.waktuSendiri) { 

            //cek user sering ninggalin rumah tapi hewan butuh ditemnani
            if (jawaban.waktuSendiri === "Lebih dari 5 jam" && h.traits.waktuSendiri === "Kurang dari 2 jam") {
                cocok = false;
            }
        }

        // 4. Punya anak
        if (jawaban.punyaAnak && h.traits.punyaAnak !== undefined) {
            const userPunyaAnak = jawaban.punyaAnak === "Ya";
            if (userPunyaAnak && h.traits.punyaAnak === false) cocok = false;
        }

        // 5. Punya hewan lain
        if (jawaban.punyaHewanLain && h.traits.punyaHewanLain !== undefined) {
            const userPunyaHewan = jawaban.punyaHewanLain === "Ya";
            if (userPunyaHewan && h.traits.punyaHewanLain === false) cocok = false;
        }

        // 6. Pengalaman
        if (jawaban.pengalaman && h.traits.pengalaman) {
            if (jawaban.pengalaman === "Pemula" && h.traits.pengalaman === "Berpengalaman") cocok = false;
        }

        // 7. Budget
        if (jawaban.budget && h.traits.budget) {
            if (jawaban.budget !== h.traits.budget) cocok = false;
        }

        // 8. Alasan
        if (jawaban.alasan && h.traits.alasan) {
            if (jawaban.alasan !== h.traits.alasan) cocok = false;
        }

        return cocok;
    })
}


//render kartu hewan hasil filter
function renderKartuHewan(hewan){
    $containerHewan.empty()

    //kalau hasil filter ga ada yang match
    if(hewan.length == 0){
        $containerHewan.html('<p style="grid-column: 1/-1; text-align: center;">Maaf, belum ada hewan yang cocok dengan profilmu saat ini. Coba ulangi kuesioner.</p>');
        return;
    }

    //i = iterasi (index), h = data hewan
    $.each(hewan, function (i, h) {
        const $kartu = $(`
            <div class="hewan-card">
                <img src="${h.gambar}" alt="${h.nama}">
                <div class="hewan-info">
                    <span class="hewan-badge">${h.jenis}</span>
                    <h3>${h.nama}</h3>
                    <p>${h.ras} • ${h.umur} • ${h.gender}</p>
                    <p class="hewan-lokasi">📍 ${h.lokasi}</p>
                    <button type="button" class="btn-adopt">Kenali →</button>
                </div>
            </div>
        `);

        $kartu.find('.btn-adopt').on('click', function () {
            window.location.href = `../pet-detail/pet-detail.html?id=${encodeURIComponent(h.id)}`; // ambil data hewan dengan id 
            //file tujuan lalu encodeURIComponent = mengubah format misal ID "kucing 01" = "Kucing%2001"
        });

        $containerHewan.append($kartu);
    })
}

//tombol ulangi kuesioner

$('#tombol-ulangi').on('click', function(){
    indeksPertanyaan = 0
    jawabanUser = {}
    $bagianHasil.addClass('hidden')
    $bagianKuesioner.removeClass('hidden')
    renderPertanyaan()
})


//inialisasi
$(document).ready(function(){
    renderPertanyaan()
})
