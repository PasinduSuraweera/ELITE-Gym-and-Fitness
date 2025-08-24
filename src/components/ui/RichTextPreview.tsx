"use client";

interface RichTextPreviewProps {
  content: string;
  className?: string;
}

export const RichTextPreview: React.FC<RichTextPreviewProps> = ({
  content,
  className = ""
}) => {
  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Custom prose styles for the preview
        wordWrap: 'break-word',
        lineHeight: '1.7'
      }}
    />
  );
};
