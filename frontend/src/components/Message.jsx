import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiAlertTriangle, FiCheck, FiCopy, FiRefreshCw, FiUser } from 'react-icons/fi';

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };
  return (
    <button className="copy-btn" onClick={copy} aria-label={label}>
      {copied ? <FiCheck /> : <FiCopy />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

function CodeBlock({ children, ...props }) {
  const code = children?.props?.children;
  const language = /language-(\w+)/.exec(children?.props?.className || '')?.[1];
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{language || 'code'}</span>
        <CopyButton text={String(code ?? '').replace(/\n$/, '')} />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}

const markdownComponents = {
  pre: CodeBlock,
  a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ message, onRetry, canRetry }) {
  const isUser = message.role === 'user';

  return (
    <article className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="avatar" aria-hidden="true">
        {isUser ? <FiUser /> : <img src="/favicon.svg" alt="" />}
      </div>

      <div className="bubble-wrap">
        <div className="bubble">
          {isUser ? (
            <p className="plain">{message.content}</p>
          ) : message.pending && !message.content ? (
            <span className="typing" aria-label="Nova is typing">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              {message.pending && <span className="cursor" />}
            </div>
          )}

          {message.error && (
            <div className="error">
              <FiAlertTriangle /> {message.error}
            </div>
          )}
          {message.stopped && <div className="note">Response stopped.</div>}
        </div>

        <div className="meta">
          <span>{formatTime(message.createdAt)}</span>
          {!isUser && !message.pending && message.content && <CopyButton text={message.content} />}
          {!isUser && message.error && canRetry && (
            <button className="copy-btn" onClick={onRetry}>
              <FiRefreshCw />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
