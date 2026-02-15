/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  TEAM PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Beschreibung:
 *  Zeigt alle Teammitglieder der ÖH Wirtschaft an basierend auf Teamübersicht.xlsx
 *  Struktur: Vorsitzender (ganz groß) > Bereichsleiter (groß) > 
 *            Stellvertreter/Wichtige (mittel) > Weitere Mitglieder (klein)
 * 
 * ───────────────────────────────────────────────────────────────────────────
 *  Entwickelt von:     Raphael Böhmer
 *  Unternehmen:        Astra Capital e.U.
 *  Website:            https://astra-capital.eu
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../components/Animations';
import { Mail, ArrowRight, Globe, Camera, PartyPopper, Newspaper, Users, Award, UserPlus } from 'lucide-react';
import Marquee from '../components/Marquee';

const IMG_V = `?v=${process.env.REACT_APP_BUILD_TIME || Date.now()}`;

// ─── ANIMATION VARIANTEN ───────────────────────────────────────────────────
const pv = { 
  initial: { opacity: 0 }, 
  animate: { opacity: 1, transition: { duration: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } } 
};

// ─── VORSITZENDER (ganz groß) ──────────────────────────────────────────────
const vorsitzender = {
  name: 'Maximilian Pilsner',
  email: 'maximilian.pilsner@oeh.jku.at',
  role: 'Vorsitzender',
  image: '/images/team/Maximilian-Pilsner.png'
};

// ─── BEREICHSLEITER (groß) ─────────────────────────────────────────────────
const bereichsleiter = [
  { name: 'Lucia Schoisswohl', email: 'lucia.schoisswohl@oeh.jku.at', area: 'Medien', color: 'purple', icon: 'camera', image: '/images/team/Lucia-Schoisswohl.png' },
  { name: 'Stefan Gstöttenmayer', email: 'wirtschaft@oeh.jku.at', area: 'Events', color: 'gold', icon: 'party', image: '/images/team/Stefan-Gstoettenmayer.png' },
  { name: 'Sebastian Jensen', email: 'sebastian.jensen@oeh.jku.at', area: 'Internationals', color: 'blue', icon: 'globe', image: '/images/team/Sebastian-Jensen.png' },
  { name: 'Carolina Götsch', email: 'wirtschaft@oeh.jku.at', area: 'Social Media', color: 'pink', icon: 'camera', image: '/images/team/Carolina-Goetsch.png' },
];

// ─── STELLVERTRETER & WICHTIGE MITGLIEDER (mittel) ─────────────────────────
const stellvertreter = [
  { name: 'Simon Plangger', email: 'simon.plangger@oeh.jku.at', role: '1. Stv. SoWi-Fakultätsvorsitzender', image: '/images/team/Simon-Plangger.png' },
  { name: 'Matej Kromka', email: 'wirtschaft@oeh.jku.at', role: 'Internationals', image: '/images/team/Matej-Kromka.png' },
  { name: 'Florian Zimmermann', email: 'wirtschaft@oeh.jku.at', role: 'Events', image: '/images/team/Florian-Zimmermann.png' },
  { name: 'Maxim Tafincev', email: 'wirtschaft@oeh.jku.at', role: 'Events', image: '/images/team/Maxim-Tafincev.png' },
  { name: 'Simon Reisinger', email: 'wirtschaft@oeh.jku.at', role: 'Events', image: '/images/team/Simon-Reisinger.png' },
  { name: 'Paul Mairleitner', email: 'wirtschaft@oeh.jku.at', role: 'Chefredakteur Ceteris Paribus', image: '/images/team/Paul-Mairleitner.png' },
  { name: 'Sarika Bimanaviona', email: 'wirtschaft@oeh.jku.at', role: 'Global', image: '/images/team/Sarika-Bimanaviona.png' },
  { name: 'Thomas Kreilinger', email: 'wirtschaft@oeh.jku.at', role: 'Medien', image: '/images/team/Thomas-Kreilinger.png' },
  { name: 'Lilli Huber', email: 'lilli.huber@oeh.jku.at', role: 'ÖH WiPäd-Vorsitzende', image: '/images/team/Lilli-Huber.png' },
  { name: 'Theresa Kloibhofer', email: 'theresa.kloibhofer@oeh.jku.at', role: 'ÖH Wirtschaft', image: '/images/team/Theresa-Kloibhofer.png' },
  { name: 'Philipp Bergsmann', email: 'philipp.bergsmann@oeh.jku.at', role: 'ehem. ÖH Vorsitzender', image: '/images/team/Philipp-Bergsmann.png' },
  { name: 'Paul Hamminger', email: 'paul.hamminger@oeh.jku.at', role: 'ÖH Referent für Internationales', image: '/images/team/Paul-Hamminger.png' },
  { name: 'Alex Sighireanu', email: 'wirtschaft@oeh.jku.at', role: 'Internationals', image: '/images/team/Alex-Sighireanu.png' },
  { name: 'Victoria Riener', email: 'victoria.riener@oeh.jku.at', role: 'ehem. ÖH Generalsekretärin', image: '/images/team/Victoria-Riener.png' },
];

