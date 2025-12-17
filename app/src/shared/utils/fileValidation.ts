import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ERROR_MESSAGES } from '@/shared/constants';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate file size
 */
export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }
  return { isValid: true };
};

/**
 * Validate file type
 */
export const validateFileType = (file: File): FileValidationResult => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }
  return { isValid: true };
};

/**
 * Validate file (size and type)
 */
export const validateFile = (file: File): FileValidationResult => {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
