<?php
declare(strict_types=1);

$config = require '/www/docker/supabase/gate-config.php';
$token = $_COOKIE['sb_gate'] ?? '';

if ($token === '') {
    http_response_code(401);
    exit;
}

$decoded = base64_decode($token, true);
if ($decoded === false) {
    http_response_code(401);
    exit;
}

$parts = explode('|', $decoded);
if (count($parts) !== 3) {
    http_response_code(401);
    exit;
}

[$user, $expiry, $signature] = $parts;
$payload = $user . '|' . $expiry;
$expected = hash_hmac('sha256', $payload, $config['secret']);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit;
}

if ((int) $expiry < time()) {
    http_response_code(401);
    exit;
}

if ($user !== ($config['username'] ?? '')) {
    http_response_code(401);
    exit;
}

http_response_code(200);
exit;
