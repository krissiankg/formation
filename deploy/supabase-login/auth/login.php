<?php
declare(strict_types=1);

$config = require '/www/docker/supabase/gate-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /login/', true, 302);
    exit;
}

$username = trim((string) ($_POST['username'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$next = (string) ($_POST['next'] ?? '/');

if ($next === '' || $next[0] !== '/' || str_starts_with($next, '//')) {
    $next = '/';
}

$validUser = $config['username'] ?? '';
$validPass = $config['password'] ?? '';

if ($username !== $validUser || !hash_equals($validPass, $password)) {
    header('Location: /login/?error=invalid&next=' . rawurlencode($next), true, 302);
    exit;
}

$expiry = time() + 60 * 60 * 24 * 7;
$payload = $username . '|' . $expiry;
$signature = hash_hmac('sha256', $payload, $config['secret']);
$token = base64_encode($payload . '|' . $signature);

setcookie('sb_gate', $token, [
    'expires' => $expiry,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

header('Location: ' . $next, true, 302);
exit;
