<?php
$pdo = new PDO("mysql:host=localhost;dbname=pmodoro", "root", "");
$stmt = $pdo->query("SELECT * FROM tasks");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
