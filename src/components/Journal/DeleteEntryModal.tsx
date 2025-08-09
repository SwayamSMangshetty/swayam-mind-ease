import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { JournalEntry } from '../../types';

interface DeleteEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

const DeleteEntryModal: React.FC<DeleteEntryModalProps> = ({ 
  entry, 
  onClose, 
  onConfirm, 
  deleting 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-light rounded-2xl w-full max-w-sm shadow-xl transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-muted">
          <h3 className="text-lg font-semibold text-app">Delete Entry</h3>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 hover:bg-app-dark rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-app-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-app-muted text-sm mb-6">
            Delete this entry permanently?
          </p>
          <p className="text-app text-sm font-medium mb-6">
            "{entry.title || 'Untitled'}"
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-3 px-4 bg-danger text-white rounded-lg hover:bg-danger/90 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEntryModal;