<?php
// ==============================================
// چک کردن اعتبار توکن و عدم فعالیت 5 دقیقه
// ==============================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';

// چک کردن توکن و زمان آخرین فعالیت
if (isset($_SESSION['auth_token']) && $_SESSION['auth_token'] === $token) {
    $last_activity = $_SESSION['last_activity'] ?? 0;
    $now = time();
    
    // اگر بیشتر از 5 دقیقه (300 ثانیه) گذشته باشه
    if ($now - $last_activity > 300) {
        session_destroy();
        echo json_encode(['valid' => false, 'error' => 'زمان نشست به پایان رسیده']);
    } else {
        // بروزرسانی زمان آخرین فعالیت
        $_SESSION['last_activity'] = $now;
        echo json_encode(['valid' => true]);
    }
} else {
    echo json_encode(['valid' => false, 'error' => 'توکن نامعتبر']);
}
?>
