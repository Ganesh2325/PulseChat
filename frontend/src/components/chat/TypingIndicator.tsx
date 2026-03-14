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
    <div className="px-5 py-2.5 text-[13px] animate-fade-in flex items-center gap-3" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
      <div className="flex gap-1.5 px-3 py-2 rounded-2xl bg-slate-100/50 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="font-semibold italic text-slate-500">{text}...</span>
    </div>
  );
}
