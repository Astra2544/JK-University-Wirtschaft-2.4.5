/**
 * ─────────────────────────────────────────────────────────────
 *  Magazine (Ceteris Paribus) | ÖH Wirtschaft
 *  @author Raphael Böhmer • Astra Capital e.U.
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';
import { RevealOnScroll } from '../components/Animations';
import { ArrowUpRight } from 'lucide-react';
import Marquee from '../components/Marquee';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5 } }, exit: { opacity: 0, transition: { duration: 0.2 } } };
const editions = [
  { title: '1. Ausgabe (DE)', url: 'https://heyzine.com/flip-book/53367d0f95.html', lang: 'Deutsch' },
  { title: '1. Ausgabe (EN)', url: 'https://heyzine.com/flip-book/5ca1bd17d0.html', lang: 'English' },
];
const timeline = [
  { sem: 'Wintersemester 25/26', status: 'umgesetzt', color: 'green', desc: 'Einreichfrist abgeschlossen. Du hast trotzdem eine Idee? Reiche sie für eine nächste Ausgabe ein!' },
  { sem: 'Sommersemester 26', status: 'in Umsetzung', color: 'gold', desc: 'Die Sommerausgabe 2026 ist in Arbeit. Einreichfrist: 05.02.2026. Veröffentlichung: Ende April/Anfang Mai 2026.', form: 'https://docs.google.com/forms/d/e/1FAIpQLSdlWveMxwNX-kSZE_EXwTtKFELM5GPyy8gLycBlXrOfPU1j_w/viewform' },
  { sem: 'Wintersemester 26/27', status: 'in Planung', color: 'blue', desc: 'In Planung. Jetzt ist der beste Zeitpunkt für Themenvorschläge per Mail an wirtschaft@oeh.jku.at.' },
];

export default function Magazine() {
  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-5 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-gold-50 blur-3xl opacity-50"/>
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4"><div className="w-8 h-[3px] rounded-full bg-gold-500"/><p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Die Zeitschrift</p></div>
            <h1 data-testid="magazine-page-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Ceteris Paribus</h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">Stimmen aus Studium, Forschung und Praxis &ndash; ergänzt durch Tools, die dir im Alltag weiterhelfen.</p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={['Ideen, die bewegen', 'Schreib Geschichte', 'Deine Perspektive zählt', 'Wissen verbindet', 'Mehr als ein Magazin']}
        variant="dark"
        speed={33}
      />

      <section className="pb-20 px-5 pt-10">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">
            <RevealOnScroll className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 h-full">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Über Ceteris Paribus</h2>
                <p className="text-[15px] text-slate-500 leading-[1.8] mb-3">Mit Ceteris Paribus hat die ÖH Wirtschaft eine starke neue Zeitschrift geschaffen. Es vereint Stimmen aus Studium, Forschung und Praxis der Wirtschaftswelt.</p>
                <p className="text-[15px] text-slate-500 leading-[1.8]">Ceteris Paribus macht sichtbar, was die JKU- und ÖH-Community bewegt, gibt Orientierung im Studien- und Berufsleben und schafft Raum für neue Ideen und Perspektiven.</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.05} className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 h-full">
                <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-4">Aktuelle Ausgaben</p>
                <div className="space-y-3">
                  {editions.map(ed => (
                    <a key={ed.title} href={ed.url} target="_blank" rel="noopener noreferrer" data-testid={`edition-${ed.lang.toLowerCase()}`}
                      className="flex items-center justify-between py-3 border-b border-white/15 last:border-0 group">
                      <div><p className="text-white font-medium text-sm">{ed.title}</p><p className="text-blue-200 text-xs">{ed.lang}</p></div>
                      <ArrowUpRight size={15} className="text-blue-200 group-hover:text-gold-500 transition-colors"/>
                    </a>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Mitmachen */}
          <RevealOnScroll>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-5"><div className="w-8 h-[3px] rounded-full bg-blue-500"/><p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Mitmachen</p></div>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-8 max-w-2xl">Studierende, Lehrende, Mitarbeitende und Partner sind herzlich eingeladen beizutragen.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'who', t: 'Wer?', d: 'Alle: Studierende aller wirtschaftlichen Studienrichtungen, Lehrende, Mitarbeiter:innen und Partner. Kostenlos.' },
                  { id: 'what', t: 'Was?', d: 'Analysen, Kommentare, Interviews, Kolumnen, Reportagen, How-tos. Ca. 3.000 Zeichen. Deutsch und Englisch.' },
                  { id: 'how', t: 'Wie?', d: 'Per Formular einreichen. Rückmeldung in 2 Wochen. Text als .docx, Bilder als .jpg/.png (min. 2000px).' },
                ].map(c => (
                  <div key={c.id} data-testid={`contribute-${c.id}`} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-sm font-bold text-slate-800 mb-2">{c.t}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{c.d}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm font-bold text-slate-800 mb-2">Dateien & Materialien</p>
                  <p className="text-sm text-slate-400 leading-relaxed">Text als .docx. Bilder: .jpg/.png mind. 2000px (alternativ .svg/.pdf). Daten als Excel/CSV mit Beschreibung.</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-sm font-bold text-slate-800 mb-2">Rechte & Rahmenbedingungen</p>
                  <p className="text-sm text-slate-400 leading-relaxed">Urheberrecht bleibt bei dir. Einfaches Nutzungsrecht für Print/Online (inkl. Social Media). Fakten belegen, KI-Tools transparent angeben.</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Timeline */}
          <RevealOnScroll>
            <div data-testid="submission-timeline">
              <div className="flex items-center gap-3 mb-5"><div className="w-8 h-[3px] rounded-full bg-gold-500"/><p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Einreichungen</p></div>
              <div className="space-y-3">
                {timeline.map((t, i) => {
                  const dotC = { green: 'bg-green-500', gold: 'bg-gold-500', blue: 'bg-blue-500' };
                  const badgeC = { green: 'bg-green-50 text-green-600', gold: 'bg-gold-50 text-gold-600', blue: 'bg-blue-50 text-blue-500' };
                  return (
                    <div key={t.sem} data-testid={`timeline-${i}`} className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${dotC[t.color]}`}/>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeC[t.color]}`}>{t.status}</span>
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-slate-900 mb-1">{t.sem}</p>
                        <p className="text-sm text-slate-400">{t.desc}</p>
                        {t.form && <a href={t.form} target="_blank" rel="noopener noreferrer" data-testid="submit-form-btn"
                          className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">Beitrag einreichen <ArrowUpRight size={13}/></a>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </motion.div>
  );
}
