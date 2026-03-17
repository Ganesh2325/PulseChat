'use client';

interface DeleteMessageModalProps {
  isOpen: boolean;
  canDeleteForEveryone: boolean;
  onDeleteMe: () => void;
  onDeleteEveryone: () => void;
  onCancel: () => void;
}

export function DeleteMessageModal({ 
  isOpen, 
  canDeleteForEveryone, 
  onDeleteMe, 
  onDeleteEveryone, 
  onCancel 
}: DeleteMessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div 
        className="bg-[var(--bg-surface-l3)] w-full max-w-[340px] rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden animate-pop-in border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-[20px] font-black text-white tracking-tight">Delete message?</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-2 font-medium">This action cannot be undone.</p>
        </div>

        <div className="flex flex-col p-2">
          {canDeleteForEveryone && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteEveryone(); }}
              className="w-full px-6 py-4 text-left text-[15px] font-black text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all rounded-2xl"
            >
              Delete For Everyone
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteMe(); }}
            className="w-full px-6 py-4 text-left text-[15px] font-black text-[var(--accent)] hover:bg-[var(--accent)]/10 active:bg-[var(--accent)]/20 transition-all rounded-2xl"
          >
            Delete For Me
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="w-full px-6 py-4 text-left text-[15px] font-black text-[var(--text-secondary)] hover:bg-white/5 active:bg-white/10 transition-all rounded-2xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
