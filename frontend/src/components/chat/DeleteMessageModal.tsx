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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div 
        className="bg-white w-full max-w-[320px] rounded-[24px] shadow-2xl overflow-hidden animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-2">Delete message?</h2>
        </div>

        <div className="flex flex-col">
          {canDeleteForEveryone && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteEveryone(); }}
              className="w-full px-6 py-4 text-left text-[15px] font-medium text-red-500 hover:bg-slate-50 active:bg-slate-100 transition-colors border-t border-slate-100"
            >
              Delete for everyone
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteMe(); }}
            className="w-full px-6 py-4 text-left text-[15px] font-medium text-indigo-600 hover:bg-slate-50 active:bg-slate-100 transition-colors border-t border-slate-100"
          >
            Delete for me
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="w-full px-6 py-4 text-left text-[15px] font-medium text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors border-t border-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
