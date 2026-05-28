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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div 
        className="bg-white/95 backdrop-blur-xl w-full max-w-[340px] rounded-[30px] shadow-[0_24px_50px_rgba(139,92,246,0.15)] overflow-hidden animate-pop-in border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-3">
          <h2 className="text-[19px] font-extrabold text-slate-800 tracking-tight">Delete message?</h2>
          <p className="text-[13.5px] text-slate-500 mt-1.5 font-semibold leading-relaxed">This action cannot be undone.</p>
        </div>

        <div className="flex flex-col p-2">
          {canDeleteForEveryone && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteEveryone(); }}
              className="w-full px-6 py-3.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 active:bg-red-100 transition-all rounded-2xl cursor-pointer"
            >
              Delete For Everyone
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteMe(); }}
            className="w-full px-6 py-3.5 text-left text-sm font-bold text-[#8B5CF6] hover:bg-[#8B5CF6]/5 active:bg-[#8B5CF6]/10 transition-all rounded-2xl cursor-pointer"
          >
            Delete For Me
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="w-full px-6 py-3.5 text-left text-sm font-bold text-slate-400 hover:bg-slate-50 active:bg-slate-100 transition-all rounded-2xl cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
