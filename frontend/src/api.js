const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Sends a message and streams the reply.
 * The backend answers with newline-delimited JSON: one {content, done, error} object per line.
 */
export async function streamChat({ message, conversationId, onToken, signal }) {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
    signal,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) detail = body.message;
    } catch {
      /* response was not JSON */
    }
    throw new Error(detail);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleLine = (line) => {
    if (!line.trim()) return;
    const chunk = JSON.parse(line);
    if (chunk.error) throw new Error(chunk.error);
    if (chunk.content) onToken(chunk.content);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    lines.forEach(handleLine);
  }
  buffer += decoder.decode();
  handleLine(buffer);
}

export async function clearConversation(conversationId) {
  try {
    await fetch(`${API_BASE}/api/chat/${encodeURIComponent(conversationId)}`, { method: 'DELETE' });
  } catch {
    /* best effort: the server forgets idle conversations on restart anyway */
  }
}
