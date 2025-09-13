import React, { useState, useCallback, useEffect } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import debug from 'debug';

const log = debug('chat:global-dropzone');

interface GlobalDropZoneProps {
  onFileUpload: (file: File) => void;
  children: React.ReactNode;
}

export const GlobalDropZone: React.FC<GlobalDropZoneProps> = ({ onFileUpload, children }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const { validateFile, processFile, createFileAttachment } = useFileUpload({
    allowedTypes: ['*/*'], // Allow any file type
    onError: (error) => {
      log('File upload error:', error);
      // You could show a toast notification here
    }
  });

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      for (const file of files) {
        if (validateFile(file)) {
          try {
            // const dataUrl = await processFile(file);
            // const attachment = createFileAttachment(file, dataUrl);
            
            // Create a message-like object that can be sent
            // const fileMessage = {
            //   type: 'file',
            //   content: attachment
            // };
            
            // Call the upload handler
            onFileUpload(file);
          } catch (error) {
            log('Error processing file:', error);
          }
        }
      }
    }
  }, [validateFile, processFile, createFileAttachment, onFileUpload]);

  useEffect(() => {
    const handleDragEnterGlobal = (e: DragEvent) => handleDragEnter(e);
    const handleDragLeaveGlobal = (e: DragEvent) => handleDragLeave(e);
    const handleDragOverGlobal = (e: DragEvent) => handleDragOver(e);
    const handleDropGlobal = (e: DragEvent) => handleDrop(e);

    document.addEventListener('dragenter', handleDragEnterGlobal);
    document.addEventListener('dragleave', handleDragLeaveGlobal);
    document.addEventListener('dragover', handleDragOverGlobal);
    document.addEventListener('drop', handleDropGlobal);

    return () => {
      document.removeEventListener('dragenter', handleDragEnterGlobal);
      document.removeEventListener('dragleave', handleDragLeaveGlobal);
      document.removeEventListener('dragover', handleDragOverGlobal);
      document.removeEventListener('drop', handleDropGlobal);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <>
      {children}
      {isDragOver && (
        <div className="global-drop-overlay">
          <div className="drop-animation">
            <div className="drop-icon">📁</div>
            <div className="drop-text">Drop files here to upload</div>
            <div className="drop-subtext">Any file type supported</div>
          </div>
        </div>
      )}
    </>
  );
};
