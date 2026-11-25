import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nova.conversations.v1';

function newConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: [],
    updatedAt: Date.now(),
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      // A reply that was still streaming when the page closed is no longer pending
      return saved.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({ ...m, pending: false })),
      }));
    }
  } catch {
    /* corrupted storage: start fresh */
  }
  return [newConversation()];
}

/** Keeps every conversation in localStorage so chats survive a page reload. */
export function useConversations() {
  const [conversations, setConversations] = useState(load);
  const [activeId, setActiveId] = useState(() => conversations[0].id);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const create = useCallback(() => {
    const fresh = newConversation();
    setConversations((list) => [fresh, ...list.filter((c) => c.messages.length > 0)]);
    setActiveId(fresh.id);
  }, []);

  const remove = useCallback(
    (id) => {
      const rest = conversations.filter((c) => c.id !== id);
      const next = rest.length > 0 ? rest : [newConversation()];
      setConversations(next);
      if (id === activeId) setActiveId(next[0].id);
    },
    [conversations, activeId],
  );

  /** Applies `updater` to the messages of one conversation. */
  const updateMessages = useCallback((id, updater) => {
    setConversations((list) =>
      list
        .map((c) => {
          if (c.id !== id) return c;
          const messages = updater(c.messages);
          const firstUser = messages.find((m) => m.role === 'user');
          const title =
            c.title === 'New chat' && firstUser
              ? firstUser.content.slice(0, 48) + (firstUser.content.length > 48 ? '…' : '')
              : c.title;
          return { ...c, messages, title, updatedAt: Date.now() };
        })
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
  }, []);

  return { conversations, active, setActiveId, create, remove, updateMessages };
}
