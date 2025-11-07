<?php
$host = "localhost";
$db_name = "db_ecopoints";
$username = "root";
$password = "";

try {
    // Conexión a la base de datos
    $conn = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die(json_encode(["error" => "Error de conexión: " . $e->getMessage()]));
}
?>
