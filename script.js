let timer;
let isRunning = false;
let isBreak = false;
let currentTime; // Tambahkan variabel ini untuk menyimpan waktu saat ini

// Fungsi untuk memainkan suara notifikasi
const playNotificationSound = (type) => {
    const audio = new Audio(type === "break" ? "break-sound.mp3" : "work-sound.mp3");
    audio.play();
};

// Fungsi untuk menampilkan notifikasi yang menarik (elemen HTML)
const showNotification = (title, message) => {
    const notificationBox = document.createElement("div");
    notificationBox.className = "notification show";
    notificationBox.innerHTML = `
        <strong>${title}</strong>
        <p>${message}</p>
    `;
    document.body.appendChild(notificationBox);

    // Hilangkan notifikasi setelah beberapa detik
    setTimeout(() => {
        notificationBox.classList.add("hide");
        setTimeout(() => notificationBox.remove(), 500);
    }, 3000);
};

// Fungsi untuk menampilkan notifikasi sistem
const showSystemNotification = (title, message) => {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else {
        console.log("Permission for notifications not granted.");
    }
};

// Start timer logic
const startTimer = () => {
    if (isRunning) return;
    isRunning = true;

    const workTime = parseInt(document.getElementById("workTime").value) * 60;
    const breakTime = parseInt(document.getElementById("breakTime").value) * 60;

    if (!currentTime) { // Inisialisasi currentTime jika belum ada
        currentTime = isBreak ? breakTime : workTime;
    }

    const timerDisplay = document.getElementById("timer");

    timer = setInterval(() => {
        if (currentTime <= 0) {
            isBreak = !isBreak;
            clearInterval(timer);
            isRunning = false;
               // Mainkan suara dan tampilkan notifikasi sesuai jenis waktu
            if (isBreak) {
                playNotificationSound("break");
                showNotification("Waktunya Istirahat!", "Santai dan recharge!");
                showSystemNotification("Waktunya Istirahat!", "Santai dan recharge!"); // Menampilkan notifikasi sistem
            } else {
                playNotificationSound("work");
                showNotification("Waktunya Kerja!", "Fokus dan selesaikan tugasmu!");
                showSystemNotification("Waktunya Kerja!", "Fokus dan selesaikan tugasmu!"); // Menampilkan notifikasi sistem
            }
        
            // Mulai timer berikutnya
            currentTime = isBreak ? breakTime : workTime;
            startTimer();
        } else {
            currentTime--;
            const minutes = String(Math.floor(currentTime / 60)).padStart(2, "0");
            const seconds = String(currentTime % 60).padStart(2, "0");
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }
    }, 1000);
};

// Fungsi untuk toggle timer (mulai/jeda)
const toggleTimer = () => {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        document.getElementById("toggleTimer").textContent = "Mulai";
    } else {
        startTimer();
        isRunning = true;
        document.getElementById("toggleTimer").textContent = "Jeda";
    }
};

document.getElementById("toggleTimer").addEventListener("click", toggleTimer);
document.getElementById("resetTimer").addEventListener("click", () => {
    clearInterval(timer);
    isRunning = false;
    isBreak = false;
    currentTime = null; // Reset currentTime ketika reset

    // Ambil nilai dari input waktu kerja
    const workTimeInput = document.getElementById('workTime');
    const workTime = parseInt(workTimeInput.value) || 0; // Menggunakan 0 jika tidak valid
    const minutes = workTime > 0 ? workTime : 0; // Pastikan tidak negatif
    const seconds = 0; // Reset detik ke 0

    // Update tampilan timer
    document.getElementById("timer").textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById("toggleTimer").textContent = "Mulai";
});

// Front-End: To-Do List Logic
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoItems = document.getElementById("todoItems");

todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const task = todoInput.value;
    const response = await fetch("save_task.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
    });
    if (response.ok) {
        const data = await response.json();
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.dataset.id = data.id; // Store task ID in a data attribute
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" /> 
            <span class="task-text">${task}</span>
            <button class="btn btn-danger btn-sm delete-btn">Hapus</button>
        `;
        todoItems.appendChild(li);
        todoInput.value = ""; // Reset input
    }
});

// Menghapus tugas dari database dan DOM
todoItems.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const taskId = e.target.parentElement.dataset.id; // Ambil ID tugas dari atribut data
        
        try {
            // Kirim permintaan untuk menghapus tugas dari database
            const response = await fetch("delete_task.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId }),
            });

            // Pastikan respons dari server adalah JSON
            const result = await response.json();

            // Jika penghapusan berhasil
            if (result.status === "success") {
                e.target.parentElement.remove(); // Hapus item tugas dari DOM
            } else {
                alert("Error: " + result.message); // Menampilkan error jika gagal
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus tugas: " + error.message);
        }
        
    } else if (e.target.classList.contains("task-checkbox")) {
        e.target.nextElementSibling.classList.toggle("completed"); // Toggle status selesai
    }
});

// Load tasks from server
const loadTasks = async () => {
    const response = await fetch("get_tasks.php");
    const tasks = await response.json();
    tasks.forEach(({ id, task }) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.dataset.id = id; // Store task ID in a data attribute
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" /> 
            <span class="task-text">${task}</span>
            <button class="btn btn-danger btn-sm delete-btn">Hapus</button>
        `;
        todoItems.appendChild(li);
    });

    // Menangani Spotify player
    document.getElementById('updatePlayer').addEventListener('click', function () {
        const urlInput = document.getElementById('spotifyUrl').value.trim();
        const spotifyPlayer = document.getElementById('spotifyPlayer');
    
        // Validasi URL dan ubah ke format embed
        if (urlInput.includes("open.spotify.com")) {
            const embedUrl = urlInput.replace('open.spotify.com', 'open.spotify.com/embed');
            spotifyPlayer.src = embedUrl;
        } 
    });

    // Ambil elemen dari DOM
    const spotifyUrlInput = document.getElementById("spotifyUrl");
    const updatePlayerButton = document.getElementById("updatePlayer");
    const savePlaylistButton = document.getElementById("savePlaylist");
    const spotifyPlayer = document.getElementById("spotifyPlayer");

    // Cek apakah ada URL yang sudah disimpan sebelumnya di localStorage
    const savedUrl = localStorage.getItem("spotifyUrl");
    if (savedUrl) {
        // Jika ada, tampilkan di input field dan update iframe
        spotifyUrlInput.value = savedUrl;
        updateSpotifyPlayer(savedUrl); // Memanggil fungsi update untuk memperbarui iframe
    }

    // Fungsi untuk mendapatkan track ID dari URL Spotify
    function getTrackId(url) {
        const trackRegex = /track\/([a-zA-Z0-9]+)/;
        const playlistRegex = /playlist\/([a-zA-Z0-9]+)/;
        
        // Cek apakah URL sesuai dengan format track atau playlist
        let match = url.match(trackRegex);
        if (match) return { type: 'track', id: match[1] };
        
        match = url.match(playlistRegex);
        if (match) return { type: 'playlist', id: match[1] };
        
        return null; // Tidak valid
    }

    // Fungsi untuk memperbarui pemutar Spotify
    function updateSpotifyPlayer(url) {
        const track = getTrackId(url);
        if (track) {
            if (track.type === 'track') {
                // Jika track, gunakan format embed untuk lagu
                spotifyPlayer.src = `https://open.spotify.com/embed/track/${track.id}`;
            } else if (track.type === 'playlist') {
                // Jika playlist, gunakan format embed untuk playlist
                spotifyPlayer.src = `https://open.spotify.com/embed/playlist/${track.id}`;
            }
        } 
    }
    

    // Fungsi untuk menyimpan playlist ke localStorage
    function savePlaylist() {
        const url = spotifyUrlInput.value.trim();
        const track = getTrackId(url);
        if (track) {
            // Simpan URL playlist atau track ke
                        // Simpan URL playlist atau track ke localStorage
                        localStorage.setItem("spotifyUrl", url);
                        alert("Playlist berhasil disimpan!");
                    } 
                }
            
                // Event listener untuk tombol 'Putar'
                updatePlayerButton.addEventListener("click", function () {
                    const url = spotifyUrlInput.value.trim();
                    updateSpotifyPlayer(url); // Perbarui pemutar Spotify
                });
            
                // Event listener untuk tombol 'Simpan Playlist'
                savePlaylistButton.addEventListener("click", savePlaylist);
            };
            
            // Meminta izin notifikasi
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }


          
            loadTasks();
            