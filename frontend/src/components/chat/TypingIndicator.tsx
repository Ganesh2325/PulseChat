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
    <div className="px-6 py-2 text-xs animate-fade-in flex items-center gap-2.5 bg-transparent select-none">
      <div className="flex gap-1 px-2.5 py-1.5 rounded-full bg-white/60 border border-slate-100 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="font-semibold italic text-slate-400">{text}...</span>
    </div>
  );
}
