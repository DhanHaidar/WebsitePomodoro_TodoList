<?php
$pdo = new PDO("mysql:host=localhost;dbname=pmodoro", "root", "");
$data = json_decode(file_get_contents("php://input"), true);
$task = $data['task'];

// Menyimpan task baru
$stmt = $pdo->prepare("INSERT INTO tasks (task, completed) VALUES (:task, false)");
$stmt->execute(['task' => $task]);

// Mengambil data terbaru untuk refresh otomatis
$stmt = $pdo->prepare("SELECT * FROM tasks");
$stmt->execute();
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mengembalikan data dalam format JSON
echo json_encode(["status" => "success", "tasks" => $tasks]);
?>
