import { FiMessageSquare, FiMoon, FiPlus, FiSun, FiTrash2, FiX } from 'react-icons/fi';

export default function Sidebar({
  open,
  conversations,
  activeId,
  theme,
  onToggleTheme,
  onNew,
  onSelect,
  onDelete,
  onClose,
}) {
  return (
    <>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <img src="/favicon.svg" alt="" className="brand-logo" />
          <span>Nova</span>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="Close sidebar">
            <FiX />
          </button>
        </div>

        <button className="new-chat" onClick={onNew}>
          <FiPlus /> New chat
        </button>

        <nav className="history" aria-label="Conversations">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`history-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(c.id)}
            >
              <FiMessageSquare className="history-icon" />
              <span className="history-title">{c.title}</span>
              <button
                className="icon-btn delete-btn"
                aria-label={`Delete ${c.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </nav>

        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </aside>
    </>
  );
}
