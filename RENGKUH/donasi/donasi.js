document.addEventListener('DOMContentLoaded', () => {
    const stepAwal = document.getElementById('step-awal');
    const btnMulaiDonasi = document.getElementById('btn-mulai-donasi');

    const stepPilihan = document.getElementById('step-pilihan');
    const radioJenis = document.querySelectorAll('input[name="jenis_donasi"]');

    // Elemen Pilihan 1: Donasi Hewan (Anjing & Kucing)
    const formHewanBox = document.getElementById('form-hewan-box');
    const radioHewan = document.querySelectorAll('input[name="pilih_hewan"]');
    const detailHewanFields = document.getElementById('detail-hewan-fields');
    const kondisiHewan = document.getElementById('kondisi-hewan');
    const kontakDonatur = document.getElementById('kontak-donatur');
    const btnSubmitHewan = document.getElementById('btn-submit-hewan');

    // Elemen Pilihan 2: Merawat Hewan (Barang/Perlengkapan)
    const formMerawatBox = document.getElementById('form-merawat-box');
    const radioBarang = document.querySelectorAll('input[name="pilih_barang"]');
    const detailBarangFields = document.getElementById('detail-barang-fields');
    const keteranganBarang = document.getElementById('keterangan-barang');
    const kontakBarang = document.getElementById('kontak-barang');
    const btnSubmitBarang = document.getElementById('btn-submit-barang');

    // Elemen Pilihan 3: Uang
    const formNominalBox = document.getElementById('form-nominal-box');
    const inputNominal = document.getElementById('input-nominal');
    const quickButtons = document.querySelectorAll('.btn-quick');
    const btnSubmitDonasi = document.getElementById('btn-submit-donasi');

    const btnKembaliSemua = document.querySelectorAll('.btn-kembali-awal');
    const stepSukses = document.getElementById('step-sukses');
    const pesanSukses = document.getElementById('pesan-sukses');
    const btnSelesai = document.getElementById('btn-selesai');
    const btnReplayMiaw = document.getElementById('btn-replay-miaw');

    // Elemen audio miaw
    const audioMiaw = document.getElementById('audio-miaw');
    let timerStopMiaw = null;
    let nominalAngka = 0;

    function putarSuaraMiaw() {
        if (!audioMiaw) return;

        clearTimeout(timerStopMiaw);
        audioMiaw.pause();
        audioMiaw.currentTime = 0;

        audioMiaw.play().then(() => {
            timerStopMiaw = setTimeout(() => {
                audioMiaw.pause();
            }, 2000);
        }).catch(err => {
            console.log('Gagal memutar audio:', err);
        });
    }

    function formatRupiah(angka) {
        return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function updateTombolNominal() {
        const terpilih = document.querySelector('input[name="jenis_donasi"]:checked');

        if (terpilih && terpilih.value === 'Uang' && nominalAngka > 0) {
            btnSubmitDonasi.disabled = false;
            btnSubmitDonasi.textContent =
                `Kirim Donasi Uang (Rp ${formatRupiah(nominalAngka)})`;
        } else {
            btnSubmitDonasi.disabled = true;
            btnSubmitDonasi.textContent = 'Kirim Donasi';
        }
    }

    function updateNominal(nilai) {
        nominalAngka = parseInt(nilai.replace(/\D/g, ''), 10) || 0;
        inputNominal.value = nominalAngka > 0 ? formatRupiah(nominalAngka) : '';
        updateTombolNominal();
    }

    function resetSemua() {
        radioJenis.forEach(radio => {
            radio.checked = false;
        });
        radioHewan.forEach(radio => {
            radio.checked = false;
        });
        radioBarang.forEach(radio => {
            radio.checked = false;
        });
        quickButtons.forEach(button => {
            button.classList.remove('active');
        });

        formHewanBox.classList.add('hidden');
        detailHewanFields.classList.add('hidden');
        kondisiHewan.value = '';
        kontakDonatur.value = '';
        btnSubmitHewan.disabled = true;
        btnSubmitHewan.textContent = 'Pilih Anjing atau Kucing';

        formMerawatBox.classList.add('hidden');
        detailBarangFields.classList.add('hidden');
        keteranganBarang.value = '';
        kontakBarang.value = '';
        btnSubmitBarang.disabled = true;
        btnSubmitBarang.textContent = 'Pilih Jenis Perlengkapan';

        formNominalBox.classList.add('hidden');
        updateNominal('');
    }

    // Klik telapak kucing untuk memutar ulang suara miaw
    btnReplayMiaw.addEventListener('click', putarSuaraMiaw);

    // 1. Klik tombol "Donasi" -> Munculkan 3 pilihan
    btnMulaiDonasi.addEventListener('click', () => {
        stepAwal.classList.add('hidden');
        stepPilihan.classList.remove('hidden');
    });

    // 2. Pilih salah satu dari 3 pilihan utama
    radioJenis.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;

            formHewanBox.classList.add('hidden');
            formMerawatBox.classList.add('hidden');
            formNominalBox.classList.add('hidden');

            if (radio.value === 'Donasi Hewan') {
                formHewanBox.classList.remove('hidden');
            } else if (radio.value === 'Merawat Hewan') {
                formMerawatBox.classList.remove('hidden');
            } else if (radio.value === 'Uang') {
                formNominalBox.classList.remove('hidden');
                updateTombolNominal();
            }
        });
    });

    // 3. Logika Pilihan 1: Donasi Hewan (Anjing / Kucing)
    radioHewan.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                detailHewanFields.classList.remove('hidden');
                btnSubmitHewan.disabled = false;
                btnSubmitHewan.textContent = `Ajukan Donasi ${radio.value}`;
            }
        });
    });

    btnSubmitHewan.addEventListener('click', () => {
        const hewanTerpilih = document.querySelector(
            'input[name="pilih_hewan"]:checked'
        );
        if (!hewanTerpilih) return;

        stepPilihan.classList.add('hidden');
        stepSukses.classList.remove('hidden');
        pesanSukses.innerHTML =
            `Pengajuan <strong>Donasi Hewan (${hewanTerpilih.value})</strong> telah kami terima. ` +
            'Tim penampungan mitra Rengkuh akan segera menghubungi Anda untuk proses penjemputan/penyerahan.';
        putarSuaraMiaw();
    });

    // 4. Logika Pilihan 2: Merawat Hewan (Barang/Perlengkapan)
    radioBarang.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                detailBarangFields.classList.remove('hidden');
                btnSubmitBarang.disabled = false;
                btnSubmitBarang.textContent = `Kirim Donasi ${radio.value}`;
            }
        });
    });

    btnSubmitBarang.addEventListener('click', () => {
        const barangTerpilih = document.querySelector(
            'input[name="pilih_barang"]:checked'
        );
        if (!barangTerpilih) return;

        stepPilihan.classList.add('hidden');
        stepSukses.classList.remove('hidden');
        pesanSukses.innerHTML =
            `Donasi perlengkapan perawatan berupa <strong>${barangTerpilih.value}</strong> telah kami catat. ` +
            'Tim mitra Rengkuh akan segera menghubungi Anda untuk koordinasi pengiriman.';
        putarSuaraMiaw();
    });

    // 5. Logika Pilihan 3: Nominal Rupiah (Uang)
    inputNominal.addEventListener('input', event => {
        quickButtons.forEach(button => {
            button.classList.remove('active');
        });
        updateNominal(event.target.value);
    });

    quickButtons.forEach(button => {
        button.addEventListener('click', () => {
            quickButtons.forEach(item => {
                item.classList.remove('active');
            });
            button.classList.add('active');
            updateNominal(button.dataset.amount);
        });
    });

    btnSubmitDonasi.addEventListener('click', () => {
        const terpilih = document.querySelector(
            'input[name="jenis_donasi"]:checked'
        );
        if (!terpilih || nominalAngka <= 0) return;

        stepPilihan.classList.add('hidden');
        stepSukses.classList.remove('hidden');
        pesanSukses.innerHTML =
            `Donasi <strong>Uang</strong> sebesar <strong>Rp ${formatRupiah(nominalAngka)}</strong> ` +
            'telah berhasil dicatat dan akan segera disalurkan ke penampungan mitra Rengkuh.';
        putarSuaraMiaw();
    });

    // 6. Tombol Kembali & Selesai
    btnKembaliSemua.forEach(button => {
        button.addEventListener('click', () => {
            resetSemua();
            stepPilihan.classList.add('hidden');
            stepAwal.classList.remove('hidden');
        });
    });

    btnSelesai.addEventListener('click', () => {
        clearTimeout(timerStopMiaw);
        if (audioMiaw) audioMiaw.pause();
        resetSemua();
        stepSukses.classList.add('hidden');
        stepAwal.classList.remove('hidden');
    });
});
