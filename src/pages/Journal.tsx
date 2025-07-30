import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import NewEntryModal from '../components/Journal/NewEntryModal';
import ViewEntryModal from '../components/Journal/ViewEntryModal';
import EditEntryModal from '../components/Journal/EditEntryModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry } from '../types';

const Journal = () => {
  const { user } = useAuth();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showViewEntry, setShowViewEntry] = useState(false);
  const [showEditEntry, setShowEditEntry] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournalEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleNewEntry = () => {
    fetchJournalEntries(); // Refresh entries after new entry is saved
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowViewEntry(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowViewEntry(false);
    setShowEditEntry(true);
  };

  const handleCloseModals = () => {
    setSelectedEntry(null);
    setShowViewEntry(false);
    setShowEditEntry(false);
  };

  const handleSaveEdit = () => {
    fetchJournalEntries();
    handleCloseModals();
  };

  const handleDeleteEntry = () => {
    fetchJournalEntries();
    handleCloseModals();
  };

  return (
    <div className="bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-app-light px-4 py-3 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h1 className="text-xl font-bold text-app transition-colors duration-200">Journal</h1>
            <button
              onClick={() => setShowNewEntry(true)}
              className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={16} />
              <input
                type="text"
                placeholder="Search entries..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-app-muted bg-app-light text-app placeholder-app-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            <button className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95">
              <Calendar size={16} className="text-app-muted" />
            </button>
            <button className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">
              <Filter size={16} className="text-app-muted" />
            </button>
            <button className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">
              <Calendar size={16} className="text-app-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="p-4">
        <div className="w-full space-y-3">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-app-muted mt-2">Loading entries...</p>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger rounded-lg p-4">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="bg-app-light rounded-xl p-4 shadow-sm border border-app-muted hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-app mb-1 text-sm truncate transition-colors duration-200">{entry.title || 'Untitled'}</h3>
                    <p className="text-xs text-app-muted mb-2 transition-colors duration-200">{formatDate(entry.created_at)}</p>
                    <p className="text-app-muted text-sm leading-relaxed line-clamp-2 transition-colors duration-200">{entry.content.substring(0, 100)}...</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ml-3 mt-1 flex-shrink-0 ${
                    entry.mood === 'happy' ? 'bg-success' :
                    entry.mood === 'neutral' ? 'bg-warning' : 'bg-info'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State (when no entries) */}
      {journalEntries.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-colors duration-200">
            <Plus size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-app mb-2 transition-colors duration-200">Start Your Journal</h3>
          <p className="text-app-muted text-center mb-6 text-sm transition-colors duration-200">
            Capture your thoughts, feelings, and daily reflections
          </p>
          <button
            onClick={() => setShowNewEntry(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md text-sm"
          >
            Write First Entry
          </button>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <NewEntryModal 
          onClose={() => setShowNewEntry(false)} 
          onSave={handleNewEntry}
        />
      )}

      {/* View Entry Modal */}
      {showViewEntry && selectedEntry && (
        <ViewEntryModal 
          entry={selectedEntry}
          onClose={handleCloseModals}
          onEdit={handleEditEntry}
        />
      )}

      {/* Edit Entry Modal */}
      {showEditEntry && selectedEntry && (
        <EditEntryModal 
          entry={selectedEntry}
          onClose={handleCloseModals}
          onSave={handleSaveEdit}
          onDelete={handleDeleteEntry}
        />
      )}
    </div>
  );
};

export default Journal;