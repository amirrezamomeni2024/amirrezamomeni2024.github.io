<?php
// ==============================================
// فایل بک‌اند برای چک کردن لاگین
// رمزها اینجا هستند و از بیرون دیده نمی‌شوند
// ==============================================

// تنظیمات CORS برای دسترسی از فرانت‌اند
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// اگر درخواست OPTIONS بود (برای CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// فقط درخواست POST قبول میشه
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'فقط درخواست POST مجاز است']);
    exit();
}

// گرفتن داده‌های ارسالی
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// ========== اطلاعات کاربر (اینجا فقط شما می‌بینید) ==========
$valid_username = "0074644041";
$valid_password = "Amirreza1234";

// چک کردن اطلاعات
if ($username === $valid_username && $password === $valid_password) {
    // ساخت توکن ساده
    $token = bin2hex(random_bytes(32));
    
    // ذخیره توکن در جلسه (اختیاری)
    session_start();
    $_SESSION['auth_token'] = $token;
    $_SESSION['last_activity'] = time();
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'message' => 'ورود موفق'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'نام کاربری یا رمز عبور اشتباه است'
    ]);
}
?>
