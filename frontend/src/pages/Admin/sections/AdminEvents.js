/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADMIN EVENTS SECTION | ÖH Wirtschaft Admin Panel
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Edit2, Trash2, Clock, MapPin, Tag, 
  Eye, EyeOff, X, Save, Search, ChevronDown
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const colorOptions = [
  { value: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { value: 'gold', label: 'Gold', class: 'bg-amber-500' },
  { value: 'green', label: 'Grün', class: 'bg-emerald-500' },
  { value: 'red', label: 'Rot', class: 'bg-red-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'teal', label: 'Türkis', class: 'bg-teal-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
];

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    all_day: false,
    location: '',
    color: 'blue',
    tags: '',
    is_public: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingEvent;
      
      // Combine date and time
      let startDateTime = formData.start_date;
      if (!formData.all_day && formData.start_time) {
        startDateTime = `${formData.start_date}T${formData.start_time}:00`;
      } else {
        startDateTime = `${formData.start_date}T00:00:00`;
      }
      
      let endDateTime = null;
      if (formData.end_date) {
        if (!formData.all_day && formData.end_time) {
          endDateTime = `${formData.end_date}T${formData.end_time}:00`;
        } else {
          endDateTime = `${formData.end_date}T23:59:59`;
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        start_date: startDateTime,
        end_date: endDateTime,
        all_day: formData.all_day,
        location: formData.location || null,
        color: formData.color,
        tags: formData.tags || null,
        is_public: formData.is_public,
      };

      const res = await fetch(
        `${API_URL}/api/admin/events${isEdit ? `/${editingEvent.id}` : ''}`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Fehler beim Speichern');
      }

      setSuccess(isEdit ? 'Event aktualisiert!' : 'Event erstellt!');
      setTimeout(() => setSuccess(''), 3000);
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Event "${event.title}" wirklich löschen?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/events/${event.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Löschen fehlgeschlagen');
      
      setSuccess('Event gelöscht!');
      setTimeout(() => setSuccess(''), 3000);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (event) => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;
    
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_date: startDate.toISOString().split('T')[0],
      start_time: event.all_day ? '' : startDate.toTimeString().slice(0, 5),
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      end_time: endDate && !event.all_day ? endDate.toTimeString().slice(0, 5) : '',
      all_day: event.all_day,
      location: event.location || '',
      color: event.color,
      tags: event.tags || '',
      is_public: event.is_public,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      all_day: false,
      location: '',
      color: 'blue',
      tags: '',
      is_public: true,
    });
    setError('');
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.tags && e.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDateTime = (dateStr, allDay) => {
    const date = new Date(dateStr);
    if (allDay) {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return date.toLocaleString('de-DE', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kalender-Events</h2>
          <p className="text-sm text-slate-500">{events.length} Events insgesamt</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          data-testid="create-event-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} /> Neues Event
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Events durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>Keine Events gefunden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              data-testid={`event-item-${event.id}`}
              className={`p-4 rounded-xl border ${colorMap[event.color]?.border || 'border-slate-200'} bg-white hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${colorOptions.find(c => c.value === event.color)?.class || 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        {!event.is_public && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex items-center gap-1">
                            <EyeOff size={10} /> Privat
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDateTime(event.start_date, event.all_day)}
                          {event.all_day && <span className="text-xs">(Ganztägig)</span>}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.tags.split(',').map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(event)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingEvent ? 'Event bearbeiten' : 'Neues Event'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titel *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="z.B. Prüfungsanmeldung Deadline"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    placeholder="Weitere Details zum Event..."
                  />
                </div>

                {/* All Day Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="all_day"
                    checked={formData.all_day}
                    onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="all_day" className="text-sm text-slate-700">Ganztägig</label>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start-Datum *</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  {!formData.all_day && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start-Zeit</label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End-Datum</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  {!formData.all_day && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End-Zeit</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="z.B. JKU Campus, Keplergebäude"
                    />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Farbe</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                          formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="z.B. Prüfung, Deadline, WiWi (kommagetrennt)"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Mehrere Tags mit Komma trennen</p>
                </div>

                {/* Public Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-slate-700 flex items-center gap-2">
                    <Eye size={14} /> Öffentlich sichtbar
                  </label>
                </div>

                {/* Error in form */}
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    data-testid="save-event-btn"
                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingEvent ? 'Speichern' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
