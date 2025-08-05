import React from 'react';
import { X, Calendar, Edit2 } from 'lucide-react';
import { JournalEntry } from '../../types';

interface ViewEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onEdit?: (entry: JournalEntry) => void;
}

const ViewEntryModal: React.FC<ViewEntryModalProps> = ({ entry, onClose, onEdit }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'happy': return 'bg-success text-white';
      case 'sad': return 'bg-info text-white';
      case 'angry': return 'bg-danger text-white';
      case 'neutral': return 'bg-warning text-white';
      default: return 'bg-app-muted text-app';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex items-center justify-center min-h-full p-4 pb-20 sm:pb-4">
        <div className="bg-app-light rounded-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col transition-colors duration-200 shadow-xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-app-muted">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
            >
              <X size={20} className="text-app-muted" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-app transition-colors duration-200">
              {entry.title || 'Untitled Entry'}
            </h2>
          </div>
          
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 text-app-muted hover:text-primary"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {/* Entry Details */}
        <div className="p-4 sm:p-6 border-b border-app-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-app-muted">
              <Calendar size={16} />
              <span className="text-sm">
                {formatDate(entry.created_at)}
              </span>
            </div>
            
            {entry.mood && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="text-app leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {entry.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-app-muted">
          <div className="flex items-center justify-between text-xs text-app-muted">
            <span>
              Created: {new Date(entry.created_at).toLocaleDateString()}
            </span>
            {entry.updated_at !== entry.created_at && (
              <span>
                Updated: {new Date(entry.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ViewEntryModal;