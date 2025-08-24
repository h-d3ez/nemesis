<?php
// Utility functions for the Nemesis application

// Sanitize input data
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Check if user is logged in
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Get current user information
function get_logged_in_user() {
    if (!is_logged_in()) {
        return null;
    }
    
    global $db;
    try {
        $stmt = $db->prepare("SELECT id, name, email, role, profile_image_path, bio, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error getting current user: " . $e->getMessage());
        return null;
    }
}

// Validate email format
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Validate password strength
function validate_password($password) {
    // At least 6 characters
    return strlen($password) >= 6;
}

// Hash password
function hash_password($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verify password
function verify_password($password, $hash) {
    return password_verify($password, $hash);
}

// Generate random token
function generate_token($length = 32) {
    return bin2hex(random_bytes($length));
}

// Success response
function success_response($message, $data = null, $code = 200) {
    http_response_code($code);
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        if (is_array($data)) {
            $response = array_merge($response, $data);
        } else {
            $response['data'] = $data;
        }
    }
    echo json_encode($response);
    exit;
}

// Error response
function error_response($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// Check user role
function check_role($required_roles) {
    if (!is_logged_in()) {
        return false;
    }
    
    $user = get_logged_in_user();
    if (!$user) {
        return false;
    }
    
    if (is_string($required_roles)) {
        $required_roles = [$required_roles];
    }
    
    return in_array($user['role'], $required_roles);
}

// File upload validation
function validate_file_upload($file, $allowed_types = [], $max_size = null) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'File upload error'];
    }
    
    if (!empty($allowed_types) && !in_array($file['type'], $allowed_types)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }
    
    if ($max_size && $file['size'] > $max_size) {
        return ['success' => false, 'message' => 'File too large'];
    }
    
    return ['success' => true];
}

// Create upload directory if it doesn't exist
function ensure_upload_directory($path) {
    if (!file_exists($path)) {
        mkdir($path, 0755, true);
    }
}

// Generate unique filename
function generate_unique_filename($original_name, $prefix = '') {
    $extension = pathinfo($original_name, PATHINFO_EXTENSION);
    return $prefix . uniqid() . '_' . time() . '.' . $extension;
}

// Log activity
function log_activity($user_id, $action, $details = '') {
    global $db;
    try {
        $stmt = $db->prepare("INSERT INTO activity_log (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$user_id, $action, $details]);
    } catch (PDOException $e) {
        error_log("Error logging activity: " . $e->getMessage());
    }
}

// Format date for display
function format_date($date, $format = 'Y-m-d H:i:s') {
    if (is_string($date)) {
        $date = new DateTime($date);
    }
    return $date->format($format);
}

// Truncate text
function truncate_text($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    return substr($text, 0, $length) . $suffix;
}

// Clean filename for URL
function clean_filename($filename) {
    // Remove special characters and spaces
    $clean = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    // Remove multiple underscores
    $clean = preg_replace('/_+/', '_', $clean);
    // Remove leading/trailing underscores
    return trim($clean, '_');
}

// Get file extension
function get_file_extension($filename) {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}

// Check if file is image
function is_image_file($filename) {
    $image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    return in_array(get_file_extension($filename), $image_extensions);
}

// Convert bytes to human readable format
function format_bytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

// Escape HTML output
function escape_html($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

// Generate excerpt from content
function generate_excerpt($content, $length = 150) {
    $content = strip_tags($content);
    return truncate_text($content, $length);
}
?>