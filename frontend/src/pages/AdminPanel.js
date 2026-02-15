/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADMIN PANEL | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Newspaper, Users, Activity, Settings, LogOut,
  Plus, Edit2, Trash2, Eye, EyeOff, Pin, PinOff, Save, X,
  AlertTriangle, AlertCircle, Bell, Info, ChevronDown,
  BarChart3, TrendingUp, Clock, User, Shield, Crown,
  Check, RefreshCw, Calendar, GraduationCap, BookOpen, Mail, Key
} from 'lucide-react';
import AdminEvents from './Admin/sections/AdminEvents';
import AdminSGU from './Admin/sections/AdminSGU';
import AdminLVA from './Admin/sections/AdminLVA';
import AdminEmail from './Admin/sections/AdminEmail';
import AdminCodes from './Admin/sections/AdminCodes';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const priorityOptions = [
  { value: 'low', label: 'Info', icon: Info, color: 'slate' },
  { value: 'medium', label: 'Normal', icon: Bell, color: 'blue' },
  { value: 'high', label: 'Wichtig', icon: AlertCircle, color: 'orange' },
  { value: 'urgent', label: 'Dringend', icon: AlertTriangle, color: 'red' },
];

const colorOptions = [
  { value: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { value: 'gold', label: 'Gold', class: 'bg-gold-500' },
  { value: 'green', label: 'Grün', class: 'bg-green-500' },
  { value: 'red', label: 'Rot', class: 'bg-red-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'slate', label: 'Grau', class: 'bg-slate-500' },
];

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
];

// ─── API HELPER ────────────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/login';
    throw new Error('Session abgelaufen');
  }
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Anfrage fehlgeschlagen');
  return data;
}

