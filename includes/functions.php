<?php
/**
 * Utility Functions
 * Nemesis Book Website Backend
 */

session_start();

// Security functions
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function generate_token($length = 32) {
    return bin2hex(random_bytes($length));
}

function hash_password($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verify_password($password, $hash) {
    return password_verify($password, $hash);
}

// Authentication functions
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function get_logged_in_user() {
    global $db;
    if (!is_logged_in()) {
        return null;
    }
    
    $stmt = $db->prepare("SELECT id, name, email, role, avatar, bio FROM users WHERE id = ? AND is_active = 1");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

function login_user($email, $password) {
    global $db;
    
    $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && verify_password($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        return true;
    }
    
    return false;
}

function logout_user() {
    session_destroy();
    return true;
}

function register_user($name, $email, $password, $role = 'reader') {
    global $db;
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['success' => false, 'message' => 'Email already exists'];
    }
    
    $hashed_password = hash_password($password);
    
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $email, $hashed_password, $role])) {
        return ['success' => true, 'message' => 'Registration successful'];
    }
    
    return ['success' => false, 'message' => 'Registration failed'];
}

// Response functions
function json_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function success_response($message, $data = null) {
    $response = ['success' => true, 'message' => $message];
    if ($data) {
        $response['data'] = $data;
    }
    json_response($response);
}

function error_response($message, $status_code = 400) {
    json_response(['success' => false, 'message' => $message], $status_code);
}

// Validation functions
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_password($password) {
    return strlen($password) >= 6;
}

function validate_required($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        if (empty($data[$field])) {
            $errors[] = ucfirst($field) . ' is required';
        }
    }
    return $errors;
}

// File upload functions
function upload_file($file, $directory = 'uploads/') {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'message' => 'Invalid file parameter'];
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'File upload failed'];
    }
    
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowed_types)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }
    
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        return ['success' => false, 'message' => 'File too large'];
    }
    
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
    
    $filename = uniqid() . '_' . basename($file['name']);
    $filepath = $directory . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'filepath' => $filepath];
    }
    
    return ['success' => false, 'message' => 'Failed to save file'];
}

// Database helper functions
function get_setting($key, $default = null) {
    global $db;
    $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $result = $stmt->fetch();
    return $result ? $result['setting_value'] : $default;
}

function set_setting($key, $value, $description = null) {
    global $db;
    $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, description = ?");
    return $stmt->execute([$key, $value, $description, $value, $description]);
}

// Pagination function
function paginate($query, $params = [], $page = 1, $per_page = 10) {
    global $db;
    
    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM ($query) as subquery";
    $stmt = $db->prepare($count_query);
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Calculate pagination
    $total_pages = ceil($total / $per_page);
    $offset = ($page - 1) * $per_page;
    
    // Get paginated results
    $paginated_query = $query . " LIMIT $per_page OFFSET $offset";
    $stmt = $db->prepare($paginated_query);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    
    return [
        'data' => $results,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'total_pages' => $total_pages,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ]
    ];
}

// CSRF protection
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = generate_token();
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Logging function
function log_activity($user_id, $action, $details = null) {
    global $db;
    $stmt = $db->prepare("INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))");
    $stmt->execute([$user_id, $action, $_SERVER['REMOTE_ADDR'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '']);
}

// Date formatting
function format_date($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

// Price formatting
function format_price($price) {
    return '$' . number_format($price, 2);
}

// Role checking
function has_role($role) {
    $user = get_logged_in_user();
    return $user && $user['role'] === $role;
}

function is_admin() {
    return has_role('editor');
}

function is_author() {
    return has_role('author');
}

// API rate limiting (simple implementation)
function check_rate_limit($key, $max_requests = 100, $time_window = 3600) {
    $cache_file = "cache/rate_limit_$key.txt";
    $current_time = time();
    
    if (file_exists($cache_file)) {
        $data = json_decode(file_get_contents($cache_file), true);
        if ($current_time - $data['timestamp'] < $time_window) {
            if ($data['count'] >= $max_requests) {
                return false;
            }
            $data['count']++;
        } else {
            $data = ['count' => 1, 'timestamp' => $current_time];
        }
    } else {
        $data = ['count' => 1, 'timestamp' => $current_time];
    }
    
    if (!is_dir('cache')) {
        mkdir('cache', 0755, true);
    }
    
    file_put_contents($cache_file, json_encode($data));
    return true;
}
?>