// ─── WEITERE MITGLIEDER (klein) ────────────────────────────────────────────
const weitereMitglieder = [
  { name: 'Louis Jacquemain', email: 'wirtschaft@oeh.jku.at', role: 'Internationals' },
  { name: 'Leon Avant', email: 'wirtschaft@oeh.jku.at', role: 'Internationals' },
  { name: 'Nicolas Kaufman', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Matthias Pilz', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Moritz Siebert', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Lukas Gutmann', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Moritz Strachon', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Ioana Vasilache', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Anna Schaur', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Melanie Derntl', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Johannes Neuhuber', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
  { name: 'Michael Tremetsberger', email: 'wirtschaft@oeh.jku.at', role: 'ÖH Wirtschaft' },
];

// ─── VORTEILE DER MITARBEIT ────────────────────────────────────────────────
const benefits = [
  { t: 'ECTS pro aktivem Semester', d: 'Ohne Klausur, anerkannt für echte Praxis und Ehrenamt.' },
  { t: 'Mitreden, wenn\'s zählt', d: 'Curricula und Prüfungsregelungen mitgestalten, in Gremien mitentscheiden.' },
  { t: 'Eigene Projekte mit Budget', d: 'Von Events bis Services – planen, verhandeln, umsetzen.' },
  { t: 'Karriere-Plus', d: 'Tätigkeitsbericht und Bestätigung für CV/LinkedIn mit starken Referenzen.' },
  { t: 'Skill-Turbo', d: 'Projektmanagement, Kommunikation, Verhandeln, Teamführung – learning by doing.' },
  { t: 'Einblicke hinter die Kulissen', d: 'Mentoring, Onboarding, flexible Arbeit – Prüfungsphasen werden berücksichtigt.' },
  { t: 'Praktische Vorteile', d: 'ÖH E-Mailadresse, Zugang zu Ressourcen/Räumen und eine verlässliche Community.' },
];

// ─── INITIALEN-KOMPONENTE ──────────────────────────────────────────────────
function Initials({ name, className = '' }) {
  const ini = name.split(' ').map(n => n[0]).join('');
  return <span className={className}>{ini}</span>;
}

// ─── BEREICHSLEITER KARTE (groß) ───────────────────────────────────────────
function BereichsleiterCard({ person, index }) {
  const colorStyles = {
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      border: 'border-purple-200/60',
      hoverBorder: 'hover:border-purple-300',
      badge: 'bg-purple-500 text-white',
      initials: 'bg-purple-500/10 text-purple-600 border-purple-200',
      icon: <Camera size={12} />,
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50/50',
      border: 'border-blue-200/60',
      hoverBorder: 'hover:border-blue-300',
      badge: 'bg-blue-500 text-white',
      initials: 'bg-blue-500/10 text-blue-600 border-blue-200',
      icon: <Globe size={12} />,
    },
    gold: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50/50',
      border: 'border-amber-200/60',
      hoverBorder: 'hover:border-amber-300',
      badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      initials: 'bg-amber-500/10 text-amber-600 border-amber-200',
      icon: <PartyPopper size={12} />,
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-rose-100/50',
      border: 'border-pink-200/60',
      hoverBorder: 'hover:border-pink-300',
      badge: 'bg-pink-500 text-white',
      initials: 'bg-pink-500/10 text-pink-600 border-pink-200',
      icon: <Camera size={12} />,
    },
  };
  
  const style = colorStyles[person.color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`${style.bg} ${style.border} ${style.hoverBorder} border rounded-2xl p-5 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${style.initials} border overflow-hidden shrink-0`}>
          <img 
            src={`${person.image}${IMG_V}`} 
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.icon} {person.area}
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mb-0.5">{person.name}</p>
          <Link to="/contact" className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1">
            <Mail size={11} className="shrink-0"/>Kontaktieren
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── STELLVERTRETER KARTE (mittel) ─────────────────────────────────────────
function StellvertreterCard({ person, index }) {
  return (
    <RevealOnScroll delay={index * 0.04}>
      <div
        data-testid={`team-stellvertreter-${index}`}
        className="group flex items-start gap-3.5 bg-white rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
      >
        <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 ${
          index % 3 === 0 ? 'ring-2 ring-blue-100' : 
          index % 3 === 1 ? 'ring-2 ring-gold-100' : 
          'ring-2 ring-purple-100'
        }`}>
          <img 
            src={`${person.image}${IMG_V}`} 
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{person.name}</p>
          <p className="text-xs text-slate-500 mb-1">{person.role}</p>
          <Link to="/contact" className="text-[11px] text-slate-300 hover:text-blue-500 transition-colors flex items-center gap-1 truncate">
            <Mail size={10} className="shrink-0"/>Kontaktieren
          </Link>
        </div>
      </div>
    </RevealOnScroll>
  );
}

// ─── KLEINE MITGLIEDER KARTE ───────────────────────────────────────────────
function KleineMitgliederCard({ person, index }) {
  return (
    <RevealOnScroll delay={index * 0.03}>
      <div
        data-testid={`team-member-klein-${index}`}
        className="group flex items-center gap-3 bg-slate-50/50 rounded-lg p-3 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-200"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          index % 2 === 0 ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
        }`}>
          <Initials name={person.name} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-700 truncate">{person.name}</p>
          <p className="text-[10px] text-slate-400">{person.role}</p>
        </div>
      </div>
    </RevealOnScroll>
  );
}

