import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import debug from 'debug';

const log = debug('chat:file-attachment');
import { 
  FaFile, 
  FaFileImage, 
  FaFileAudio, 
  FaFileVideo, 
  FaFilePdf, 
  FaFileArchive, 
  FaFileWord, 
  FaFileExcel, 
  FaFilePowerpoint, 
  FaFileCode,
  FaFileAlt
} from 'react-icons/fa';

interface FileAttachmentProps {
  url: string;
  name: string;
  type: string;
  size?: number;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ url, name, type, size }) => {
  log('FileAttachment props:', { url, name, type, size });
  
  const getFileIcon = (fileType: string, fileName: string) => {
    log('Getting icon for file type:', fileType, 'filename:', fileName);
    
    // Get file extension from filename as fallback
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Check MIME type first
    if (fileType && fileType.match(/image\//)) return <FaFileImage />;
    if (fileType && fileType.match(/audio\//)) return <FaFileAudio />;
    if (fileType && fileType.match(/video\//)) return <FaFileVideo />;
    if (fileType && fileType.match(/application\/pdf/)) return <FaFilePdf />;
    
    // Check by file extension (more comprehensive)
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'heic', 'heif', 'avif'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff', 'au'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'ogv'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso', 'deb', 'rpm', 'pkg', 'msi', 'exe', 'app'];
    const docExts = ['doc', 'docx', 'odt', 'rtf', 'pages'];
    const sheetExts = ['xls', 'xlsx', 'ods', 'csv', 'numbers'];
    const presentationExts = ['ppt', 'pptx', 'odp', 'key'];
    const textExts = ['txt', 'md', 'rtf', 'log', 'ini', 'cfg', 'conf', 'yaml', 'yml', 'toml'];
    const codeExts = ['js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'clj', 'hs', 'ml', 'fs', 'vb', 'cs', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'];
    // Additional file type categories for future use
    // const dataExts = ['db', 'sqlite', 'sqlite3', 'mdb', 'accdb'];
    // const fontExts = ['ttf', 'otf', 'woff', 'woff2', 'eot'];
    // const cadExts = ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs'];
    // const designExts = ['psd', 'ai', 'sketch', 'fig', 'xd'];
    
    // Check extensions
    if (imageExts.includes(extension)) return <FaFileImage />;
    if (audioExts.includes(extension)) return <FaFileAudio />;
    if (videoExts.includes(extension)) return <FaFileVideo />;
    if (extension === 'pdf') return <FaFilePdf />;
    if (archiveExts.includes(extension)) return <FaFileArchive />;
    if (docExts.includes(extension)) return <FaFileWord />;
    if (sheetExts.includes(extension)) return <FaFileExcel />;
    if (presentationExts.includes(extension)) return <FaFilePowerpoint />;
    if (textExts.includes(extension)) return <FaFileAlt />;
    if (codeExts.includes(extension)) return <FaFileCode />;
    
    // Fallback for unknown types
    return <FaFile />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="file-attachment">
      <div className="file-attachment-content">
        <div className="file-icon">
          {getFileIcon(type, name)}
        </div>
        <div className="file-info">
          <div className="file-name" title={name}>
            {name}
          </div>
          <div className="file-meta">
            <span className="file-type">{getFileExtension(name)}</span>
            {size && <span className="file-size">{formatFileSize(size)}</span>}
          </div>
        </div>
        <Tooltip title="Download file">
          <IconButton 
            onClick={handleDownload}
            size="small"
            className="download-button"
            sx={{
              color: '#4a9eff',
              '&:hover': {
                backgroundColor: 'rgba(74, 158, 255, 0.1)'
              }
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};
