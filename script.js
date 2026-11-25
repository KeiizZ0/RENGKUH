//  Ambil elemen dari HTML
const petGrid = document.getElementById('home-pet-grid');
const petStatus = document.getElementById('pet-status');
const petFilter = document.getElementById('filter-hewan');

// Simpan data asli di sini agar tidak bolak-balik fetch
let semuaHewan = []; 

// Fungsi untuk merender kartu
function renderPets(pets) {
    // Ambil jenis yang dipilih di dropdown (jika kosong, berarti "Semua hewan")
    const selectedType = petFilter.value.toLowerCase();
    
    // Filter hewan berdasarkan tipe
    const filteredPets = pets.filter((pet) => {
        if (!selectedType) return true; // Jika pilih "Semua", tampilkan semua
        return String(pet.jenis || '').toLowerCase() === selectedType;
    });

    // Kosongkan grid sebelum diisi ulang
    petGrid.innerHTML = ''; 

    // Update teks status
    petStatus.textContent = `${filteredPets.length} hewan ditemukan`;

    // Jika tidak ada hewan yang cocok
    if (filteredPets.length === 0) {
        petGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">Tidak ada hewan untuk kategori ini.</p>`;
        return;
    }

    // Loop setiap hewan dan buat HTML-nya pakai Template String
    filteredPets.forEach((pet) => {
        // Fallback untuk gambar & data yang kosong
        const gambar = pet.gambar || 'Assets/RENGKUH - LOGO .png';
        const gender = pet.gender || 'Jenis kelamin tidak diketahui';
        const ras = pet.ras || 'Ras tidak diketahui';
        const lokasi = pet.lokasi || 'Lokasi tidak diketahui';

        // Buat kartu HTML
        const kartu = `
            <article class="pet-card">
                <img src="${gambar}" alt="Foto ${pet.nama}" onerror="this.src='Assets/RENGKUH - LOGO .png'">
                <div class="pet-body">
                    <div class="pet-title">
                        <h3>${pet.nama}</h3>
                        <span class="pet-gender">${gender}</span>
                    </div>
                    <p class="pet-breed">${pet.jenis} · ${ras}</p>
                    
                    <div class="tags">
                        ${pet.umur ? `<span class="tag">${pet.umur}</span>` : ''}
                        ${pet.traits && pet.traits.pengalaman ? `<span class="tag">${pet.traits.pengalaman}</span>` : ''}
                        ${pet.traits && pet.traits.alasan ? `<span class="tag">${pet.traits.alasan}</span>` : ''}
                    </div>
                    
                    <p class="pet-location">${lokasi}</p>
                    <a href="pet-detail/pet-detail.html?id=${pet.id}" class="pet-link">Lihat profil →</a>
                </div>
            </article>
        `;

        // Masukkan kartu ke dalam grid
        petGrid.innerHTML += kartu;
    });
}

//  Fungsi untuk mengambil data dari JSON
async function loadHomePets() {
    try {
        const response = await fetch('data/pets.json');
        
        if (!response.ok) {
            throw new Error(`Gagal memuat data hewan (HTTP ${response.status}).`);
        }

        semuaHewan = await response.json();

        // Render pertama kali dimuat
        renderPets(semuaHewan);

        // Pasang event listener saat dropdown filter diganti
        petFilter.addEventListener('change', () => {
            renderPets(semuaHewan);
        });

    } catch (error) {
        console.error('Gagal memuat data:', error);
        petStatus.textContent = 'Data hewan gagal dimuat. Silakan coba lagi nanti.';
    }
}

// Jalankan fungsi saat halaman dibuka
loadHomePets();