import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { JournalEntry } from '../../types';

interface EditEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, onClose, onSave, onDelete }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(entry.content);
  const [title, setTitle] = useState(entry.title);
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'angry'>(entry.mood || 'neutral');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    
    if (!content.trim()) {
      setError('Please write some content before saving');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          title: title.trim() || 'Untitled Entry',
          content: content.trim(),
          mood: mood,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      onDelete?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  const moodOptions = [
    { value: 'happy' as const, label: '😊 Happy', color: 'text-green-500' },
    { value: 'neutral' as const, label: '😐 Neutral', color: 'text-yellow-500' },
    { value: 'sad' as const, label: '😢 Sad', color: 'text-blue-500' },
    { value: 'angry' as const, label: '😠 Angry', color: 'text-red-500' },
  ];

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
              Edit Entry
            </h2>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={deleting || saving}
            className="p-2 hover:bg-danger/10 rounded-full transition-all duration-200 active:scale-95 text-app-muted hover:text-danger"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger"></div>
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-app mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none text-sm transition-colors duration-200 focus:ring-2 focus:ring-primary shadow-sm"
              placeholder="Entry title..."
              disabled={saving || deleting}
            />
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-app mb-2">Mood</label>
            <div className="flex gap-2 flex-wrap">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 active:scale-[0.98] ${
                    mood === option.value
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-app-dark text-app-muted hover:bg-app-dark/80'
                  }`}
                  disabled={saving || deleting}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-app mb-2">Entry Title</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 p-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none resize-none text-sm transition-colors duration-200 focus:ring-2 focus:ring-primary shadow-sm"
              placeholder="Express your thoughts…"
              disabled={saving || deleting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-app-muted">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="flex-1 py-3 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting || !content.trim()}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EditEntryModal;