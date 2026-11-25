import { useEffect, useRef, useState } from 'react';
import { FiSend, FiSquare } from 'react-icons/fi';

const MAX_LENGTH = 4000;

export default function Composer({ onSend, onStop, streaming }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  // Grow the textarea with its content, up to a limit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  useEffect(() => {
    if (!streaming) ref.current?.focus();
  }, [streaming]);

  const submit = () => {
    const value = text.trim();
    if (!value || streaming) return;
    onSend(value);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <footer className="composer">
      <div className="composer-box">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          placeholder="Message Nova…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Message"
        />
        {streaming ? (
          <button className="send-btn stop" onClick={onStop} aria-label="Stop generating">
            <FiSquare />
          </button>
        ) : (
          <button className="send-btn" onClick={submit} disabled={!text.trim()} aria-label="Send message">
            <FiSend />
          </button>
        )}
      </div>
      <p className="hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line · Nova can make mistakes.
      </p>
    </footer>
  );
}