// ─── SIDEBAR COMPONENT ─────────────────────────────────────────────────────
function Sidebar({ active, setActive, admin, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'news', label: 'News verwalten', icon: Newspaper },
    { id: 'events', label: 'Kalender', icon: Calendar },
    { id: 'sgu', label: 'SGU', icon: GraduationCap },
    { id: 'lva', label: 'LVA', icon: BookOpen },
    { id: 'codes', label: 'Codes', icon: Key, masterOnly: true },
    { id: 'email', label: 'E-Mail', icon: Mail, masterOnly: true },
    { id: 'admins', label: 'Admins', icon: Users, masterOnly: true },
    { id: 'activity', label: 'Aktivität', icon: Activity },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            ÖH
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Admin Panel</p>
            <p className="text-slate-500 text-xs">ÖH Wirtschaft</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {navItems.map(item => {
          if (item.masterOnly && admin?.role !== 'master') return null;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              data-testid={`nav-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                active === item.id
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              {admin?.is_master ? <Crown className="text-gold-500" size={18} /> : <User className="text-blue-400" size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{admin?.display_name}</p>
              <p className="text-slate-500 text-xs truncate">{admin?.role === 'master' ? 'Master Admin' : admin?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          data-testid="logout-btn"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Abmelden
        </button>
      </div>
    </aside>
  );
}

// ─── DASHBOARD SECTION ─────────────────────────────────────────────────────
function DashboardSection({ stats, loading, onRefresh }) {
  const statCards = [
    { label: 'Gesamt News', value: stats?.total_news || 0, icon: Newspaper, color: 'blue' },
    { label: 'Veröffentlicht', value: stats?.published_news || 0, icon: Eye, color: 'green' },
    { label: 'Entwürfe', value: stats?.draft_news || 0, icon: EyeOff, color: 'orange' },
    { label: 'Views Gesamt', value: stats?.total_views || 0, icon: TrendingUp, color: 'purple' },
    { label: 'Admins', value: stats?.total_admins || 0, icon: Users, color: 'slate' },
    { label: 'Aktive Admins', value: stats?.active_admins || 0, icon: Shield, color: 'gold' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    gold: 'bg-gold-50 text-gold-600 border-gold-100',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-600 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Aktualisieren
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`p-5 rounded-2xl border ${colorMap[card.color]}`}>
            <card.icon size={24} className="mb-3" />
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-sm opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 size={18} /> News nach Priorität
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {priorityOptions.map(p => (
            <div key={p.value} className="text-center p-3 bg-slate-50 rounded-xl">
              <p.icon size={20} className={`mx-auto mb-2 text-${p.color}-500`} />
              <p className="text-2xl font-bold text-slate-900">{stats?.news_by_priority?.[p.value] || 0}</p>
              <p className="text-xs text-slate-500">{p.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={18} /> Letzte Aktivitäten
        </h3>
        {stats?.recent_activity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_activity.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">{log.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{log.admin_name} • {new Date(log.created_at).toLocaleString('de-AT')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4">Keine Aktivitäten vorhanden</p>
        )}
      </div>
    </div>
  );
}

// ─── NEWS EDITOR MODAL ─────────────────────────────────────────────────────
function NewsEditorModal({ news, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    title: news?.title || '',
    content: news?.content || '',
    excerpt: news?.excerpt || '',
    priority: news?.priority || 'medium',
    color: news?.color || 'blue',
    is_published: news?.is_published || false,
    is_pinned: news?.is_pinned || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {news ? 'News bearbeiten' : 'Neue News erstellen'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Titel *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Überschrift der News"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Inhalt *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Der vollständige Inhalt der News..."
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Kurzfassung (optional)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Eine kurze Zusammenfassung für die Vorschau..."
            />
          </div>

          {/* Priority & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Farbe</label>
              <div className="flex gap-2">
                {colorOptions.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-8 h-8 rounded-full ${c.class} ${
                      form.color === c.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Veröffentlichen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-sm text-slate-700">Anpinnen</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {news ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── NEWS SECTION ──────────────────────────────────────────────────────────
function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/news/all');
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/news/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiRequest('/api/news', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowEditor(false);
      setEditing(null);
      fetchNews();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('News wirklich löschen?')) return;
    try {
      await apiRequest(`/api/news/${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (err) {
      alert(err.message);
    }
  };

  const togglePublish = async (item) => {
    try {
      await apiRequest(`/api/news/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_published: !item.is_published })
      });
      fetchNews();
    } catch (err) {
      alert(err.message);
    }
  };

  const togglePin = async (item) => {
    try {
      await apiRequest(`/api/news/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_pinned: !item.is_pinned })
      });
      fetchNews();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">News verwalten</h2>
        <button
          onClick={() => { setEditing(null); setShowEditor(true); }}
          data-testid="create-news-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Neue News
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <Newspaper size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Noch keine News vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map(item => (
            <motion.div
              key={item.id}
              layout
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
            >
              {/* Color Indicator */}
              <div className={`w-1 h-12 rounded-full bg-${item.color}-500`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                  {item.is_pinned && <Pin size={14} className="text-gold-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full ${
                    item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                  <span>{item.priority}</span>
                  <span>•</span>
                  <span>{item.author_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {item.views}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePin(item)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.is_pinned ? 'bg-gold-100 text-gold-600' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                  title={item.is_pinned ? 'Nicht mehr anpinnen' : 'Anpinnen'}
                >
                  {item.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button
                  onClick={() => togglePublish(item)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.is_published ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                  title={item.is_published ? 'Verbergen' : 'Veröffentlichen'}
                >
                  {item.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => { setEditing(item); setShowEditor(true); }}
                  className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                  title="Bearbeiten"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEditor && (
          <NewsEditorModal
            news={editing}
            onSave={handleSave}
            onClose={() => { setShowEditor(false); setEditing(null); }}
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ADMIN EDITOR MODAL ────────────────────────────────────────────────────
function AdminEditorModal({ admin, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    username: admin?.username || '',
    email: admin?.email || '',
    password: '',
    display_name: admin?.display_name || '',
    role: admin?.role || 'admin',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password;
    onSave(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md"
      >
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {admin ? 'Admin bearbeiten' : 'Neuen Admin erstellen'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Benutzername *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={!!admin}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Anzeigename *</label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">E-Mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Passwort {admin ? '(leer = unverändert)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!admin}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rolle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={admin?.is_master}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            >
              {roleOptions.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">
              Abbrechen
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-xl flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Speichern
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── ADMINS SECTION ────────────────────────────────────────────────────────
function AdminsSection() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/admins');
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/admins/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiRequest('/api/admins', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowEditor(false);
      setEditing(null);
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Admin wirklich löschen?')) return;
    try {
      await apiRequest(`/api/admins/${id}`, { method: 'DELETE' });
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (admin) => {
    try {
      await apiRequest(`/api/admins/${admin.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !admin.is_active })
      });
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Admins verwalten</h2>
        <button
          onClick={() => { setEditing(null); setShowEditor(true); }}
          data-testid="create-admin-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <Plus size={16} /> Neuer Admin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                admin.is_master ? 'bg-gold-100' : 'bg-blue-100'
              }`}>
                {admin.is_master ? <Crown className="text-gold-600" size={20} /> : <User className="text-blue-600" size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{admin.display_name}</h4>
                  {admin.is_master && (
                    <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Master</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>@{admin.username}</span>
                  <span>•</span>
                  <span>{admin.email}</span>
                  <span>•</span>
                  <span className={admin.is_active ? 'text-green-600' : 'text-red-500'}>
                    {admin.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>

              {!admin.is_master && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(admin)}
                    className={`p-2 rounded-lg transition-colors ${
                      admin.is_active ? 'hover:bg-red-100 text-slate-400 hover:text-red-600' : 'hover:bg-green-100 text-slate-400 hover:text-green-600'
                    }`}
                    title={admin.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    {admin.is_active ? <EyeOff size={16} /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => { setEditing(admin); setShowEditor(true); }}
                    className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg"
                    title="Bearbeiten"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEditor && (
          <AdminEditorModal
            admin={editing}
            onSave={handleSave}
            onClose={() => { setShowEditor(false); setEditing(null); }}
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ACTIVITY SECTION ──────────────────────────────────────────────────────
function LicenseSection() {
  const [licenses, setLicenses] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [amount, setAmount] = useState(1);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const charToValue = (c) => {
    if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
    return parseInt(c) + 26; // 0=26, 1=27, ..., 9=35
  };

  const valueToChar = (v) => {
    if (v < 26) return String.fromCharCode(65 + v); // 0-25 = A-Z
    return String(v - 26); // 26-35 = 0-9
  };

  const generateSingleLicense = () => {
    // Generate 4 random characters
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * 36)];
    }
    // Calculate weighted sum: pos1*1 + pos2*2 + pos3*3 + pos4*4
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += charToValue(code[i]) * (i + 1);
    }
    // Find pos5 so that (sum + pos5*5) mod 36 = 0
    let pos5 = ((-sum * 29) % 36 + 36) % 36;
    code += valueToChar(pos5);
    return code;
  };

  const generateLicenses = () => {
    setGenerating(true);
    setTimeout(() => {
      const newLicenses = [];
      for (let i = 0; i < amount; i++) {
        newLicenses.push({
          id: Date.now() + i,
          code: generateSingleLicense(),
          created: new Date().toLocaleString('de-AT'),
          status: 'active'
        });
      }
      setLicenses(prev => [...newLicenses, ...prev]);
      setGenerating(false);
    }, 300);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  const copyAllToClipboard = () => {
    const allCodes = licenses.map(l => l.code).join('\n');
    navigator.clipboard.writeText(allCodes);
  };

  const exportAsCSV = () => {
    const header = 'Code,Erstellt\n';
    const rows = licenses.map(l => `${l.code},${l.created}`).join('\n');
    const csv = header + rows;
    downloadFile(csv, 'lizenzen.csv', 'text/csv');
  };

  const exportAsTXT = () => {
    const txt = licenses.map(l => l.code).join('\n');
    downloadFile(txt, 'lizenzen.txt', 'text/plain');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeLicense = (id) => {
    setLicenses(prev => prev.filter(l => l.id !== id));
  };

  const clearAll = () => {
    setLicenses([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">ReviewLicense</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <p className="text-sm text-slate-500 mb-4">
          Generiere einzigartige 5-stellige Lizenzcodes für die Verifizierung.
        </p>
        
        {/* Generator Controls */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Anzahl:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={generateLicenses}
            disabled={generating}
            data-testid="generate-license-btn"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Generieren
          </button>
          {licenses.length > 0 && (
            <>
              <button
                onClick={copyAllToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Check size={16} /> Alle kopieren
              </button>
              <button
                onClick={exportAsCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                CSV
              </button>
              <button
                onClick={exportAsTXT}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                TXT
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> Löschen
              </button>
            </>
          )}
        </div>
        
        {licenses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Shield size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Noch keine Lizenzen generiert</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">
                Generierte Lizenzen: <span className="text-blue-500">{licenses.length}</span>
              </p>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {licenses.map(license => (
                <div key={license.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <code className="text-lg font-mono font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200">
                      {license.code}
                    </code>
                    <span className="text-xs text-slate-400">{license.created}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(license.code)}
                      className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Kopieren"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => removeLicense(license.id)}
                      className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ACTIVITY SECTION ──────────────────────────────────────────────────────
function ActivitySection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiRequest('/api/activity?limit=100');
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    if (action.includes('CREATE')) return <Plus size={14} />;
    if (action.includes('UPDATE')) return <Edit2 size={14} />;
    if (action.includes('DELETE')) return <Trash2 size={14} />;
    if (action.includes('LOGIN')) return <User size={14} />;
    return <Activity size={14} />;
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-600';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-600';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-600';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Aktivitätsprotokoll</h2>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <Activity size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Keine Aktivitäten vorhanden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{log.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {log.admin_name} • {new Date(log.created_at).toLocaleString('de-AT')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS SECTION ──────────────────────────────────────────────────────
function SettingsSection({ admin, onLogout }) {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.new_password !== form.confirm_password) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein' });
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });
      setMessage({ type: 'success', text: 'Passwort erfolgreich geändert' });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Einstellungen</h2>

      <div className="max-w-lg space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Profil</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Benutzername</span>
              <span className="text-slate-900 text-sm font-medium">{admin?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">E-Mail</span>
              <span className="text-slate-900 text-sm font-medium">{admin?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 text-sm">Rolle</span>
              <span className="text-slate-900 text-sm font-medium">{admin?.role === 'master' ? 'Master Admin' : admin?.role}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Passwort ändern</h3>
          
          {admin?.is_master ? (
            /* Master-Admin Sperre */
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V9a3 3 0 00-6 0v2" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-800 font-medium text-sm">Passwortänderung nicht möglich</p>
                  <p className="text-amber-700 text-sm mt-1">Der Master admin ist nicht befugt sein Passwort zu ändern. Verwaltung liegt bei Astra Capital e.U.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Normales Passwort-Formular für andere Admins */
            <>
              {message.text && (
                <div className={`p-3 rounded-xl mb-4 text-sm ${
                  message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Aktuelles Passwort</label>
                  <input
                    type="password"
                    value={form.current_password}
                    onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Neues Passwort</label>
                  <input
                    type="password"
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Passwort bestätigen</label>
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Passwort ändern
                </button>
              </form>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
        >
          <LogOut size={18} /> Abmelden
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PANEL ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (!token || !adminData) {
      navigate('/login');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiRequest('/api/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex" data-testid="admin-panel">
      <Sidebar active={activeSection} setActive={setActiveSection} admin={admin} onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'dashboard' && (
          <DashboardSection stats={stats} loading={statsLoading} onRefresh={fetchStats} />
        )}
        {activeSection === 'news' && <NewsSection />}
        {activeSection === 'events' && <AdminEvents />}
        {activeSection === 'sgu' && <AdminSGU />}
        {activeSection === 'lva' && <AdminLVA />}
        {activeSection === 'codes' && <AdminCodes />}
        {activeSection === 'email' && <AdminEmail />}
        
        {activeSection === 'admins' && <AdminsSection />}
        {activeSection === 'activity' && <ActivitySection />}
        {activeSection === 'settings' && <SettingsSection admin={admin} onLogout={handleLogout} />}
      </main>
    </div>
  );
}
