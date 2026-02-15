/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LVA (Lehrveranstaltungen) PAGE | ÖH Wirtschaft Website
 *  Anonyme Bewertung von Lehrveranstaltungen
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealOnScroll } from '../components/Animations';
import { 
  Search, BookOpen, Star, X, Mail, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Loader2, Info, Send, Shield, TrendingUp, Key
} from 'lucide-react';
import Marquee from '../components/Marquee';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const pv = { 
  initial: { opacity: 0 }, 
  animate: { opacity: 1, transition: { duration: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } } 
};

// Color mapping for ratings
const colorMap = {
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  lime: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

// ─── RATING MODAL COMPONENT ────────────────────────────────────────────────
function RatingModal({ lva, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [effortRating, setEffortRating] = useState(null);
  const [difficultyRating, setDifficultyRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDirectCode, setIsDirectCode] = useState(false); // For admin codes

  const resetError = () => { setError(''); setCodeError(false); };

  // Code input handler - nur Buchstaben und Zahlen, automatisch Großbuchstaben
  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setCode(value);
    setCodeError(false);
  };

  // Direct code entry (for admin codes)
  const handleDirectCodeEntry = () => {
    setIsDirectCode(true);
    setStep(2);
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    resetError();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/lva/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lva_id: lva.id })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Fehler beim Senden des Codes');
        return;
      }

      setSuccess('Code wurde gesendet!');
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    resetError();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/lva/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: isDirectCode ? null : email, 
          code, 
          lva_id: lva.id 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setCodeError(true);
        setError(data.detail || 'Ungültiger Code');
        return;
      }

      setStep(3);
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    resetError();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/lva/submit-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: isDirectCode ? null : email,
          code,
          lva_id: lva.id,
          effort_rating: effortRating,
          difficulty_rating: difficultyRating
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Fehler beim Absenden');
        return;
      }

      setSuccess('Bewertung erfolgreich abgegeben!');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const RatingButton = ({ value, selected, onClick, label }) => (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all font-bold text-base ${
        selected 
          ? 'border-blue-500 bg-blue-50 text-blue-600 scale-105' 
          : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {value}
      {label && <span className="block text-[10px] font-medium mt-0.5 opacity-70">{label}</span>}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">LVA bewerten</p>
          <h3 className="text-white font-bold text-lg pr-8 leading-tight">{lva.name}</h3>
          
          {/* Progress */}
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="text-green-500" size={18} />
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="text-blue-500" size={18} />
                  <h4 className="font-semibold text-slate-900 text-sm">E-Mail Verifizierung</h4>
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  Nur mit <strong>@students.jku.at</strong> E-Mail möglich.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="k12345678@students.jku.at"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                  required
                  data-testid="email-input"
                />
              </div>
              
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 mb-5">
                <div className="flex items-start gap-2">
                  <Shield className="text-gold-600 shrink-0 mt-0.5" size={16} />
                  <p className="text-gold-800 text-xs">
                    <strong>100% anonym:</strong> E-Mail wird nicht gespeichert.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="request-code-btn"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Code anfordern <ArrowRight size={16} /></>}
              </button>

              {/* Direct code entry button */}
              <button
                type="button"
                onClick={handleDirectCodeEntry}
                data-testid="direct-code-btn"
                className="w-full mt-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-xs border border-slate-200"
              >
                <Key size={14} /> Code eingeben
              </button>
            </form>
          )}

          {/* Step 2: Code verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-blue-500" size={18} />
                  <h4 className="font-semibold text-slate-900 text-sm">Code eingeben</h4>
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  5-stelliger Code aus deiner E-Mail. <strong>Überprüfe auch den SPAM Ordner!</strong>
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC12"
                  maxLength={5}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none text-center text-2xl font-mono tracking-[0.4em] text-slate-900 uppercase transition-all duration-300 ${
                    codeError 
                      ? 'border-red-400 bg-red-50 animate-shake focus:ring-2 focus:ring-red-400' 
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                  data-testid="code-input"
                />
                <p className="text-slate-400 text-[10px] mt-2 text-center">30 Minuten gültig</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 text-sm"
                >
                  <ArrowLeft size={16} /> Zurück
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 5}
                  data-testid="verify-code-btn"
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl flex items-center justify-center gap-1 text-sm"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Weiter <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Aufwand */}
          {step === 3 && (
            <div>
              <div className="text-center mb-5">
                <h4 className="font-bold text-lg text-slate-900 mb-1">AUFWAND</h4>
                <p className="text-slate-500 text-xs">1 = wenig, 5 = sehr viel</p>
              </div>
              
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <RatingButton
                    key={value}
                    value={value}
                    selected={effortRating === value}
                    onClick={setEffortRating}
                    label={value === 1 ? 'Wenig' : value === 5 ? 'Viel' : null}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 text-sm"
                >
                  <ArrowLeft size={16} /> Zurück
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!effortRating}
                  data-testid="next-difficulty-btn"
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl flex items-center justify-center gap-1 text-sm"
                >
                  Weiter <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schwierigkeit */}
          {step === 4 && (
            <div>
              <div className="text-center mb-5">
                <h4 className="font-bold text-lg text-slate-900 mb-1">SCHWIERIGKEIT</h4>
                <p className="text-slate-500 text-xs">1 = leicht, 5 = sehr schwer</p>
              </div>
              
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <RatingButton
                    key={value}
                    value={value}
                    selected={difficultyRating === value}
                    onClick={setDifficultyRating}
                    label={value === 1 ? 'Leicht' : value === 5 ? 'Schwer' : null}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 text-sm"
                >
                  <ArrowLeft size={16} /> Zurück
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={!difficultyRating}
                  data-testid="next-overview-btn"
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl flex items-center justify-center gap-1 text-sm"
                >
                  Weiter <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Overview */}
          {step === 5 && (
            <div>
              <div className="text-center mb-5">
                <h4 className="font-bold text-lg text-slate-900 mb-1">Übersicht</h4>
                <p className="text-slate-500 text-xs">Bitte überprüfe deine Angaben</p>
                <p className="text-slate-700 text-sm font-semibold mt-2">Beurteilung in Schulnoten (1-5)</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Aufwand</span>
                  <span className="text-xl font-bold text-blue-600">{effortRating}<span className="text-slate-400 text-sm font-normal">/5</span></span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Schwierigkeit</span>
                  <span className="text-xl font-bold text-blue-600">{difficultyRating}<span className="text-slate-400 text-sm font-normal">/5</span></span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 text-sm"
                >
                  <ArrowLeft size={16} /> Zurück
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRating}
                  disabled={loading}
                  data-testid="submit-rating-btn"
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-xl flex items-center justify-center gap-1 text-sm"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Absenden <Send size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── LVA CARD COMPONENT ────────────────────────────────────────────────────
function LVACard({ lva, onRate, rank }) {
  const hasRatings = lva.rating_count > 0;
  const totalColor = colorMap[lva.total_color] || colorMap.yellow;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {rank && (
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              rank === 1 ? 'bg-amber-100 text-amber-700' :
              rank === 2 ? 'bg-slate-100 text-slate-600' :
              rank === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-50 text-blue-600'
            }`}>
              {rank}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 text-sm leading-tight">{lva.name}</h3>
        </div>
        <button
          onClick={() => onRate(lva)}
          data-testid={`rate-btn-${lva.id}`}
          className="shrink-0 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
        >
          <Star size={12} /> Bewerten
        </button>
      </div>

      {hasRatings ? (
        <div className="space-y-3">
          {/* Gesamt - Prominent */}
          <div className={`${totalColor.bg} ${totalColor.border} border rounded-xl p-4 text-center`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">Gesamt</p>
            <p className={`text-lg font-bold ${totalColor.text}`}>{lva.total_text}</p>
          </div>
          
          {/* Aufwand & Schwierigkeit - Smaller */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`${colorMap[lva.effort_color]?.bg || 'bg-slate-50'} ${colorMap[lva.effort_color]?.border || 'border-slate-200'} border rounded-lg p-2.5 text-center`}>
              <p className="text-[9px] font-medium uppercase tracking-wider opacity-60 mb-0.5">Aufwand</p>
              <p className={`text-xs font-semibold ${colorMap[lva.effort_color]?.text || 'text-slate-600'}`}>{lva.effort_text}</p>
            </div>
            <div className={`${colorMap[lva.difficulty_color]?.bg || 'bg-slate-50'} ${colorMap[lva.difficulty_color]?.border || 'border-slate-200'} border rounded-lg p-2.5 text-center`}>
              <p className="text-[9px] font-medium uppercase tracking-wider opacity-60 mb-0.5">Schwierigkeit</p>
              <p className={`text-xs font-semibold ${colorMap[lva.difficulty_color]?.text || 'text-slate-600'}`}>{lva.difficulty_text}</p>
            </div>
          </div>
          
          <p className="text-slate-400 text-[10px] text-right">
            {lva.rating_count} Bewertung{lva.rating_count !== 1 ? 'en' : ''}
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs">Noch keine Bewertungen</p>
          <p className="text-slate-500 text-[10px] mt-0.5">Sei der/die Erste!</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN LVA PAGE ─────────────────────────────────────────────────────────
export default function LVA() {
  const [topLvas, setTopLvas] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [totalLvaCount, setTotalLvaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLVA, setSelectedLVA] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch top 10 LVAs and total count on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch top LVAs and stats in parallel
        const [topResponse, statsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/lvas/top?limit=10`),
          fetch(`${BACKEND_URL}/api/lvas/stats`)
        ]);
        
        const topData = await topResponse.json();
        const statsData = await statsResponse.json();
        
        setTopLvas(topData);
        setTotalLvaCount(statsData.total || 0);
      } catch (err) {
        console.error('Failed to fetch LVAs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search LVAs when search term changes
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLvas = async () => {
      setSearching(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/lvas?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Failed to search LVAs:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchLvas, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleRate = (lva) => {
    setSelectedLVA(lva);
    setShowModal(true);
  };

  const handleRatingSuccess = () => {
    setShowModal(false);
    setSelectedLVA(null);
    // Refresh data
    window.location.reload();
  };

  const isSearching = search.trim().length > 0;
  const displayLvas = isSearching ? searchResults : topLvas;

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-5 relative overflow-hidden">
        <div className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] rounded-full bg-gold-50 blur-3xl opacity-50" />
        
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[3px] rounded-full bg-blue-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Lehrveranstaltungen</p>
            </div>
            <h1 data-testid="lva-page-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              LVA-Suche/Bewertungen
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Finde und bewerte Lehrveranstaltungen anonym. Hilf anderen Studierenden bei der Wahl ihrer Kurse!
            </p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={['Ehrlich bewerten', 'Anonym & sicher', 'Hilf anderen Studierenden', 'Deine Erfahrung zählt', 'Wissen ist Macht']}
        variant="blue"
        speed={30}
      />

      {/* Info & Search */}
      <section className="px-5 pb-8">
        <div className="max-w-[1120px] mx-auto">
          {/* Info Box */}
          <RevealOnScroll>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Info className="text-blue-500" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm mb-1">So funktioniert's</h2>
                  <ul className="text-slate-500 text-xs space-y-0.5">
                    <li>• Verifiziere dich mit deiner <strong>@students.jku.at</strong> E-Mail</li>
                    <li>• Bewerte Aufwand und Schwierigkeit (1-5)</li>
                    <li>• <strong>100% anonym</strong> – E-Mail wird nicht gespeichert</li>
                  </ul>
                  <p className="text-slate-400 text-[10px] mt-2">
                    Fehlt eine LVA? Melde dich bei <a href="mailto:wirtschaft@oeh.jku.at" className="text-blue-500 hover:underline">wirtschaft@oeh.jku.at</a>
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Search Bar */}
          <RevealOnScroll delay={0.05}>
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="LVA suchen... (z.B. 'Buchhaltung', 'Marketing')"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                  data-testid="lva-search-input"
                />
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Results */}
      <section className="px-5 pb-20">
        <div className="max-w-[1120px] mx-auto">
          {/* Section Header */}
          <RevealOnScroll>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {isSearching ? 'Suchergebnisse' : 'Top 10'}
              </p>
              {isSearching && !searching && (
                <span className="text-xs text-slate-400">({searchResults.length} gefunden)</span>
              )}
              {!isSearching && totalLvaCount > 0 && (
                <span className="text-xs text-slate-400">({totalLvaCount} LVAs insgesamt)</span>
              )}
            </div>
          </RevealOnScroll>

          {loading || searching ? (
            <div className="flex items-center justify-center py-20">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </motion.div>
            </div>
          ) : displayLvas.length === 0 ? (
            <RevealOnScroll>
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  {isSearching ? 'Keine LVAs gefunden' : 'Keine Bewertungen vorhanden'}
                </p>
                <p className="text-slate-500 text-sm">
                  {isSearching ? 'Versuche einen anderen Suchbegriff' : 'Sei der/die Erste und bewerte eine LVA!'}
                </p>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayLvas.map((lva, index) => (
                <RevealOnScroll key={lva.id} delay={index * 0.03}>
                  <LVACard 
                    lva={lva} 
                    onRate={handleRate} 
                    rank={!isSearching ? index + 1 : null}
                  />
                </RevealOnScroll>
              ))}
            </div>
          )}

          {/* Hint to search for more */}
          {!isSearching && topLvas.length > 0 && (
            <RevealOnScroll delay={0.3}>
              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  <TrendingUp size={14} className="inline mr-1" />
                  Zeigt die Top 10 bewerteten LVAs. Nutze die Suche für alle {'>'}100 LVAs.
                </p>
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* Rating Modal */}
      <AnimatePresence>
        {showModal && selectedLVA && (
          <RatingModal
            lva={selectedLVA}
            onClose={() => { setShowModal(false); setSelectedLVA(null); }}
            onSuccess={handleRatingSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
