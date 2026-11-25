// bungkus logika katalog biar jalan pas elemen HTML udah siap
function mulaiCatalog() {
  // ambil elemen input, dropdown, tombol reset, sama kontrol filter/sort
  const inputCari = document.querySelector('.input-cari');
  const selectUrut = document.querySelector('.select-urut');
  const tombolReset = document.querySelector('.reset-link');
  const semuaCheckbox = document.querySelectorAll('.sidebar-filter input[type="checkbox"]');
  const semuaTombolPill = document.querySelectorAll('.pill-buttons button');
  const semuaSelectFilter = document.querySelectorAll('.filter-select');
  const selectKelamin = semuaSelectFilter[0] || null;
  const selectEnergi = semuaSelectFilter[1] || null;
  const teksJumlah = document.querySelector('.result-count') || document.getElementById('result-count');
  const wadahKartu = document.querySelector('.cards-grid') || document.getElementById('cards-grid');

  // nyimpen seluruh data hewan hasil fetch dari pets.json
  let semuaDataHewan = [];

  // update tulisan jumlah hasil atau nampilin pesan status/error
  function setStatus(pesan) {
    if (teksJumlah) {
      teksJumlah.textContent = pesan;
    } else if (wadahKartu) {
      wadahKartu.innerHTML = `<p style="color:#C56B43;font-weight:600;">${pesan}</p>`;
    }
  }

  // nentuin tahap umur (Anak / Dewasa / Senior) dari teks umur
  function tentukanTahap(umurStr) {
    const teks = String(umurStr || '').toLowerCase();
    if (teks.includes('bulan') || teks.includes('bln') || teks.includes('minggu')) {
      return 'Anak';
    }
    const angka = parseFloat(teks.replace(',', '.'));
    if (!isNaN(angka)) {
      if (angka < 1) return 'Anak';
      if (angka >= 7) return 'Senior';
    }
    return 'Dewasa';
  }

  // nyamain format JSON baru (umur, gender, lokasi, gambar, traits) ke data kartu katalog
  function normalisasiPet(item, idx) {
    const traits = item.traits || {};
    const kec = item.kecocokan || {};
    const tempatTinggal = Array.isArray(traits.tempatTinggal) ? traits.tempatTinggal : [];

    // dukung foto array maupun field "gambar" tunggal
    const fotoList = Array.isArray(item.foto)
      ? item.foto
      : (item.gambar ? [item.gambar] : (item.foto ? [item.foto] : []));

    // ambil angka buat sorting murah/mahal dan teks buat ditampilin di kartu
    let biayaAngka = 0;
    let biayaTeks = 'Gratis';
    if (item.biaya_adopsi !== undefined) {
      biayaAngka = Number(item.biaya_adopsi) || 0;
      biayaTeks = biayaAngka === 0 ? 'Gratis' : 'Rp ' + biayaAngka.toLocaleString('id-ID');
    } else if (traits.budget) {
      const matchAngka = String(traits.budget).replace(/\./g, '').match(/\d+/);
      biayaAngka = matchAngka ? Number(matchAngka[0]) : 0;
      biayaTeks = traits.budget;
    }

    const usiaTeks = item.umur || item.usia || '-';

    return {
      id: item.id !== undefined ? String(item.id) : String(idx + 1),
      nama: item.nama || '-',
      jenis: item.jenis || '-',
      ras: item.ras || '-',
      usia: usiaTeks,
      tahap: item.tahap || tentukanTahap(usiaTeks),
      kelamin: item.gender || item.kelamin || '-',
      ukuran: item.ukuran || '-',
      kota: item.lokasi || item.kota || '-',
      foto: fotoList,
      tingkat_energi: item.tingkat_energi || 'Sedang',
      biayaAngka: biayaAngka,
      biayaTeks: biayaTeks,
      kecocokan: {
        ramah_anak: Boolean(kec.ramah_anak !== undefined ? kec.ramah_anak : traits.punyaAnak),
        akur_hewan_lain: Boolean(kec.akur_hewan_lain !== undefined ? kec.akur_hewan_lain : traits.punyaHewanLain),
        apartemen: Boolean(
          kec.apartemen !== undefined
            ? kec.apartemen
            : tempatTinggal.some(t => String(t).toLowerCase().includes('apartemen'))
        )
      }
    };
  }

  // nyoba fetch pets.json lewat beberapa kemungkinan path biar aman pas jalan di Live Server
  async function ambilDataPets() {
    const daftarJalur = [
      '../data/pets.json',
      '../../data/pets.json',
      '/data/pets.json',
      'data/pets.json',
      '../Data/pets.json',
      '../data/Pets.json',
      'pets.json'
    ];

    for (const jalur of daftarJalur) {
      let res;
      try {
        res = await fetch(jalur);
      } catch (e) {
        // lanjut coba path berikutnya kalau gagal fetch
        continue;
      }

      if (res && res.ok) {
        const teks = await res.text();
        try {
          const data = JSON.parse(teks);
          const list = Array.isArray(data) ? data : (data.pets || data.data || []);
          return list.map(normalisasiPet);
        } catch (errJson) {
          // kasih tau kalau file ketemu tapi sintaks JSON-nya ada yang salah
          throw new Error('File ' + jalur + ' ketemu, tapi isi JSON error: ' + errJson.message);
        }
      }
    }
    throw new Error('File pets.json tidak ditemukan. Pastikan buka folder proyek utama lewat Live Server.');
  }

  // bikin tag img: URL luar langsung dipake, gambar lokal fallback ke ../Assets/
  function buatTagImg(sumberFoto, altText, className) {
    const src = sumberFoto || '';
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return `<img src="${src}" alt="${altText}" class="${className}">`;
    }
    return `<img src="${src}" alt="${altText}" class="${className}" onerror="if(!this.dataset.f){this.dataset.f='1';this.src='../Assets/${src}';}">`;
  }

  // render daftar kartu hewan ke dalam grid katalog
  function tampilkanKartu(daftarHewan) {
    if (!wadahKartu) {
      setStatus('Error HTML: elemen class="cards-grid" tidak ditemukan di pets.html');
      return;
    }

    wadahKartu.innerHTML = '';

    daftarHewan.forEach(function(pet) {
      // susun badge kecocokan rumah
      let tagHTML = '';
      if (pet.kecocokan.ramah_anak) tagHTML += '<p class="tag">Ramah anak</p>';
      if (pet.kecocokan.akur_hewan_lain) tagHTML += '<p class="tag">Akur dengan hewan lain</p>';
      if (pet.kecocokan.apartemen) tagHTML += '<p class="tag">Apartemen</p>';

      const fotoUtama = pet.foto[0] || '';
      const urlDetail = `../pet-detail/pet-detail.html?id=${pet.id}`;

      wadahKartu.innerHTML += `
        <div class="pet-card" onclick="window.location.href='${urlDetail}'">
          ${buatTagImg(fotoUtama, 'Foto ' + pet.nama, 'pet-img')}
          <div class="card-body">
            <div class="card-title-row">
              <h3>${pet.nama}</h3>
              <p class="badge-jenis">${pet.jenis}</p>
            </div>
            <p class="breed">${pet.ras}</p>

            <div class="info-boxes">
              <div class="info-item">
                <h5>Usia</h5>
                <p>${pet.usia}</p>
              </div>
              <div class="info-item">
                <h5>Kelamin</h5>
                <p>${pet.kelamin}</p>
              </div>
              <div class="info-item">
                <h5>Kota</h5>
                <p>${pet.kota}</p>
              </div>
            </div>

            <div class="tags-row">
              ${tagHTML}
            </div>

            <div class="card-footer">
              <div>
                <p class="fee-label">Estimasi biaya / bulan</p>
                <p class="fee-price"><strong>${pet.biayaTeks}</strong></p>
              </div>
              <a href="${urlDetail}" class="kenali-link">Kenali &rarr;</a>
            </div>
          </div>
        </div>
      `;
    });

    setStatus(daftarHewan.length + ' hewan ditemukan');
  }

  // nyaring data sesuai input cari + filter aktif, lalu urutin biayanya
  function prosesFilterDanUrut() {
    const kataKunci = inputCari ? inputCari.value.toLowerCase() : '';
    const kelaminDipilih = selectKelamin ? selectKelamin.value.toLowerCase() : 'semua';
    const energiDipilih = selectEnergi ? selectEnergi.value.toLowerCase() : 'semua';

    // ambil checkbox jenis hewan & kecocokan yang lagi dicentang
    const grupCheckbox = document.querySelectorAll('.checkbox-list');
    const listJenis = grupCheckbox[0] ? grupCheckbox[0].querySelectorAll('input:checked') : [];
    const jenisDipilih = Array.from(listJenis).map(cb => cb.parentElement.textContent.trim().toLowerCase());

    const listCocok = grupCheckbox[1] ? grupCheckbox[1].querySelectorAll('input:checked') : [];
    const cocokDipilih = Array.from(listCocok).map(cb => cb.parentElement.textContent.trim().toLowerCase());

    // ambil pill button tahap usia & ukuran yang lagi aktif
    const grupPill = document.querySelectorAll('.pill-buttons');
    const tombolUsia = grupPill[0] ? grupPill[0].querySelector('button.aktif') : null;
    const usiaDipilih = tombolUsia ? tombolUsia.textContent.toLowerCase() : '';

    const tombolUkuran = grupPill[1] ? grupPill[1].querySelector('button.aktif') : null;
    const ukuranDipilih = tombolUkuran ? tombolUkuran.textContent.toLowerCase() : '';

    let hasil = semuaDataHewan.filter(function(pet) {
      const teksGabungan = (pet.nama + ' ' + pet.ras + ' ' + pet.kota).toLowerCase();
      const cocokCari = teksGabungan.includes(kataKunci);
      const cocokJenis = jenisDipilih.length === 0 || jenisDipilih.includes(pet.jenis.toLowerCase());
      const cocokKelamin = kelaminDipilih === 'semua' || pet.kelamin.toLowerCase() === kelaminDipilih;
      const cocokUsia = usiaDipilih === '' || pet.tahap.toLowerCase() === usiaDipilih;
      const cocokUkuran = ukuranDipilih === '' || pet.ukuran.toLowerCase() === ukuranDipilih;

      // cek level energi sesuai pilihan dropdown
      let cocokEnergi = true;
      const energiHewan = (pet.tingkat_energi || '').toLowerCase();
      if (energiDipilih === 'rendah') {
        cocokEnergi = energiHewan.includes('rendah') || energiHewan.includes('santai');
      } else if (energiDipilih === 'sedang') {
        cocokEnergi = energiHewan.includes('sedang');
      } else if (energiDipilih === 'tinggi') {
        cocokEnergi = energiHewan.includes('tinggi') || energiHewan.includes('aktif');
      }

      // cek semua syarat kecocokan yang dicentang
      let cocokRumah = true;
      cocokDipilih.forEach(function(syarat) {
        if (syarat.includes('ramah anak') && !pet.kecocokan.ramah_anak) cocokRumah = false;
        if (syarat.includes('akur') && !pet.kecocokan.akur_hewan_lain) cocokRumah = false;
        if (syarat.includes('apartemen') && !pet.kecocokan.apartemen) cocokRumah = false;
      });

      return cocokCari && cocokJenis && cocokKelamin && cocokUsia && cocokUkuran && cocokEnergi && cocokRumah;
    });

    // urutin hasil berdasarkan biaya termurah / termahal
    const urutan = selectUrut ? selectUrut.value : 'terbaru';
    if (urutan === 'termurah') {
      hasil.sort((a, b) => a.biayaAngka - b.biayaAngka);
    } else if (urutan === 'termahal') {
      hasil.sort((a, b) => b.biayaAngka - a.biayaAngka);
    }

    tampilkanKartu(hasil);
  }

  // load data awal pas halaman dibuka
  ambilDataPets()
    .then(data => {
      semuaDataHewan = data;
      tampilkanKartu(semuaDataHewan);
    })
    .catch(error => {
      setStatus(error.message);
      console.error(error);
    });

  // pasang listener buat search, dropdown, sama checkbox
  if (inputCari) inputCari.addEventListener('input', prosesFilterDanUrut);
  if (selectKelamin) selectKelamin.addEventListener('change', prosesFilterDanUrut);
  if (selectEnergi) selectEnergi.addEventListener('change', prosesFilterDanUrut);
  if (selectUrut) selectUrut.addEventListener('change', prosesFilterDanUrut);
  semuaCheckbox.forEach(cb => cb.addEventListener('change', prosesFilterDanUrut));

  // toggle pill button (klik sekali aktif, klik lagi matiin)
  semuaTombolPill.forEach(function(tombol) {
    tombol.addEventListener('click', function() {
      const grup = tombol.parentElement.querySelectorAll('button');
      const sudahAktif = tombol.classList.contains('aktif');
      grup.forEach(b => b.classList.remove('aktif'));
      if (!sudahAktif) tombol.classList.add('aktif');
      prosesFilterDanUrut();
    });
  });

  // balikin semua filter ke kondisi awal
  if (tombolReset) {
    tombolReset.addEventListener('click', function(e) {
      e.preventDefault();
      if (inputCari) inputCari.value = '';
      if (selectKelamin) selectKelamin.value = 'Semua';
      if (selectEnergi) selectEnergi.value = 'Semua';
      if (selectUrut) selectUrut.value = 'terbaru';
      semuaCheckbox.forEach(cb => cb.checked = false);
      semuaTombolPill.forEach(b => b.classList.remove('aktif'));
      prosesFilterDanUrut();
    });
  }
}

// pastiin mulaiCatalog jalan setelah DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mulaiCatalog);
} else {
  mulaiCatalog();
}