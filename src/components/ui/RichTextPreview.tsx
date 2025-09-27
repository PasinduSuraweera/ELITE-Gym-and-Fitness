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
      className={`prose prose-foreground dark:prose-invert max-w-none text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Custom prose styles for the preview
        wordWrap: 'break-word',
        lineHeight: '1.7',
        // Theme-compatible colors using CSS variables
        '--tw-prose-body': 'hsl(var(--foreground))',
        '--tw-prose-headings': 'hsl(var(--foreground))',
        '--tw-prose-lead': 'hsl(var(--muted-foreground))',
        '--tw-prose-links': 'hsl(var(--primary))',
        '--tw-prose-bold': 'hsl(var(--foreground))',
        '--tw-prose-counters': 'hsl(var(--muted-foreground))',
        '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
        '--tw-prose-hr': 'hsl(var(--border))',
        '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
        '--tw-prose-quote-borders': 'hsl(var(--primary))',
        '--tw-prose-captions': 'hsl(var(--muted-foreground))',
        '--tw-prose-code': 'hsl(var(--foreground))',
        '--tw-prose-pre-code': 'hsl(var(--foreground))',
        '--tw-prose-pre-bg': 'hsl(var(--muted))',
        '--tw-prose-th-borders': 'hsl(var(--border))',
        '--tw-prose-td-borders': 'hsl(var(--border))'
      } as React.CSSProperties}
    />
  );
};
