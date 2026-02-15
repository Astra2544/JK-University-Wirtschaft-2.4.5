/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HOME PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Beschreibung:
 *  Die Startseite der ÖH Wirtschaft Website. Enthält:
 *  - Hero-Bereich mit Willkommenstext
 *  - Quick-Links zu allen wichtigen Bereichen
 *  - Über uns Sektion mit Statistiken
 *  - Studiengänge-Übersicht (Bachelor/Master)
 *  - Call-to-Action zum Mitmachen
 * 
 * ───────────────────────────────────────────────────────────────────────────
 *  Entwickelt von:     Raphael Böhmer
 *  Unternehmen:        Astra Capital e.U.
 *  Website:            https://astra-capital.eu
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RevealOnScroll } from '../components/Animations';
import { ArrowRight, Users, BookOpen, Headphones, Newspaper, Instagram, Linkedin, Mail, TrendingUp } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import Marquee from '../components/Marquee';

const IMG_V = `?v=${process.env.REACT_APP_BUILD_TIME || Date.now()}`;

// ─── ANIMATION VARIANTEN ───────────────────────────────────────────────────
// Für fade-in/fade-out Effekte bei Seitenwechsel
const pv = { 
  initial: { opacity: 0 }, 
  animate: { opacity: 1, transition: { duration: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } } 
};

// ─── QUICK-LINK KARTEN ─────────────────────────────────────────────────────
// Die 4 Hauptbereiche der Website
const cards = [
  { icon: Users, label: 'Das Team', sub: 'Lerne deine Vertretung kennen', to: '/team', accent: 'blue' },
  { icon: BookOpen, label: 'Studium', sub: 'Programme, Planer & Updates', to: '/studium', accent: 'gold' },
  { icon: Headphones, label: 'Kontakt', sub: 'Sprechstunden, Kalender, FAQ', to: '/contact', accent: 'blue' },
  { icon: Newspaper, label: 'Ceteris Paribus', sub: 'Unsere Zeitschrift', to: '/magazine', accent: 'gold' },
];

// ─── STUDIENGÄNGE ──────────────────────────────────────────────────────────
// Bachelor-Programme
const bachelor = [
  'BSc. Wirtschaftswissenschaften',
  'BSc. Betriebswirtschaftslehre',
  'BSc. International Business Administration',
  'BSc. (CE) Finance, Banking und Digitalisierung'
];

// Master-Programme
const master = [
  'MSc. Digital Business Management',
  'MSc. Economic and Business Analytics',
  'MSc. Economics',
  'MSc. Finance and Accounting',
  'MSc. Management',
  'MSc. General Management Double Degree',
  'MSc. Global Business',
  'MSc. Leadership and Innovation in Organizations'
];

