import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Calendar, Filter, MoreVertical as MoreVert, Heart, Download, Trash2 } from 'lucide-react';
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
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchJournalEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
      setFilteredEntries(data || []);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch journal entries');
      setJournalEntries([]);
      setFilteredEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  const applyFilters = (entries: JournalEntry[], search: string, mood: string, date: string) => {
    let filtered = entries;
    
    // Filter by search term (title only)
    if (search) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by mood
    if (mood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === mood);
    }
    
    // Filter by date
    if (date) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.created_at).toDateString();
        const filterDate = new Date(date).toDateString();
        return entryDate === filterDate;
      });
    }
    
    setFilteredEntries(filtered);
  };

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(journalEntries, term, moodFilter, dateFilter);
  };

  const handleMoodFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mood = e.target.value;
    setMoodFilter(mood);
    applyFilters(journalEntries, searchTerm, mood, dateFilter);
  };

  const handleDateFilter = () => {
    setShowDatePicker(true);
  };

  const toggleFavorite = (entryId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(entryId)) {
      newFavorites.delete(entryId);
    } else {
      newFavorites.add(entryId);
    }
    setFavorites(newFavorites);
    setOpenMenuId(null);
  };

  const handleMenuToggle = (entryId: string) => {
    setOpenMenuId(openMenuId === entryId ? null : entryId);
  };

  const exportEntry = (entry: JournalEntry) => {
    setOpenMenuId(null);
    const csvContent = [
      ['Title', 'Content', 'Mood', 'Created Date', 'Updated Date'],
      [
        entry.title,
        entry.content.replace(/"/g, '""'),
        entry.mood || '',
        new Date(entry.created_at).toLocaleString(),
        new Date(entry.updated_at).toLocaleString()
      ]
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `journal-entry-${entry.id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async (entry: JournalEntry) => {
    setShowDeleteConfirm(entry.id);
  };

  const handleConfirmDelete = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchJournalEntries();
      setOpenMenuId(null);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div className="bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-app-light px-4 py-3 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center items-center mb-3 sm:mb-4 relative">
            <h1 className="text-xl font-bold text-app transition-colors duration-200">Journal</h1>
            <div className="absolute right-0 flex items-center gap-2">
              <button
                onClick={() => setShowNewEntry(true)}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                disabled={loading}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search journal…"
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 px-3 py-2 text-sm border border-app-muted bg-app-light text-app placeholder-app-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <div className="flex gap-2">
              <select
                value={moodFilter}
                onChange={handleMoodFilter}
                className="p-2 border border-app-muted bg-app-light text-app rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 text-sm"
              >
                <option value="all">All Moods</option>
                <option value="happy">Happy</option>
                <option value="neutral">Neutral</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
              </select>
              <button 
                onClick={handleDateFilter}
                className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              >
                <Calendar size={16} className="text-app-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No entries for selected mood */}
      {moodFilter !== 'all' && filteredEntries.length === 0 && !loading && (
        <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md">
          <p className="text-app-muted">No entries found for selected mood.</p>
        </div>
      )}

      {/* Journal Entries */}
      <div className="p-4">
        <div className="w-full space-y-3">
          {loading && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-app-muted mt-2">Loading entries...</p>
            </div>
          )}

          {moodFilter !== 'all' && filteredEntries.length === 0 && !loading && !error && journalEntries.length > 0 && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <p className="text-app-muted">No entries found for selected mood.</p>
            </div>
          )}

          {/* No entries for selected date */}
          {dateFilter && filteredEntries.length === 0 && !loading && !error && journalEntries.length > 0 && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <p className="text-app-muted">No entries for this date.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-app-light rounded-xl p-4 shadow-sm border border-app-muted hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer active:scale-[0.98] relative"
              >
                <div onClick={() => handleEntryClick(entry)} className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    {/* Moved mood indicator to left side */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        entry.mood === 'happy' ? 'bg-success' :
                        entry.mood === 'neutral' ? 'bg-warning' : 'bg-info'
                      }`} />
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-app text-sm truncate transition-colors duration-200">
                        {entry.title || 'Untitled'}
                      </h3>
                      {favorites.has(entry.id) && (
                        <Heart size={12} className="text-warning fill-current" />
                      )}
                    </div>
                    </div>
                    <p className="text-xs text-app-muted mb-2 transition-colors duration-200">{formatDate(entry.created_at)}</p>
                    <p className="text-app-muted text-sm leading-relaxed line-clamp-2 transition-colors duration-200">{entry.content.substring(0, 100)}...</p>
                  </div>
                </div>
                
                {/* Three-dots menu */}
                <div className="absolute top-2 right-2" style={{marginRight: '12px'}}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuToggle(entry.id);
                    }}
                    className="p-1 hover:bg-app-dark rounded-full transition-colors duration-200"
                  >
                    <MoreVert size={16} className="text-app-muted" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {openMenuId === entry.id && (
                    <div className="absolute right-0 top-8 bg-app-light border border-app-muted rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(entry.id);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-app-dark transition-colors duration-200 flex items-center gap-2 text-sm"
                      >
                        <Heart size={14} className={favorites.has(entry.id) ? 'text-warning fill-current' : 'text-app-muted'} />
                        Favorite
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportEntry(entry);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-app-dark transition-colors duration-200 flex items-center gap-2 text-sm"
                      >
                        <Download size={14} className="text-app-muted" />
                        Export
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(entry);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-danger/10 transition-colors duration-200 flex items-center gap-2 text-sm text-danger"
                      >
                        <Trash2 size={14} className="text-danger" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Click away handler for menus */}
          {openMenuId && (
            <div 
              className="fixed inset-0 z-5"
              onClick={() => setOpenMenuId(null)}
            />
          )}
        </div>
      </div>

      {/* Empty State (when no entries) */}
      {filteredEntries.length === 0 && !loading && !dateFilter && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="bg-app-light rounded-2xl p-8 border border-app-muted shadow-sm max-w-md mx-auto text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors duration-200">
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-app-light rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-app mb-4">Select Date</h3>
            <input
              type="date"
              onChange={(e) => {
                setDateFilter(e.target.value);
                applyFilters(journalEntries, searchTerm, moodFilter, e.target.value);
                setShowDatePicker(false);
              }}
              className="w-full p-3 bg-app-dark text-app rounded-lg border-none outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDateFilter('');
                  applyFilters(journalEntries, searchTerm, moodFilter, '');
                  setShowDatePicker(false);
                }}
                className="flex-1 py-2 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-colors"
              >
                Clear Filter
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-app-light rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-app mb-4">Confirm Delete</h3>
            <p className="text-app-muted mb-6">Are you sure you want to delete this entry? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(showDeleteConfirm)}
                className="flex-1 py-2 px-4 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;