<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$backupDir = 'Backups/';
date_default_timezone_set('Asia/Tehran');

if (!file_exists($backupDir)) {
    mkdir($backupDir, 0777, true);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'No data']);
    exit;
}

$date = date('Y-n-j');
$time = date('g-i-s_A');
$filename = $date . '_' . $time . '.json';

$backupData = [
    'date' => date('Y-m-d H:i:s'),
    'products' => $input['products'] ?? [],
    'invoices' => $input['invoices'] ?? [],
    'nextId' => $input['nextId'] ?? 1
];

file_put_contents($backupDir . $filename, json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true, 'file' => $filename]);
?>
