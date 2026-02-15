/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ÖH WIRTSCHAFT - OFFIZIELLE WEBSITE
 *  Studienvertretung Wirtschaft | Johannes Kepler Universität Linz
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  PROJEKTBESCHREIBUNG:
 *  Multi-Page Website für die ÖH Wirtschaft (Studierendenvertretung).
 *  Enthält Informationen zu Studiengängen, Team, Services und dem 
 *  Magazin "Ceteris Paribus".
 * 
 *  TECH STACK:
 *  - React 18          → Frontend Framework
 *  - TailwindCSS       → Styling
 *  - Framer Motion     → Animationen
 *  - React Router      → Seitennavigation
 * 
 * ───────────────────────────────────────────────────────────────────────────
 *  Entwickelt von:     Raphael Böhmer
 *  Unternehmen:        Astra Capital e.U.
 *  Website:            https://astra-capital.eu
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── IMPORTS ───────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Komponenten
import Loader from './components/Loader';         // Ladeanimation beim Start
import Navbar from './components/Navbar';         // Navigation oben
import Footer from './components/Footer';         // Footer unten
import ScrollToTop from './components/ScrollToTop'; // Scrollt nach oben bei Seitenwechsel
import CustomCursor from './components/CustomCursor'; // Animierter Custom Cursor

// Seiten
import Home from './pages/Home';                  // Startseite
import News from './pages/News';                  // News & Ankündigungen
import Team from './pages/Team';                  // Team-Mitglieder
import Studium from './pages/Studium';            // Studiengänge & Updates
import Magazine from './pages/Magazine';          // Ceteris Paribus Magazin
import Contact from './pages/Contact';            // Kontakt, Services & FAQ
import Studienplaner from './pages/Studienplaner'; // Studienplaner
import Kalender from './pages/Kalender';          // Kalender
import LVA from './pages/LVA';                    // LVA-Bewertungen
import Impressum from './pages/Impressum';        // Impressum
import Datenschutz from './pages/Datenschutz';    // Datenschutz
import Login from './pages/Login';                // Admin Login
import AdminPanel from './pages/AdminPanel';      // Admin Panel
import NotFound from './pages/NotFound';          // 404 Fehlerseite

import './App.css';

// ─── ANIMATED ROUTES ───────────────────────────────────────────────────────
/**
 * AnimatedRoutes
 * Ermöglicht sanfte Übergangsanimationen zwischen den Seiten.
 * Verwendet Framer Motion's AnimatePresence für fade-in/fade-out Effekte.
 */
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/kalender" element={<Kalender />} />
        <Route path="/team" element={<Team />} />
        <Route path="/studium" element={<Studium />} />
        <Route path="/lva" element={<LVA />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/studienplaner" element={<Studienplaner />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── HAUPTKOMPONENTE ───────────────────────────────────────────────────────
/**
 * App (Hauptkomponente)
 * 
 * Struktur der Website:
 * ┌─────────────────────────────────┐
 * │           Navbar               │  ← Navigation
 * ├─────────────────────────────────┤
 * │                                 │
 * │        Seiteninhalt            │  ← Wechselt je nach Route
 * │                                 │
 * ├─────────────────────────────────┤
 * │           Footer               │  ← Fußzeile mit Links
 * └─────────────────────────────────┘
 * 
 * Beim ersten Laden wird 2.2 Sekunden ein Loader angezeigt.
 */
function App() {
  // State für Ladebildschirm
  const [loading, setLoading] = useState(true);

  // Ladebildschirm nach 2.2 Sekunden ausblenden
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Zeige Loader während des Ladens
  if (loading) return <Loader />;

  // Hauptlayout der Website
  return (
    <Router>
      <ScrollToTop />
      <CustomCursor />
      <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
