import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Box } from '@mui/material'
import { useThemeMode } from '../hooks/useThemeMode'

interface MarkdownViewerProps {
  content: string
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const mode = useThemeMode((s) => s.mode)
  const codeStyle = mode === 'dark' ? oneDark : oneLight

  return (
    <Box
      sx={{
        '& h1': {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'text.primary',
          mt: 0,
          mb: 2,
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        },
        '& h2': {
          fontSize: '1rem',
          fontWeight: 600,
          color: 'text.primary',
          mt: 3,
          mb: 1.5,
        },
        '& h3': {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'text.primary',
          mt: 2,
          mb: 1,
        },
        '& p': {
          fontSize: '0.8125rem',
          color: 'text.primary',
          lineHeight: 1.6,
          mb: 1.5,
        },
        '& ul, & ol': {
          fontSize: '0.8125rem',
          color: 'text.primary',
          pl: 2.5,
          mb: 1.5,
        },
        '& li': {
          mb: 0.5,
        },
        '& code:not(pre code)': {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.75rem',
          bgcolor: 'action.hover',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
        },
        '& pre': {
          m: 0,
          mb: 2,
          borderRadius: 1,
          overflow: 'auto',
        },
        '& blockquote': {
          borderLeft: 3,
          borderColor: 'primary.main',
          pl: 2,
          ml: 0,
          color: 'text.secondary',
          fontStyle: 'italic',
        },
        '& hr': {
          border: 'none',
          borderTop: 1,
          borderColor: 'divider',
          my: 2,
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      }}
    >
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const inline = !match
            return !inline ? (
              <SyntaxHighlighter
                style={codeStyle}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
