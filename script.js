document.addEventListener('DOMContentLoaded', () => {
    // Referensi elemen DOM
    const lecturerListContainer = document.getElementById('lecturer-list');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter'); // DITAMBAHKAN
    const jabatanFilter = document.getElementById('jabatanFilter');
    const keahlianFilter = document.getElementById('keahlianFilter');

    let allLecturers = [];
    let filteredLecturers = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    // Fungsi untuk memuat dan memproses data
    async function loadData() {
        try {
            const response = await fetch('data-dosen.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            allLecturers = data.map(dosen => ({
                ...dosen,
                keahlian: Array.isArray(dosen.keahlian) ? dosen.keahlian : dosen.keahlian.split(',').map(k => k.trim())
            }));

            initializeApp();

        } catch (error) {
            console.error("Gagal memuat data dosen:", error);
            lecturerListContainer.innerHTML = "<p>Gagal memuat data. Periksa file `data-dosen.json` dan pastikan formatnya benar. Pastikan juga Anda menjalankan aplikasi melalui server lokal.</p>";
        }
    }

    function initializeApp() {
        populateKeahlianFilter();
        applyFilters();
        addEventListeners();
    }

    // FUNGSI INI DIUBAH UNTUK MENYESUAIKAN TAMPILAN
    function displayLecturers(lecturers, page) {
        lecturerListContainer.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedLecturers = lecturers.slice(start, end);

        if (paginatedLecturers.length === 0) {
            lecturerListContainer.innerHTML = "<p>Data dosen tidak ditemukan.</p>";
            return;
        }

        paginatedLecturers.forEach(dosen => {
            const photoPath = `photos/${dosen.nip}.png`;
            const defaultIconPath = `https://via.placeholder.com/80?text=User`;

            const lecturerItem = document.createElement('div');
            lecturerItem.className = 'lecturer-item';
            // Hapus Email & Telepon, tambahkan Status
            lecturerItem.innerHTML = `
                <img src="${photoPath}" class="lecturer-photo" onerror="this.onerror=null;this.src='${defaultIconPath}';">
                <div class="lecturer-info">
                    <h3>${dosen.nama}</h3>
                    <p><strong>NIP:</strong> ${dosen.nip}</p>
                    <p><strong>Status:</strong> ${dosen.status}</p>
                    <p><strong>Jabatan:</strong> ${dosen.jabatan}</p>
                    <p><strong>Bidang Keahlian:</strong> ${dosen.keahlian.join(', ')}</p>
                </div>
            `;
            lecturerListContainer.appendChild(lecturerItem);
        });
    }

    function setupPagination(lecturers) {
        paginationContainer.innerHTML = "";
        const pageCount = Math.ceil(lecturers.length / itemsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            if (i === currentPage) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                currentPage = i;
                displayLecturers(lecturers, currentPage);
                const currentActive = document.querySelector('.pagination-container button.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                btn.classList.add('active');
            });
            paginationContainer.appendChild(btn);
        }
    }

    function populateKeahlianFilter() {
        const allKeahlian = new Set();
        allLecturers.forEach(dosen => {
            dosen.keahlian.forEach(k => {
                if(k) allKeahlian.add(k);
            });
        });

        keahlianFilter.innerHTML = '<option value="">Semua Bidang Keahlian</option>';
        allKeahlian.forEach(keahlian => {
            const option = document.createElement('option');
            option.value = keahlian;
            option.innerText = keahlian;
            keahlianFilter.appendChild(option);
        });
    }

    // FUNGSI INI DIUBAH UNTUK MENAMBAHKAN LOGIKA FILTER STATUS
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value; // DITAMBAHKAN
        const jabatan = jabatanFilter.value;
        const keahlian = keahlianFilter.value;

        filteredLecturers = allLecturers.filter(dosen => {
            const nameMatch = dosen.nama.toLowerCase().includes(searchTerm);
            const nipMatch = dosen.nip.includes(searchTerm);
            const statusMatch = status === "" || dosen.status === status; // DITAMBAHKAN
            const jabatanMatch = jabatan === "" || dosen.jabatan === jabatan;
            const keahlianMatch = keahlian === "" || dosen.keahlian.includes(keahlian);

            // Kondisi filter diperbarui
            return (nameMatch || nipMatch) && statusMatch && jabatanMatch && keahlianMatch;
        });

        currentPage = 1;
        displayLecturers(filteredLecturers, currentPage);
        setupPagination(filteredLecturers);
    }
    
    // FUNGSI INI DIUBAH UNTUK MENAMBAHKAN EVENT LISTENER PADA FILTER STATUS
    function addEventListeners() {
        searchInput.addEventListener('input', applyFilters);
        statusFilter.addEventListener('change', applyFilters); // DITAMBAHKAN
        jabatanFilter.addEventListener('change', applyFilters);
        keahlianFilter.addEventListener('change', applyFilters);
    }
    
    loadData();
});