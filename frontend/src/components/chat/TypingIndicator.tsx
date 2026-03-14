'use client';

interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  const text = usernames.length === 1
    ? `${usernames[0]} is typing`
    : usernames.length === 2
    ? `${usernames[0]} and ${usernames[1]} are typing`
    : `${usernames[0]} and ${usernames.length - 1} others are typing`;

  return (
    <div className="px-5 py-1.5 text-xs animate-fade-in flex items-center gap-2" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
      <div className="flex gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span>{text}</span>
    </div>
  );
}
