$(document).ready(function(){

    //CEK DATA HEWAN DI LOCAL STORAGE

    //ubah JSON jadi Object 
    let dataHewan = JSON.parse(localStorage.getItem('dataHewan'))

    if(dataHewan){
        tampilkanDashboard()
    } else {
        $('#bagian-form').removeClass('hidden')
        $('#bagian-dashboard').addClass('hidden')
    }

    $('#form-hewan').on('submit', function(e){

        //agar tidak refresh halaman website
        e.preventDefault()

        //masukkan data hewan dari input
        const hewanBaru = {
            nama: $('#namaHewan').val(),
            jenis: $('#jenisHewan').val(),
            ras: $('#rasHewan').val(),
            usiaBulan: parseInt($('#usiaHewan').val()),
            foto: $('#fotoHewan').val() || 'https://placehold.co/150x150?text=Foto'
        }

        //ubah Array jadi format JSON
        localStorage.setItem('dataHewan', JSON.stringify(hewanBaru))
        tampilkanDashboard()
    })

    function tampilkanDashboard(){
        dataHewan = JSON.parse(localStorage.getItem('dataHewan'))

        $('#bagian-form').addClass('hidden')
        $('#bagian-dashboard').removeClass('hidden')


        //SET DATA PROFIL

        //attr = ubah atribut src di foto-profil
        $('#foto-profil').attr('src', dataHewan.foto)

        let teksUsia = dataHewan.usiaBulan < 12
        ?`${dataHewan.usiaBulan} bulan`
        : `${Math.floor(dataHewan.usiaBulan / 12)} tahun`

        $('#sapaan-hewan').text(`Hari baik bersamamu ${dataHewan.nama}`)
        $('#detail-hewan').text(`${dataHewan.jenis} • ${dataHewan.ras} • ${teksUsia}`)

        //set tanggal hari ini

        const hariIni = new Date() // ambil tanggal hari ini

        //pemilihan opsi tanggal misal weekday 'long' itu senin, selasa, dst
        const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'numeric'}

        //cetak tanggal dengan bahasa indonesia dengan opsiTanggal dan jadikan upperCase
        let strTanggal = hariIni.toLocaleDateString('id-ID', opsiTanggal).toUpperCase()
        $('#tanggal-hari-ini').text(strTanggal)
    }

        //CHECKLIST HARIAN

        $('.checklist-item input').on('change', function(){
            const total = $('.checklist-item input').length
            const selesai = $('.checklist-item input:checked').length
            const persentase = (selesai /  total) * 100;

            $('#persentase-checklist').text(`${selesai} / ${total}`)
            $('#progress-harian').css('width', `${persentase}%`)

            //hitung porsi makan (asumsi makan pagi dan malam saja)

            const makanSelesai = $('.checklist-item input[value="Makan Pagi"]:checked, .checklist-item input[value="Makan malam"]:checked').length
            $('#teks-progress').text(`${makanSelesai} / 2 Porsi`)
        })

        //TODO TAMBAHAN yg ISI SENDIRI

        let daftarTodo = []; //penyimpanan sementara aja

        function renderTodo(){
            const $list = $('#list-todo')

                $list.empty()

                if(daftarTodo.length == 0){
                    $list.html('<li class="empty-text">Belum ada todo tambahan.</li>');
                    return;
                }

            $.each(daftarTodo, function (i, todo){
                $list.append(`
                    <li>
                        <span>${todo}</span>

                        <button class="btn-hapus-todo" data-index="${i}" 
                        style="background:none;
                        border:none;
                        cursor:pointer;
                        color:#c98a4b;
                        font-size:18px;
                        font-weight:bold;
                        ">×</button>
                    </li>
                `) // tampikan Todo dan Tombol hapus Todo ke i

            })
        }
        
        $('#btn-tambah-todo').on('click', function(){
            const teksTodo = $('#input-todo').val().trim()

            if(teksTodo){
                daftarTodo.push(teksTodo); // masukin teksTodo ke Array daftarTodo
                $('#input-todo').val(''); //kosongin lagi input nya
                renderTodo();
            }
        })


        //HAPUS TODO

        //target nya .btn-hapus-todo
         $('#list-todo').on('click', '.btn-hapus-todo', function () {
        const index = $(this).data('index'); // this = tombol yang baru di klik user, hapus data ke i
        daftarTodo.splice(index, 1) //(mulai dari index, jumlah dihapus (dari data-index="${index}"))
        renderTodo()
    });

    // LOG KESEHATAN


    $('#btn-simpan-log').on('click', function(){
        const teksLog = $('#logKesehatan').val();

        if(teksLog.trim() === ''){
            alert('Catatan tidak boleh kosong');
            return;
        }

        const $btn = $(this); //ambil #btn-simpan-log

        const teksAsli = $btn.html();
        $btn.html('Tersimpan').prop('disabled', true); // ubah teks btn jadi Tersimpan

        setTimeout(() => {
            $btn.html(teksAsli).prop('disabled', false) // ubah kembali menjadi teks asli
        }, 2000)
    })

    //EDIT DATA HEWAN

    $('#btn-edit').on('click', function(){
        if(confirm("Apakah kamu yakin ingin mengubah data hewan mu? ini akan mengembalikan mu ke form awal.")){
            $('#namaHewan').val(dataHewan.nama);
            $('#jenisHewan').val(dataHewan.jenis);
            $('#rasHewan').val(dataHewan.ras);
            $('#usiaHewan').val(dataHewan.usiaBulan);
            $('#fotoHewan').val(dataHewan.foto);

            $('#bagian-dashboard').addClass('hidden')
            $('#bagian-form').removeClass('hidden')
            
        }
    })
})