import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className={cn('text-lg font-semibold text-gray-900')}>{title}</h3>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div role="dialog">{children}</div>
      </div>
    </div>
  );
}
