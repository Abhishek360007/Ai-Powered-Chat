import { useEffect, useRef, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './components/Sidebar.jsx';
import MessageList from './components/MessageList.jsx';
import Composer from './components/Composer.jsx';
import { useConversations } from './useConversations.js';
import { streamChat, clearConversation } from './api.js';

function initialTheme() {
  const saved = localStorage.getItem('nova.theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function App() {
  const { conversations, active, setActiveId, create, remove, updateMessages } = useConversations();
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const abortRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('nova.theme', theme);
  }, [theme]);

  const send = async (text) => {
    const conversationId = active.id;
    const replyId = crypto.randomUUID();

    updateMessages(conversationId, (messages) => [
      ...messages,
      { id: crypto.randomUUID(), role: 'user', content: text, createdAt: Date.now() },
      { id: replyId, role: 'assistant', content: '', createdAt: Date.now(), pending: true },
    ]);

    const patchReply = (patch) =>
      updateMessages(conversationId, (messages) =>
        messages.map((m) => (m.id === replyId ? { ...m, ...patch(m) } : m)),
      );

    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    try {
      await streamChat({
        message: text,
        conversationId,
        signal: controller.signal,
        onToken: (token) => patchReply((m) => ({ content: m.content + token })),
      });
      patchReply(() => ({ pending: false }));
    } catch (err) {
      if (err.name === 'AbortError') {
        patchReply((m) => ({ pending: false, stopped: true, content: m.content }));
      } else {
        patchReply(() => ({ pending: false, error: err.message || 'Something went wrong.' }));
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const retry = (assistantId) => {
    const index = active.messages.findIndex((m) => m.id === assistantId);
    const prompt = active.messages[index - 1];
    if (!prompt || prompt.role !== 'user') return;
    updateMessages(active.id, (messages) => messages.filter((_, i) => i < index - 1));
    send(prompt.content);
  };

  const stop = () => abortRef.current?.abort();

  const deleteConversation = (id) => {
    if (streaming && id === active.id) stop();
    clearConversation(id);
    remove(id);
  };

  const selectConversation = (id) => {
    if (streaming) stop();
    setActiveId(id);
    setSidebarOpen(false);
  };

  const newChat = () => {
    if (streaming) stop();
    create();
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={active.id}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onNew={newChat}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat">
        <header className="chat-header">
          <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <FiMenu />
          </button>
          <h1>{active.title}</h1>
        </header>

        <MessageList messages={active.messages} onSuggestion={send} onRetry={retry} disabled={streaming} />
        <Composer onSend={send} onStop={stop} streaming={streaming} />
      </main>
    </div>
  );
}
