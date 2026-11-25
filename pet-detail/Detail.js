function mulaiDetail() {
  const parameterURL = new URLSearchParams(window.location.search);
  const idHewanDipilih = parameterURL.get('id');

  let daftarFoto = [];
  let indexFoto = 0;
  let biayaAwalSekali = 650000;
  let hewanAktif = null;

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

  function normalisasiPet(item, idx) {
    const traits = item.traits || {};
    const kec = item.kecocokan || {};
    const seh = item.kesehatan || {};
    const tempatTinggal = Array.isArray(traits.tempatTinggal) ? traits.tempatTinggal : [];

    const fotoList = Array.isArray(item.foto)
      ? item.foto
      : (item.gambar ? [item.gambar] : (item.foto ? [item.foto] : []));

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
    const nama = item.nama || '-';
    const jenis = item.jenis || '-';
    const ras = item.ras || '-';
    const lokasi = item.lokasi || item.kota || '-';

    let daftarSifat = Array.isArray(item.sifat) ? item.sifat : [];
    if (!daftarSifat.length) {
      if (traits.pengalaman) daftarSifat.push('Adopter: ' + traits.pengalaman);
      if (traits.alasan) daftarSifat.push('Tujuan: ' + traits.alasan);
      if (traits.waktuSendiri) daftarSifat.push('Waktu sendiri: ' + traits.waktuSendiri);
    }

    const deskripsiDefault = `${nama} adalah ${jenis.toLowerCase()} ras ${ras} berusia ${usiaTeks} yang berada di ${lokasi}.` +
      (traits.pengalaman ? ` Cocok untuk adopter ${traits.pengalaman.toLowerCase()}` : '') +
      (traits.alasan ? ` dengan tujuan ${traits.alasan.toLowerCase()}.` : '.');

    return {
      id: item.id !== undefined ? String(item.id) : String(idx + 1),
      nama: nama,
      jenis: jenis,
      ras: ras,
      usia: usiaTeks,
      tahap: item.tahap || tentukanTahap(usiaTeks),
      kelamin: item.gender || item.kelamin || '-',
      ukuran: item.ukuran || '-',
      kota: lokasi,
      foto: fotoList,
      deskripsi: item.deskripsi || deskripsiDefault,
      sifat: daftarSifat,
      tingkat_energi: item.tingkat_energi || 'Sedang',
      level_energi: Number(item.level_energi) || 3,
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
      },
      kesehatan: {
        vaksinasi: Boolean(seh.vaksinasi !== undefined ? seh.vaksinasi : true),
        sterilisasi: Boolean(seh.sterilisasi !== undefined ? seh.sterilisasi : false),
        obat_cacing: Boolean(seh.obat_cacing !== undefined ? seh.obat_cacing : true),
        mikrocip: Boolean(seh.mikrocip !== undefined ? seh.mikrocip : false),
        catatan_dokter: seh.catatan_dokter || (
          tempatTinggal.length
            ? 'Cocok ditempatkan di: ' + tempatTinggal.join(', ') + '.'
            : 'Kondisi sehat dan siap diadopsi.'
        )
      }
    };
  }

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
        continue;
      }

      if (res && res.ok) {
        const teks = await res.text();
        try {
          const data = JSON.parse(teks);
          const list = Array.isArray(data) ? data : (data.pets || data.data || []);
          return list.map(normalisasiPet);
        } catch (errJson) {
          throw new Error('File ' + jalur + ' ketemu, tapi isi JSON error: ' + errJson.message);
        }
      }
    }
    throw new Error('File pets.json tidak ditemukan. Pastikan buka folder proyek utama lewat Live Server.');
  }

  function setTeks(id, teks) {
    const el = document.getElementById(id);
    if (el) el.textContent = teks;
  }

  function buatTagImg(sumberFoto, altText, className) {
    const src = sumberFoto || '';
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return `<img src="${src}" alt="${altText}" class="${className}">`;
    }
    return `<img src="${src}" alt="${altText}" class="${className}" onerror="if(!this.dataset.f){this.dataset.f='1';this.src='../Assets/${src}';}">`;
  }

  function buatBarisStatus(label, status, teksSalah) {
    if (status) {
      return `
        <li>
          <div class="list-left">
            <p class="icon-yes">&#10003;</p>
            <p>${label}</p>
          </div>
          <strong>Ya</strong>
        </li>
      `;
    } else {
      return `
        <li>
          <div class="list-left">
            <p class="icon-no">&#10005;</p>
            <p>${label}</p>
          </div>
          <strong class="text-red">${teksSalah}</strong>
        </li>
      `;
    }
  }

  function tampilkanFoto(index) {
    if (!daftarFoto.length) return;
    indexFoto = index;
    const fileFoto = daftarFoto[indexFoto] || '';
    const fotoUtama = document.getElementById('foto-utama');
    if (fotoUtama) {
      fotoUtama.dataset.f = '';
      if (fileFoto.startsWith('http://') || fileFoto.startsWith('https://')) {
        fotoUtama.onerror = null;
      } else {
        fotoUtama.onerror = function() {
          if (!this.dataset.f) {
            this.dataset.f = '1';
            this.src = '../Assets/' + fileFoto;
          }
        };
      }
      fotoUtama.src = fileFoto;
    }
    setTeks('foto-counter', (indexFoto + 1) + ' / ' + daftarFoto.length);

    document.querySelectorAll('.thumb-img').forEach((thumb, i) => {
      thumb.classList.toggle('aktif', i === indexFoto);
    });
  }

  function tampilkanHewanLain(semuaHewan, hewanSekarang) {
    setTeks('related-title', hewanSekarang.jenis + ' lain yang menunggu');
    const wadahRelated = document.getElementById('related-grid');
    if (!wadahRelated) return;
    wadahRelated.innerHTML = '';

    const hewanSejenis = semuaHewan.filter(h => h.jenis === hewanSekarang.jenis && h.id !== hewanSekarang.id);

    hewanSejenis.forEach(pet => {
      const fotoUtama = pet.foto[0] || '';
      const urlDetail = `pet-detail.html?id=${encodeURIComponent(pet.id)}`;
      wadahRelated.innerHTML += `
        <div class="pet-card" onclick="window.location.href='${urlDetail}'">
          ${buatTagImg(fotoUtama, 'Foto ' + pet.nama, 'pet-img')}
          <div class="card-body">
            <div class="card-title-row">
              <h3>${pet.nama}</h3>
              <p class="badge-jenis">${pet.jenis}</p>
            </div>
            <p class="breed">${pet.ras}</p>
            <div class="info-boxes">
              <div class="info-item"><h5>Usia</h5><p>${pet.usia}</p></div>
              <div class="info-item"><h5>Kelamin</h5><p>${pet.kelamin}</p></div>
              <div class="info-item"><h5>Kota</h5><p>${pet.kota}</p></div>
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
  }

  let hargaPakan = 160000;
  function hitungBiaya() {
    const slider = document.getElementById('durasi-slider');
    if (!slider) return;

    let totalTambahan = 0;
    document.querySelectorAll('.addon-check').forEach(cb => {
      if (cb.checked) totalTambahan += parseInt(cb.value);
    });

    const perBulan = hargaPakan + 60000 + 80000 + totalTambahan;
    const durasi = parseInt(slider.value);
    const totalSemua = (perBulan * durasi) + biayaAwalSekali;

    setTeks('label-durasi', durasi + ' bulan');
    setTeks('total-bulanan', 'Rp ' + perBulan.toLocaleString('id-ID'));
    setTeks('biaya-pakan', 'Rp ' + hargaPakan.toLocaleString('id-ID'));

    const rowTambahan = document.getElementById('row-tambahan');
    if (rowTambahan) {
      if (totalTambahan > 0) {
        rowTambahan.style.display = 'flex';
        setTeks('biaya-tambahan', 'Rp ' + totalTambahan.toLocaleString('id-ID'));
      } else {
        rowTambahan.style.display = 'none';
      }
    }

    setTeks('label-total-durasi', 'Total ' + durasi + ' bulan pertama');
    setTeks('total-keseluruhan', 'Rp ' + totalSemua.toLocaleString('id-ID'));
  }

  ambilDataPets()
    .then(semuaHewan => {
      if (!semuaHewan.length) throw new Error('Data pets.json kosong');

      hewanAktif = semuaHewan.find(item => String(item.id) === String(idHewanDipilih)) || semuaHewan[0];

      document.title = hewanAktif.nama + ' - RENGKUH';
      setTeks('crumb-nama', hewanAktif.nama);
      setTeks('detail-jenis', hewanAktif.jenis);
      setTeks('detail-kota', hewanAktif.kota);
      setTeks('detail-nama', hewanAktif.nama);
      setTeks('detail-ras', hewanAktif.ras);
      setTeks('detail-usia', hewanAktif.usia);
      setTeks('detail-tahap', hewanAktif.tahap);
      setTeks('detail-kelamin', hewanAktif.kelamin);
      setTeks('detail-ukuran', hewanAktif.ukuran);
      setTeks('detail-deskripsi', hewanAktif.deskripsi);
      setTeks('detail-biaya', hewanAktif.biayaTeks);

      const wadahSifat = document.getElementById('detail-sifat-tags');
      if (wadahSifat) {
        wadahSifat.innerHTML = '';
        hewanAktif.sifat.forEach(s => {
          wadahSifat.innerHTML += `<p class="trait-pill">${s}</p>`;
        });
      }

      daftarFoto = hewanAktif.foto;
      const wadahThumb = document.getElementById('thumbnail-row');
      if (wadahThumb && daftarFoto.length > 0) {
        wadahThumb.innerHTML = '';
        daftarFoto.forEach((src, i) => {
          const onErrAttr = (src.startsWith('http://') || src.startsWith('https://'))
            ? ''
            : ` onerror="if(!this.dataset.f){this.dataset.f='1';this.src='../Assets/${src}';}"`;
          wadahThumb.innerHTML += `<img src="${src}" alt="Thumbnail ${i + 1}" class="thumb-img ${i === 0 ? 'aktif' : ''}" data-index="${i}"${onErrAttr}>`;
        });
        tampilkanFoto(0);

        document.querySelectorAll('.thumb-img').forEach(thumb => {
          thumb.addEventListener('click', function() {
            tampilkanFoto(parseInt(thumb.getAttribute('data-index')));
          });
        });
      }

      setTeks('detail-energi-teks', hewanAktif.tingkat_energi);
      const wadahBar = document.getElementById('detail-energi-bar');
      if (wadahBar) {
        wadahBar.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          wadahBar.innerHTML += `<div class="bar ${i <= hewanAktif.level_energi ? 'filled' : ''}"></div>`;
        }
      }

      const listKecocokan = document.getElementById('list-kecocokan');
      if (listKecocokan) {
        listKecocokan.innerHTML =
          buatBarisStatus('Ramah dengan anak', hewanAktif.kecocokan.ramah_anak, 'Tidak') +
          buatBarisStatus('Akur dengan hewan lain', hewanAktif.kecocokan.akur_hewan_lain, 'Tidak') +
          buatBarisStatus('Cocok di apartemen', hewanAktif.kecocokan.apartemen, 'Tidak');
      }

      const listKesehatan = document.getElementById('list-kesehatan');
      if (listKesehatan) {
        listKesehatan.innerHTML =
          buatBarisStatus('Vaksinasi', hewanAktif.kesehatan.vaksinasi, 'Belum') +
          buatBarisStatus('Sterilisasi', hewanAktif.kesehatan.sterilisasi, 'Belum') +
          buatBarisStatus('Obat cacing', hewanAktif.kesehatan.obat_cacing, 'Belum') +
          buatBarisStatus('Mikrocip', hewanAktif.kesehatan.mikrocip, 'Belum');
      }
      setTeks('detail-catatan', hewanAktif.kesehatan.catatan_dokter);

      biayaAwalSekali = hewanAktif.biayaAngka + 450000;
      setTeks('biaya-awal-teks', 'Rp ' + biayaAwalSekali.toLocaleString('id-ID'));
      hitungBiaya();

      tampilkanHewanLain(semuaHewan, hewanAktif);
    })
    .catch(error => {
      setTeks('crumb-nama', error.message);
      console.error(error);
    });

  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) {
    btnPrev.addEventListener('click', function() {
      if (!daftarFoto.length) return;
      tampilkanFoto((indexFoto - 1 + daftarFoto.length) % daftarFoto.length);
    });
  }

  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    btnNext.addEventListener('click', function() {
      if (!daftarFoto.length) return;
      tampilkanFoto((indexFoto + 1) % daftarFoto.length);
    });
  }

  document.querySelectorAll('.pakan-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.pakan-btn').forEach(b => b.classList.remove('aktif'));
      btn.classList.add('aktif');
      hargaPakan = parseInt(btn.getAttribute('data-harga'));
      hitungBiaya();
    });
  });

  document.querySelectorAll('.addon-check').forEach(cb => cb.addEventListener('change', hitungBiaya));

  const durasiSlider = document.getElementById('durasi-slider');
  if (durasiSlider) durasiSlider.addEventListener('input', hitungBiaya);

  const btnAdopsi = document.getElementById('btn-adopsi');
  if (btnAdopsi) {
    btnAdopsi.addEventListener('click', function() {
      if (hewanAktif) {
        window.location.href = `../adopt-form/adopt-form.html?id=${encodeURIComponent(hewanAktif.id)}`;
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mulaiDetail);
} else {
  mulaiDetail();
}