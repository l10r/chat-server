import React from 'react';
import type { Message } from '../types/chat';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { ImagePreview } from './ImagePreview';
import { FileAttachment } from './FileAttachment';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LongContentHandler } from './LongContentHandler';
import debug from 'debug';

const log = debug('chat:emoji-replacer');

interface EmojiReplacerProps {
  content: string | Message['m'];
}

export const EmojiReplacer: React.FC<EmojiReplacerProps> = ({ content }) => {
  
  // Safe emoji rendering - split text and render emojis as React components
  const renderTextWithEmojis = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g); 
    
    return parts.map((part, index) => {
      const emojiMatch = part.match(/\*([^*]+)\*/);
      if (emojiMatch) {
        const slug = emojiMatch[1];
        return (
          <img 
            key={index}
            src={`/static/emic/${slug}.png`} 
            width="32" 
            height="32" 
            alt={slug}
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }
      return part;
    });
  };

  // Check if content contains markdown syntax
  const containsMarkdown = (text: string): boolean => {
    // First check if it's just emojis (no markdown)
    const emojiOnlyPattern = /^(\*[^*]+\*\s*)+$/;
    if (emojiOnlyPattern.test(text.trim())) {
      return false; // Don't process as markdown if it's just emojis
    }
    
    const markdownPatterns = [
      /```[\s\S]*?```/, // Code blocks
      /`[^`]+`/, // Inline code
      /#{1,6}\s+/, // Headers
      /\*\*[^*]+\*\*/, // Bold (but not single asterisks for emojis)
      /~~[^~]+~~/, // Strikethrough
      /\[[^\]]+\]\([^)]+\)/, // Links
      /!\[[^\]]*\]\([^)]+\)/, // Images
      /^\s*[-*+]\s+/m, // Lists
      /^\s*\d+\.\s+/m, // Numbered lists
      /^\s*>\s+/m, // Blockquotes
      /^\s*\|.*\|.*\|/m, // Tables
      /^---+$/m, // Horizontal rules
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // Convert URLs to markdown links, but skip code blocks
  const convertUrlsToMarkdown = (text: string): string => {
    // Split text by code blocks to preserve them
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts = text.split(codeBlockRegex);
    const codeBlocks = text.match(codeBlockRegex) || [];
    
    // Convert URLs only in non-code parts
    const convertedParts = parts.map(part => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return part.replace(urlRegex, '[$1]($1)');
    });
    
    // Reconstruct the text with converted URLs but preserved code blocks
    let result = convertedParts[0];
    for (let i = 0; i < codeBlocks.length; i++) {
      result += codeBlocks[i] + convertedParts[i + 1];
    }
    
    return result;
  };

  // Extract common text rendering logic
  const renderTextContent = (text: string) => {
    // Convert URLs to markdown links first
    const textWithLinks = convertUrlsToMarkdown(text);
    
    if (containsMarkdown(textWithLinks)) {
      return (
        <LongContentHandler 
          content={<MarkdownRenderer content={textWithLinks} />}
          maxHeight="300px"
          maxLines={15}
          title="Full Message"
        >
          <MarkdownRenderer content={textWithLinks} />
        </LongContentHandler>
      );
    }
    return <span style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithEmojis(text)}</span>;
  };

  // Extract file type detection logic
  const isImageFile = (fileType: string, fileName: string): boolean => {
    return !!(fileType.match(/image\//) || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif|heic|heif|avif)$/i));
  };

  const isAudioFile = (fileType: string, fileName: string): boolean => {
    return !!(fileType.match(/audio\//) || fileName.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma|aiff|au)$/i));
  };

  const isVideoFile = (fileType: string, fileName: string): boolean => {
    return !!(fileType.match(/video\//) || fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|ogv)$/i));
  };

  // Handle null/undefined content
  if (!content) {
    return <span style={{ whiteSpace: 'pre-wrap' }}></span>;
  }

  // Handle string content
  if (typeof content === 'string') {
    return renderTextContent(content);
  }

  // Handle object content
  if (typeof content === 'object') {
    // Handle text messages with emojis
    if (content.text && typeof content.text === 'string') {
      return renderTextContent(content.text);
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
        if (isImageFile(fileType, fileName)) {
          return (
            <ImagePreview 
              src={fileUrl}
              alt={fileName}
              fileName={fileName}
            />
          );
        }

        // Handle audio
        if (isAudioFile(fileType, fileName)) {
          return (
            <CustomAudioPlayer 
              src={fileUrl} 
              type={fileType} 
              name={fileName}
              duration={content.duration}
            />
          );
        }

        // Handle video
        if (isVideoFile(fileType, fileName)) {
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
      return renderTextContent(anyContent.message);
    }

    if (anyContent.data && typeof anyContent.data === 'string') {
      return renderTextContent(anyContent.data);
    }

    if (anyContent.content && typeof anyContent.content === 'string') {
      return renderTextContent(anyContent.content);
    }

    // If it's an object but we can't extract meaningful content, show a warning
    log('Unexpected message content object:', content);
    return (
      <span style={{ whiteSpace: 'pre-wrap', color: '#ff6b6b', fontStyle: 'italic' }}>
        [Unsupported message format]
      </span>
    );
  }

  // Handle any other type (number, boolean, etc.)
  return <span style={{ whiteSpace: 'pre-wrap' }}>{String(content)}</span>;
};