// ─── HOME KOMPONENTE ───────────────────────────────────────────────────────
export default function Home() {
  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SEKTION
          Willkommensbereich mit Hauptüberschrift und CTA-Buttons
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="hero-section" className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28 px-4 md:px-6 overflow-hidden">
        {/* Dekorative Blur-Kreise im Hintergrund */}
        <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-32 w-[400px] h-[400px] rounded-full bg-gold-50 blur-3xl opacity-60" />
        
        <div className="max-w-[1200px] mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Linke Seite - Text */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Untertitel */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-gold-500" />
                <span className="text-sm text-slate-500 font-medium">Studienvertretung an der JKU Linz</span>
              </motion.div>
              
              {/* Hauptüberschrift */}
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-bold text-slate-900 leading-[1.1] mb-5 tracking-tight">
                Deine ÖH{' '}<span className="text-blue-500">Wirtschaft</span>
              </motion.h1>
              
              {/* Beschreibungstext */}
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
                className="text-base md:text-lg text-slate-500 leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
                Wir sind deine offiziell gewählte Studienvertretung an der JKU. Wir setzen uns für die Interessen aller 
                Studierenden in Wirtschaft ein &ndash; als dein Sprachrohr gegenüber den Professor:innen.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-7">
                <Link to="/team" data-testid="hero-cta-team"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3.5 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  Team kennenlernen <ArrowRight size={16} />
                </Link>
                <Link to="/contact" data-testid="hero-cta-contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 border-2 border-slate-200 hover:border-blue-200 hover:text-blue-600 px-6 py-3.5 rounded-full transition-all">
                  Kontakt & FAQ
                </Link>
              </motion.div>
              
              {/* Social Media Icons + ÖH Link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-4 text-slate-400">
                  <a href="https://www.instagram.com/oeh_wirtschaft_wipaed/" target="_blank" rel="noopener noreferrer" data-testid="hero-instagram" className="hover:text-blue-500 transition-colors"><Instagram size={20}/></a>
                  <a href="http://linkedin.com/company/wirtschaft-wipaed" target="_blank" rel="noopener noreferrer" data-testid="hero-linkedin" className="hover:text-blue-500 transition-colors"><Linkedin size={20}/></a>
                  <a href="mailto:wirtschaft@oeh.jku.at" data-testid="hero-mail" className="hover:text-blue-500 transition-colors"><Mail size={20}/></a>
                </div>
                <span className="hidden sm:block w-px h-5 bg-slate-200" />
                <a 
                  href="https://www.oeh.jku.at" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="hero-oeh-jku-link"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full text-xs font-medium text-slate-600 hover:text-blue-600 transition-all"
                >
                  <span className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">ÖH</span>
                  ÖH JKU
                  <ArrowRight size={12} />
                </a>
              </motion.div>
            </div>
            
            {/* Rechte Seite - Bilder Collage */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative order-1 lg:order-2 mx-auto max-w-[320px] sm:max-w-[380px] lg:max-w-none"
            >
              {/* Hauptbild */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={`/images/background/hero-main.jpg${IMG_V}`}
                  alt="JKU Campus" 
                  className="w-full h-[190px] sm:h-[240px] lg:h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute inset-0 ring-1 ring-black/5 rounded-xl sm:rounded-2xl" />
              </div>
              
              {/* Kleines Bild links unten - überlappt */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 lg:-bottom-6 lg:-left-6 w-24 h-18 sm:w-36 sm:h-26 lg:w-48 lg:h-36 rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 sm:border-3 lg:border-4 border-white">
                <img 
                  src={`/images/background/hero-small1.jpg${IMG_V}`}
                  alt="Team bei der Arbeit" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Kleines Bild rechts oben - überlappt */}
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 lg:-top-4 lg:-right-4 w-20 h-16 sm:w-28 sm:h-22 lg:w-40 lg:h-28 rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 sm:border-3 lg:border-4 border-white">
                <img 
                  src={`/images/background/hero-small2.jpg${IMG_V}`}
                  alt="Studenten" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee
        items={['Von Studierenden, für Studierende', 'Dein Studium, deine Zukunft', 'Gemeinsam mehr erreichen', 'Deine Stimme zählt', 'Wir kämpfen für dich']}
        variant="blue"
        speed={35}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          QUICK-LINKS SEKTION
          4 Karten mit Links zu den Hauptbereichen
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="quick-links-section" className="py-20 px-5 bg-slate-50/60">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Auf einen Blick</p>
            </div>
          </RevealOnScroll>
          
          {/* Karten-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <RevealOnScroll key={c.to} delay={i * 0.08}>
                <Link to={c.to} data-testid={`quick-link-${c.to.replace('/', '')}`}
                  className="group block bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1">
                  <c.icon size={22} className={`mb-4 ${c.accent === 'blue' ? 'text-blue-500' : 'text-gold-500'}`} />
                  <p className="font-semibold text-slate-900 mb-1 group-hover:text-blue-500 transition-colors">{c.label}</p>
                  <p className="text-sm text-slate-400">{c.sub}</p>
                  <ArrowRight size={15} className="mt-3 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ÜBER UNS SEKTION
          Beschreibung der Studienvertretung + Bilder
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="about-section" className="py-16 md:py-24 lg:py-28 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Linke Spalte: Bilder-Grid */}
          <RevealOnScroll direction="left">
            <div className="relative mx-auto max-w-[320px] sm:max-w-[380px] lg:max-w-[480px]">
              {/* Hauptbild - Querformat */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={`/images/background/about-main.jpg${IMG_V}`}
                  alt="Team Meeting" 
                  className="w-full h-[160px] sm:h-[190px] lg:h-[260px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>
              
              {/* Zweites Bild - überlappt unten rechts */}
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-32 h-20 sm:w-40 sm:h-26 lg:w-52 lg:h-32 rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 sm:border-3 lg:border-4 border-white">
                <img 
                  src={`/images/background/about-small.jpg${IMG_V}`}
                  alt="Gruppenfoto" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </RevealOnScroll>
          
          {/* Rechte Spalte: Text + Statistik */}
          <RevealOnScroll direction="right">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[3px] rounded-full bg-blue-500" />
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Über uns</p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                Wie arbeitet eine Studienvertretung (kurz StV.) genau?
              </h2>
              <p className="text-sm sm:text-[15px] text-slate-500 leading-[1.8] mb-3">
                Die ÖH Wirtschaft ist das direkt gewählte Gremium, das die Studierenden eines Studienbereichs vertritt. 
                Dabei agieren wir unabhängig vom Vorsitz der ÖH JKU oder anderen Gremien &ndash; alle unsere Projekte, 
                Services und Entscheidungen entstehen direkt innerhalb unseres Teams.
              </p>
              <p className="text-sm sm:text-[15px] text-slate-500 leading-[1.8] mb-6">
                Darüber hinaus unterstützen wir dich mit zahlreichen Services: von individueller Studienberatung bis hin 
                zu praktischen Broschüren und regelmäßigen Veranstaltungen.
              </p>
              
              {/* Statistik-Grid - separat unter dem Text */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
                {[
                  { n: '14+', l: 'Teammitglieder', c: 'blue' },
                  { n: '20+', l: 'Studiengänge', c: 'gold' },
                  { n: '3', l: 'Studienplaner', c: 'blue' },
                  { n: '100%', l: 'Ehrenamtlich', c: 'gold' },
                ].map(s => (
                  <div key={s.l} className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center border border-slate-100">
                    <p className={`text-lg sm:text-xl font-bold mb-0.5 ${s.c === 'blue' ? 'text-blue-500' : 'text-gold-500'}`}>{s.n}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <Marquee
        items={['Wissen teilen', 'Chancen nutzen', 'Horizonte erweitern', 'Zusammen wachsen', 'Zukunft gestalten']}
        variant="gold"
        speed={38}
        reverse
      />

      {/* ═══════════════════════════════════════════════════════════════════
          LVA BEWERTUNGEN BANNER
          Einfacher Banner mit Link zur LVA-Seite
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="lva-banner-section" className="py-16 px-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-blue-500" size={28} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Beliebteste LVAs</h2>
                  <p className="text-sm text-slate-500">Finde und bewerte Lehrveranstaltungen anonym</p>
                </div>
              </div>
              <Link 
                to="/lva"
                data-testid="lva-banner-btn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors text-sm whitespace-nowrap"
              >
                Zu den LVAs <ArrowRight size={16} />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STUDIENGÄNGE SEKTION
          Übersicht der Bachelor- und Master-Programme
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="programs-section" className="py-20 px-5 bg-slate-50/60">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Studiengänge</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">Wir vertreten dich in</h2>
            <p className="text-[15px] text-slate-500 mb-10">Folgende Studiengänge fallen in den Bereich der ÖH Wirtschaft:</p>
          </RevealOnScroll>
          
          {/* Bachelor / Master Karten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bachelor */}
            <RevealOnScroll>
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Bachelor</p>
                <ul className="space-y-2.5">
                  {bachelor.map(s => (
                    <li key={s} className="text-[15px] text-slate-600 flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-[7px] shrink-0"/>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
            
            {/* Master */}
            <RevealOnScroll delay={0.08}>
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-4">Master</p>
                <ul className="space-y-2.5">
                  {master.map(s => (
                    <li key={s} className="text-[15px] text-slate-600 flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-[7px] shrink-0"/>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          </div>
          
          {/* Link zu allen Programmen */}
          <RevealOnScroll delay={0.15}>
            <div className="mt-6">
              <Link to="/studium" data-testid="programs-more-btn"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                Alle Programme, MBA, ULG & Updates <ArrowRight size={15} />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GALERIE SEKTION
          Diashow mit automatischer Wiedergabe
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="gallery-section" className="py-14 md:py-16 lg:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-[800px] mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-6 sm:w-8 h-[3px] rounded-full bg-blue-500" />
                <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Einblicke</p>
                <div className="w-6 sm:w-8 h-[3px] rounded-full bg-blue-500" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">Unser Team in Aktion</h2>
            </div>
          </RevealOnScroll>
          
          {/* Image Slider / Diashow */}
          <RevealOnScroll>
            <ImageSlider />
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CALL-TO-ACTION SEKTION
          Aufruf zum Mitmachen im Team
      ═══════════════════════════════════════════════════════════════════ */}
      <section data-testid="cta-section" className="py-20 md:py-28 px-5">
        <div className="max-w-[700px] mx-auto text-center">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-10 md:p-14 relative overflow-hidden">
              {/* Dekorative Blur-Kreise */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-4">Mitmachen</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  Du willst die JKU aktiv mitgestalten?
                </h2>
                <p className="text-blue-100 text-[15px] max-w-md mx-auto mb-8 leading-relaxed">
                  Werde Teil unseres Teams! Sammle ECTS, gestalte Curricula mit und baue echte Skills auf &ndash; 
                  von Projektmanagement bis Verhandlungsführung.
                </p>
                
                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/contact" data-testid="cta-email-btn"
                    className="text-sm font-semibold text-blue-700 bg-gold-500 hover:bg-gold-600 px-6 py-3 rounded-full transition-all hover:shadow-lg">
                    Jetzt mitmachen
                  </Link>
                  <Link to="/team" data-testid="cta-team-btn"
                    className="text-sm font-semibold text-white border-2 border-white/30 hover:border-white/60 px-6 py-3 rounded-full transition-all">
                    Team ansehen
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </motion.div>
  );
}
