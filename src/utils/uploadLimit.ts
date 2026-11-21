/**
 * Admin Panel Upload Limit Configuration
 * Enforces up to 1 GB upload limits specifically for administrator workflows.
 */

export const ADMIN_MAX_UPLOAD_BYTES = 1024 * 1024 * 1024; // 1 GB = 1,073,741,824 bytes
export const ADMIN_MAX_UPLOAD_LABEL = "1 GB";

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function validateAdminUploadSize(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: true };
  if (file.size > ADMIN_MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" (${formatFileSize(file.size)}) exceeds the maximum admin upload limit of 1 GB.`,
    };
  }
  return { valid: true };
}
