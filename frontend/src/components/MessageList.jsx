import { useEffect, useRef } from 'react';
import Message from './Message.jsx';

const SUGGESTIONS = [
  'Explain how virtual threads work in Java',
  'Write a React hook that debounces a value',
  'What is the difference between REST and GraphQL?',
  'Give me 5 tips to write cleaner code',
];

export default function MessageList({ messages, onSuggestion, onRetry, disabled }) {
  const endRef = useRef(null);
  const last = messages.at(-1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, last?.content]);

  if (messages.length === 0) {
    return (
      <section className="messages empty">
        <div className="welcome">
          <img src="/favicon.svg" alt="" className="welcome-logo" />
          <h2>Hi, I'm Nova</h2>
          <p>Ask me anything: code, concepts, ideas or quick answers.</p>
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => onSuggestion(s)} disabled={disabled}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="messages" aria-live="polite">
      {messages.map((m) => (
        <Message key={m.id} message={m} onRetry={() => onRetry(m.id)} canRetry={!disabled} />
      ))}
      <div ref={endRef} />
    </section>
  );
}
