<?php
// Konfigurasi database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pmodoro"; // Ganti dengan nama database Anda

// Membuat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Memeriksa koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Mendapatkan data dari permintaan
$data = json_decode(file_get_contents("php://input"), true);
if (isset($data['id'])) {
    $id = $data['id'];

    // Menyusun query SQL untuk menghapus data
    $sql = "DELETE FROM tasks WHERE id = ?";

    // Menyiapkan pernyataan
    if ($stmt = $conn->prepare($sql)) {
        // Mengikat parameter
        $stmt->bind_param("i", $id);

        // Menjalankan pernyataan dan memeriksa apakah berhasil
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal menghapus data."]);
        }

        // Menutup pernyataan
        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyiapkan pernyataan."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID tidak ditemukan."]);
}

// Menutup koneksi
$conn->close();
?>