export default function Team() {
  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-5 relative overflow-hidden">
        <div className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-50" />
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Wir sind für dich da</p>
            </div>
            <h1 data-testid="team-page-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Dein Team</h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Wir sind deine Ansprechpartner:innen und stehen dir bei Fragen oder Problemen im Studium jederzeit zur Seite!
            </p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={['Machen statt reden', 'Mit Leidenschaft dabei', 'Ehrenamtlich & stolz drauf', 'Dein Erfolg ist unser Antrieb', 'Gemeinsam unschlagbar']}
        variant="dark"
        speed={32}
      />

      {/* Vorsitzender (ganz groß) */}
      <section className="px-5 pt-10 pb-10">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div data-testid="team-lead-card" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 overflow-hidden shrink-0">
                <img 
                  src={`${vorsitzender.image}${IMG_V}`} 
                  alt={vorsitzender.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">{vorsitzender.role}</p>
                <p className="text-2xl font-bold text-white mb-1">{vorsitzender.name}</p>
                <Link to="/contact" className="text-sm text-blue-100 hover:text-white transition-colors flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail size={14}/>Kontaktieren
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Bereichsleiter (groß) */}
      <section data-testid="team-area-leads" className="px-5 pb-12">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Bereichsleitung</p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bereichsleiter.map((person, i) => (
              <BereichsleiterCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Stellvertreter & Wichtige Mitglieder (mittel) */}
      <section data-testid="team-stellvertreter-section" className="px-5 pb-12">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Team</p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stellvertreter.map((person, i) => (
              <StellvertreterCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Weitere Mitglieder (klein) */}
      <section data-testid="team-weitere-section" className="px-5 pb-12">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Weitere Mitglieder</p>
          </RevealOnScroll>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {weitereMitglieder.map((person, i) => (
              <KleineMitgliederCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* "Und du?" CTA Karte */}
      <section data-testid="team-und-du-section" className="px-5 pb-16">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-gold-50 via-amber-50 to-orange-50 border border-gold-200/60 rounded-2xl p-8 md:p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white border-2 border-gold-300 flex items-center justify-center shadow-lg">
                <UserPlus size={38} className="text-gold-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">und du?</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Werde Teil des Teams und gestalte die ÖH Wirtschaft aktiv mit!
              </p>
              <Link
                to="/contact"
                data-testid="team-und-du-btn"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-gold-500/30"
              >
                Jetzt mitmachen <ArrowRight size={15} />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Mitmachen Vorteile */}
      <section data-testid="team-join-section" className="py-20 px-5 bg-slate-50/60">
        <div className="max-w-[900px] mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[3px] rounded-full bg-blue-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Warum mitmachen?</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Du willst nicht nur studieren, sondern die JKU aktiv mitgestalten?
            </h2>
            <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
              Als Teil der Universität durch die ÖH wirkst du an Ausrichtung und Entscheidungen mit &ndash; in Kommissionen, 
              Projekten und Verhandlungen:
            </p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {benefits.map((b, i) => (
              <RevealOnScroll key={b.t} delay={i * 0.04}>
                <div className="bg-white rounded-xl p-4 border border-slate-100 hover:border-gold-200 transition-colors">
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">{b.t}</p>
                  <p className="text-sm text-slate-400">{b.d}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
          <RevealOnScroll>
            <p className="text-sm text-slate-500 mb-6">
              Ehrenamtliche erhalten <strong className="text-slate-700">45% mehr Interview-Rückmeldungen</strong>{' '}
              <span className="text-slate-400">(Alfonso-Costillo et al., 2021)</span>.
            </p>
            <Link to="/contact" data-testid="team-join-btn"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20">
              Kontakt aufnehmen <ArrowRight size={15} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </motion.div>
  );
}
