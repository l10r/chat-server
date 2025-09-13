import React from 'react';
import type { Message } from '../types/chat';
import { AudioPlayer } from './AudioPlayer';
import { ImagePreview } from './ImagePreview';
import { FileAttachment } from './FileAttachment';
import { MarkdownRenderer } from './MarkdownRenderer';

interface EmojiReplacerProps {
  content: string | Message['m'];
}

export const EmojiReplacer: React.FC<EmojiReplacerProps> = ({ content }) => {
  console.log('EmojiReplacer content:', content, 'type:', typeof content);
  
  // Process emoji shortcodes in string content
  const processEmojis = (text: string) => {
    return text.replace(/\*([^*]+)\*/g, (_, slug) => {
      return `<img src="/static/emic/${slug}.png" width="20" height="20" alt="${slug}" style="display: inline-block; vertical-align: middle;" />`;
    });
  };

  // Handle null/undefined content
  if (!content) {
    return <span style={{ whiteSpace: 'pre-wrap' }}></span>;
  }

  // Handle string content
  if (typeof content === 'string') {
    const processedContent = processEmojis(content);
    return <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: processedContent }} />;
  }

  // Handle object content
  if (typeof content === 'object') {
    // Handle text messages with emojis
    if (content.text && typeof content.text === 'string') {
      const processedContent = processEmojis(content.text);
      return <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    // Handle file attachments - check for any file-like properties
    const hasFileProperties = content.type || content.url || content.name || content.blob;
    
    if (hasFileProperties) {
      // Ensure we have minimum required properties
      const fileUrl = content.url || (content.blob ? URL.createObjectURL(content.blob) : '');
      const fileName = content.name || 'Unknown file';
      const fileType = content.type || 'application/octet-stream';
      
      if (fileUrl) {
        // Handle images
        if (fileType.match(/image\//) || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif|heic|heif|avif)$/i)) {
          return (
            <ImagePreview 
              src={fileUrl}
              alt={fileName}
              fileName={fileName}
            />
          );
        }

        // Handle audio
        if (fileType.match(/audio\//) || fileName.match(/\.(mp3|wav|flac|aac|ogg|wma|m4a|opus|aiff|au)$/i)) {
          return (
            <AudioPlayer 
              src={fileUrl} 
              type={fileType} 
              name={fileName} 
            />
          );
        }

        // Handle video
        if (fileType.match(/video\//) || fileName.match(/\.(mp4|avi|mkv|mov|wmv|flv|webm|m4v|3gp|ogv)$/i)) {
          return (
            <video controls style={{ maxWidth: '100%', height: 'auto' }}>
              <source src={fileUrl} type={fileType} />
              Your browser does not support the video tag.
            </video>
          );
        }

        // Handle all other files
        return (
          <FileAttachment
            url={fileUrl}
            name={fileName}
            type={fileType}
            size={content.size}
          />
        );
      }
    }

    // Handle other object types - try to extract meaningful content
    const anyContent = content as any; // Type assertion for flexible content handling
    
    if (anyContent.message && typeof anyContent.message === 'string') {
      const processedContent = processEmojis(anyContent.message);
      return <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    if (anyContent.data && typeof anyContent.data === 'string') {
      const processedContent = processEmojis(anyContent.data);
      return <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    if (anyContent.content && typeof anyContent.content === 'string') {
      const processedContent = processEmojis(anyContent.content);
      return <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    // If it's an object but we can't extract meaningful content, show a warning
    console.warn('Unexpected message content object:', content);
    return (
      <span style={{ whiteSpace: 'pre-wrap', color: '#ff6b6b', fontStyle: 'italic' }}>
        [Unsupported message format]
      </span>
    );
  }

  // Handle any other type (number, boolean, etc.)
  return <span style={{ whiteSpace: 'pre-wrap' }}>{String(content)}</span>;
};