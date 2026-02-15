/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KALENDER PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealOnScroll } from '../components/Animations';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Tag,
  Grid3X3,
  List,
  CalendarDays,
  X
} from 'lucide-react';
import Marquee from '../components/Marquee';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Color mappings
const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
};

// German month names
const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export default function Kalender() {
  const [events, setEvents] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month, week, list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events
  useEffect(() => {
    fetchEvents();
    fetchTags();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchEvents = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await fetch(`${API_URL}/api/events?month=${month}&year=${year}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events/tags`);
      const data = await res.json();
      setAllTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = !selectedTag || (event.tags && event.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [events, searchQuery, selectedTag]);

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = (firstDay.getDay() + 6) % 7; // Monday = 0
    return { daysInMonth, startingDay };
  };

  const getEventsForDay = (day) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-28 bg-slate-50/50" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = today.getDate() === day && 
                      today.getMonth() === currentDate.getMonth() && 
                      today.getFullYear() === currentDate.getFullYear();

      days.push(
        <div 
          key={day} 
          className={`h-24 md:h-28 p-1 md:p-2 border-t border-slate-100 transition-colors hover:bg-blue-50/30 ${
            isToday ? 'bg-blue-50/50' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
            isToday ? 'bg-blue-500 text-white' : 'text-slate-600'
          }`}>
            {day}
          </div>
          <div className="space-y-0.5 overflow-hidden">
            {dayEvents.slice(0, 2).map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate ${
                  colorMap[event.color]?.bg || 'bg-blue-100'
                } ${colorMap[event.color]?.text || 'text-blue-700'} hover:opacity-80 transition-opacity`}
              >
                {event.title}
              </button>
            ))}
            {dayEvents.length > 2 && (
              <p className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 2} mehr</p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Render list view
  const renderListView = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    if (sortedEvents.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>Keine Events in diesem Monat</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sortedEvents.map(event => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`w-full text-left p-4 rounded-xl border ${
              colorMap[event.color]?.border || 'border-slate-200'
            } bg-white hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${colorMap[event.color]?.dot || 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1">{event.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {event.all_day ? 'Ganztägig' : formatTime(event.start_date)}
                  </span>
                  <span>{formatDate(event.start_date)}</span>
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
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <section className="pt-28 pb-8 md:pt-40 md:pb-12 px-5 relative overflow-hidden">
        <div className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-50" />
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Wichtige Termine</p>
            </div>
            <h1 data-testid="kalender-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Kalender
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Alle wichtigen Termine und Events der ÖH Wirtschaft auf einen Blick.
            </p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={['Plane voraus', 'Kein Event verpassen', 'Dein Semester im Griff', 'Dabei sein ist alles', 'Mach das Beste draus']}
        variant="gold"
        speed={36}
        reverse
      />

      {/* Controls */}
      <section className="px-5 pt-8 pb-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigateMonth(-1)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button 
                onClick={() => navigateMonth(1)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Heute
              </button>
            </div>

            {/* View Toggle & Filters */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-44 md:w-56 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  selectedTag ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} />
              </button>

              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tag Filters */}
          <AnimatePresence>
            {showFilters && allTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      !selectedTag ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Alle
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Tag size={12} className="inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Calendar */}
      <section data-testid="kalender-content" className="px-5 pb-20">
        <div className="max-w-[1120px] mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : view === 'month' ? (
            <RevealOnScroll>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-slate-50">
                  {dayNames.map(day => (
                    <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {renderCalendarGrid()}
                </div>
              </div>
            </RevealOnScroll>
          ) : (
            <RevealOnScroll>
              {renderListView()}
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 ${colorMap[selectedEvent.color]?.bg || 'bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays size={16} />
                      {formatDate(selectedEvent.start_date)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {!selectedEvent.all_day && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={18} className="text-slate-400" />
                    <span>{formatTime(selectedEvent.start_date)}{selectedEvent.end_date && ` - ${formatTime(selectedEvent.end_date)}`}</span>
                  </div>
                )}
                {selectedEvent.all_day && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={18} className="text-slate-400" />
                    <span>Ganztägig</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-slate-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.description && (
                  <p className="text-slate-600 pt-2 border-t border-slate-100">
                    {selectedEvent.description}
                  </p>
                )}
                {selectedEvent.tags && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedEvent.tags.split(',').map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
