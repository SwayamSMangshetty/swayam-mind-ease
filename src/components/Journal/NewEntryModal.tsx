import React, { useState } from 'react';
import { X, Bold, Italic, List, Send, Smile, Copy, Bookmark, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface NewEntryModalProps {
  onClose: () => void;
  onSave?: () => void;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'angry'>('neutral');
  const [saving, setSaving] = useState(false);
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

      const { error: insertError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: title.trim() || 'Untitled Entry',
          content: content.trim(),
          mood: mood
        });

      if (insertError) throw insertError;

      onSave?.(); // Refresh the journal entries list
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const moodOptions = [
    { value: 'happy' as const, label: '😊 Happy', color: 'text-green-500' },
    { value: 'neutral' as const, label: '😐 Neutral', color: 'text-yellow-500' },
    { value: 'sad' as const, label: '😢 Sad', color: 'text-blue-500' },
    { value: 'angry' as const, label: '😠 Angry', color: 'text-red-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-colors duration-200">
      <div className="bg-app-light rounded-2xl w-full max-w-md max-h-[calc(100vh-6rem)] flex flex-col mx-4 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app-muted transition-colors duration-200">
          <button
            onClick={onClose}
            className="p-1 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
          >
            <X size={20} className="text-app-muted sm:w-6 sm:h-6" />
          </button>
          <h2 className="text-lg font-semibold text-app transition-colors duration-200">New Entry</h2>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Title Input */}
          <input
            type="text"
            placeholder="How are you feeling today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none mb-4 text-sm transition-colors duration-200 focus:ring-2 focus:ring-primary shadow-sm"
            disabled={saving}
          />

          {/* Mood Selection */}
          <div className="mb-4">
            <p className="text-sm text-app-muted mb-2">How are you feeling?</p>
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
                  disabled={saving}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex gap-3 mb-4 pb-4 border-b border-app-muted transition-colors duration-200">
            <button className="flex flex-col items-center gap-1 p-2 hover:bg-app-dark rounded-lg transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Bold size={16} className="text-app-muted" />
              <span className="text-xs text-app-muted">Bold</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 hover:bg-app-dark rounded-lg transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Italic size={16} className="text-app-muted" />
              <span className="text-xs text-app-muted">Italic</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 hover:bg-app-dark rounded-lg transition-all duration-200 active:scale-95 hover:shadow-sm">
              <List size={16} className="text-app-muted" />
              <span className="text-xs text-app-muted">Bullets</span>
            </button>
          </div>

          {/* Text Area */}
          <textarea
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-0 border-none outline-none resize-none bg-transparent text-app placeholder-app-muted leading-relaxed text-sm transition-colors duration-200 focus:ring-0"
            disabled={saving}
          />
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-app-muted transition-colors duration-200">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full font-medium mb-4 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            disabled={saving || !content.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          {/* Bottom Icons */}
          <div className="flex justify-center gap-4">
            <button className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Smile size={20} className="text-app-muted" />
            </button>
            <button className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Copy size={20} className="text-app-muted" />
            </button>
            <button className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Bookmark size={20} className="text-app-muted" />
            </button>
            <button className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Send size={20} className="text-app-muted" />
            </button>
            <button className="p-2 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95 hover:shadow-sm">
              <Bell size={20} className="text-app-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEntryModal;