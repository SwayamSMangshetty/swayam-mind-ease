import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Calendar, Filter, MoreVertical, Heart, Download, Trash2 } from 'lucide-react';
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
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMoodFilter, setShowMoodFilter] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [favoriteEntries, setFavoriteEntries] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorite entries from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteEntries');
    if (storedFavorites) {
      setFavoriteEntries(new Set(JSON.parse(storedFavorites)));
    }
  }, []);
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
      applyFilters(data || [], searchTerm, selectedMood, selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (entries: JournalEntry[], search: string, mood: string, date: string) => {
    let filtered = entries;

    // Apply search filter (title only, case-insensitive)
    if (search) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply mood filter
    if (mood) {
      filtered = filtered.filter(entry => entry.mood === mood);
    }

    // Apply date filter
    if (date) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.created_at);
        const selectedDateObj = new Date(date);
        return entryDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    setFilteredEntries(filtered);
  };
  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  // Apply filters whenever search term, mood, or date changes
  useEffect(() => {
    applyFilters(journalEntries, searchTerm, selectedMood, selectedDate);
  }, [journalEntries, searchTerm, selectedMood, selectedDate]);
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
    
    if (!term) {
      setFilteredEntries(journalEntries);
    } else {
      const filtered = journalEntries.filter(entry =>
        entry.title.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term)
      );
      setFilteredEntries(filtered);
    }
  };

  const handleMoodFilter = (mood: string) => {
    setSelectedMood(mood);
    setShowMoodFilter(false);
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMood('');
    setSelectedDate('');
  };

  const exportEntry = (entry: JournalEntry) => {
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

  const toggleFavorite = (entryId: string) => {
    const newFavorites = new Set(favoriteEntries);
    if (favoriteEntries.has(entryId)) {
      newFavorites.delete(entryId);
    } else {
      newFavorites.add(entryId);
    }
    setFavoriteEntries(newFavorites);
    localStorage.setItem('favoriteEntries', JSON.stringify([...newFavorites]));
    setActiveDropdown(null);
  };

  const handleDeleteClick = (entry: JournalEntry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (!entryToDelete || !user) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from favorites if it was favorited
      const newFavorites = new Set(favoriteEntries);
      newFavorites.delete(entryToDelete.id);
      setFavoriteEntries(newFavorites);
      localStorage.setItem('favoriteEntries', JSON.stringify([...newFavorites]));

      fetchJournalEntries();
      setShowDeleteDialog(false);
      setEntryToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setEntryToDelete(null);
  };

  const moodOptions = [
    { value: '', label: 'All Moods' },
    { value: 'happy', label: '😊 Happy' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'sad', label: '😢 Sad' },
    { value: 'angry', label: '😠 Angry' },
  ];

  const getFilterMessage = () => {
    if (filteredEntries.length === 0 && journalEntries.length > 0) {
      if (selectedMood && selectedDate) {
        return `No entries found for ${selectedMood} mood on ${new Date(selectedDate).toLocaleDateString()}`;
      } else if (selectedMood) {
        return `No entries found for selected mood: ${selectedMood}`;
      } else if (selectedDate) {
        return `No entries found for selected date: ${new Date(selectedDate).toLocaleDateString()}`;
      } else if (searchTerm) {
        return `No entries found matching "${searchTerm}"`;
      }
    }
    return null;
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
              {/* Mood Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowMoodFilter(!showMoodFilter)}
                  className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95">
                  <Filter size={16} className="text-app-muted" />
                </button>
                {showMoodFilter && (
                  <div className="absolute top-full right-0 mt-2 bg-app-light rounded-lg border border-app-muted shadow-lg z-50 min-w-40">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodFilter(mood.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-app-dark transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                          selectedMood === mood.value ? 'bg-primary/10 text-primary' : 'text-app'
                        }`}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-2 border border-app-muted bg-app-light rounded-lg hover:bg-app-dark transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">
                  <Calendar size={16} className="text-app-muted" />
                </button>
                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 bg-app-light rounded-lg border border-app-muted shadow-lg z-50 p-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-app-muted bg-app-dark text-app rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedMood || selectedDate) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-app-muted">Filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedMood && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Mood: {selectedMood}
                </span>
              )}
              {selectedDate && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Date: {new Date(selectedDate).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-app-muted hover:text-primary underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="p-4">
        <div className="w-full space-y-3">
          {loading && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-app-muted mt-2">Loading entries...</p>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger rounded-lg p-4 mx-auto max-w-md">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Filter Message */}
          {getFilterMessage() && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md">
              <p className="text-app-muted text-sm">{getFilterMessage()}</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary hover:text-primary/80 text-xs underline"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-app-light rounded-xl p-4 shadow-sm border border-app-muted hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div onClick={() => handleEntryClick(entry)}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-app mb-1 text-sm truncate transition-colors duration-200">{entry.title || 'Untitled'}</h3>
                      {favoriteEntries.has(entry.id) && (
                        <Heart size={12} className="text-danger fill-current ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        entry.mood === 'happy' ? 'bg-success' :
                        entry.mood === 'neutral' ? 'bg-warning' : 
                        entry.mood === 'sad' ? 'bg-info' :
                        entry.mood === 'angry' ? 'bg-danger' : 'bg-app-muted'
                      }`} />
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === entry.id ? null : entry.id);
                          }}
                          className="p-1 hover:bg-app-dark rounded-full transition-colors duration-200"
                        >
                          <MoreVertical size={14} className="text-app-muted" />
                        </button>
                        
                        {activeDropdown === entry.id && (
                          <div className="absolute top-full right-0 mt-1 bg-app-light rounded-lg border border-app-muted shadow-lg z-50 min-w-32">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(entry.id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-app-dark transition-colors duration-200 first:rounded-t-lg flex items-center gap-2"
                            >
                              <Heart size={14} className={favoriteEntries.has(entry.id) ? 'text-danger fill-current' : 'text-app-muted'} />
                              {favoriteEntries.has(entry.id) ? 'Unfavorite' : 'Favorite'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportEntry(entry);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-app-dark transition-colors duration-200 flex items-center gap-2"
                            >
                              <Download size={14} className="text-app-muted" />
                              Export
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(entry);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-danger/10 transition-colors duration-200 last:rounded-b-lg flex items-center gap-2 text-danger"
                            >
                              <Trash2 size={14} className="text-danger" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-app-muted mb-2 transition-colors duration-200">{formatDate(entry.created_at)}</p>
                  <p className="text-app-muted text-sm leading-relaxed line-clamp-2 transition-colors duration-200">{entry.content.substring(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State (when no entries) */}
          {journalEntries.length === 0 && !loading && !getFilterMessage() && (
            <div className="text-center py-12 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md">
              <p className="text-app-muted mb-4">No journal entries yet</p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200"
              >
                <Plus size={20} className="text-primary" />
                Write First Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-app-light rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-app mb-3">Delete Entry</h3>
            <p className="text-app-muted text-sm mb-6">
              Are you sure you want to delete "{entryToDelete.title || 'Untitled'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 px-4 bg-danger text-white rounded-lg hover:bg-danger/90 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdowns */}
      {(activeDropdown || showMoodFilter || showDatePicker) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setActiveDropdown(null);
            setShowMoodFilter(false);
            setShowDatePicker(false);
          }}
        />
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