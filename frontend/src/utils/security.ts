// Frontend security utilities

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Whether email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate student ID format
 * @param studentId - Student ID to validate
 * @returns Whether student ID is valid
 */
export function validateStudentId(studentId: string): boolean {
  // Allow alphanumeric characters and common separators
  const studentIdRegex = /^[a-zA-Z0-9\-_]+$/;
  return studentIdRegex.test(studentId) && studentId.length >= 3 && studentId.length <= 20;
}

/**
 * Escape HTML to prevent XSS
 * @param unsafe - Unsafe HTML string
 * @returns Escaped HTML string
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate CSRF token for forms
 * @returns CSRF token
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Validate file type for uploads
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Whether file type is allowed
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeInMB - Maximum size in MB
 * @returns Whether file size is valid
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}