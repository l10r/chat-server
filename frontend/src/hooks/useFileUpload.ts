import { useCallback } from 'react';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onError?: (error: string) => void;
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxSize = Infinity, // No size limit
    allowedTypes = ['*/*'], // Allow any file type
    onError
  } = options;

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      const error = maxSize === Infinity 
        ? 'File size limit exceeded' 
        : `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
      onError?.(error);
      return false;
    }

    // Check file type - be very permissive
    const isValidType = allowedTypes.some(type => {
      if (type === '*/*') {
        return true; // Allow any file type
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    // If no valid type found, but we allow any type, just warn but don't fail
    if (!isValidType && allowedTypes.includes('*/*')) {
      console.warn(`Unknown file type: ${file.type} for file: ${file.name}`);
      return true; // Allow it anyway
    }

    if (!isValidType) {
      const error = `File type ${file.type || 'unknown'} is not allowed`;
      onError?.(error);
      return false;
    }

    return true;
  }, [maxSize, allowedTypes, onError]);

  const processFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Always validate first
      if (!validateFile(file)) {
        reject(new Error('File validation failed'));
        return;
      }

      // Handle very large files more gracefully
      if (file.size > 100 * 1024 * 1024) { // 100MB
        console.warn(`Processing large file: ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)`);
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error('Failed to read file - no result'));
          }
        } catch (error) {
          console.error('Error processing file result:', error);
          reject(new Error('Error processing file data'));
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error(`Error reading file: ${file.name}`));
      };

      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        reject(new Error('Failed to start reading file'));
      }
    });
  }, [validateFile]);

  const createFileAttachment = useCallback((file: File, dataUrl: string) => {
    return {
      type: file.type,
      url: dataUrl,
      name: file.name,
      size: file.size
    };
  }, []);

  return {
    validateFile,
    processFile,
    createFileAttachment
  };
};
