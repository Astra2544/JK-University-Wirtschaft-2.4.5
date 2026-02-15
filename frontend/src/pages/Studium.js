/**
 * -----------------------------------------------------------------
 *  Studium Page | OeH Wirtschaft
 *  Komplett dynamisch aus der Datenbank
 * -----------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../components/Animations';
import { ChevronDown, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import Marquee from '../components/Marquee';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const pv = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5 } }, exit: { opacity: 0, transition: { duration: 0.2 } } };

const fallbackBrochures = [
  { title: 'Wirtschaftswissenschaften', url: 'https://heyzine.com/flip-book/4efdf121a1.html' },
  { title: 'Betriebswirtschaftslehre', url: 'https://heyzine.com/flip-book/93d13220c6.html' },
  { title: 'International Business Administration', url: 'https://heyzine.com/flip-book/2b404116c1.html' },
];

function Acc({ title, children, testId }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={testId} className="border-b border-slate-100">
      <button onClick={() => setOpen(!open)} data-testid={`${testId}-toggle`}
        className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-[15px] font-medium text-slate-800 pr-4 group-hover:text-blue-500 transition-colors">{title}</span>
        <ChevronDown className={`text-slate-300 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} size={16} />
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="pb-5 pl-1">{children}</div>
      </motion.div>
    </div>
  );
}

function ProgCard({ title, items, color }) {
  const colorClass = {
    blue: { text: 'text-blue-500', dot: 'bg-blue-500' },
    gold: { text: 'text-amber-500', dot: 'bg-amber-500' },
    green: { text: 'text-emerald-500', dot: 'bg-emerald-500' },
    purple: { text: 'text-purple-500', dot: 'bg-purple-500' },
  };
  const colors = colorClass[color] || colorClass.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${colors.text}`}>{title}</p>
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="text-[15px] text-slate-600 flex items-start gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${colors.dot}`}/>
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Studium() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, updRes] = await Promise.all([
          fetch(`${API_URL}/api/study/categories`),
          fetch(`${API_URL}/api/study/updates/grouped`)
        ]);

        if (!catRes.ok || !updRes.ok) {
          throw new Error('API nicht erreichbar');
        }

        const catData = await catRes.json();
        const updData = await updRes.json();

        setCategories(catData.sort((a, b) => a.sort_order - b.sort_order));
        setUpdates(updData);
      } catch (err) {
        console.error('Error fetching study data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentSemester = updates.length > 0 && updates[0].updates?.[0]?.semester
    ? updates[0].updates[0].semester
    : 'Wintersemester 2025/26';

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-5 relative overflow-hidden">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-gold-50 blur-3xl opacity-50" />
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4"><div className="w-8 h-[3px] rounded-full bg-blue-500" /><p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('studium.section')}</p></div>
            <h1 data-testid="studium-page-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">{t('studium.title')}</h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">{t('studium.desc')}</p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={t('studium.marquee', { returnObjects: true })}
        variant="gold"
        speed={36}
        reverse
      />

      <section data-testid="programs-list-section" className="pb-20 px-5">
        <div className="max-w-[1120px] mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw size={32} className="animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">
              <p>{t('studium.loadError')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                {categories.map((category, index) => (
                  <RevealOnScroll key={category.id} delay={index * 0.05}>
                    <ProgCard
                      title={category.display_name}
                      items={category.programs.sort((a, b) => a.sort_order - b.sort_order)}
                      color={category.color || 'blue'}
                    />
                  </RevealOnScroll>
                ))}
              </div>

              <RevealOnScroll>
                <div className="mb-16 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={20} className="text-blue-500"/>
                    <h2 className="text-xl font-bold text-slate-900">{t('studium.planner')}</h2>
                  </div>
                  <p className="text-[15px] text-slate-500 leading-relaxed mb-5 max-w-2xl">
                    {t('studium.plannerDesc')}
                  </p>
                  <Link
                    to="/studienplaner"
                    data-testid="studienplaner-link-btn"
                    className="inline-flex items-center gap-2 text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md"
                  >
                    {t('studium.plannerBtn')} <ArrowRight size={18}/>
                  </Link>
                </div>
              </RevealOnScroll>

              <RevealOnScroll>
                <div className="flex items-center gap-3 mb-2"><div className="w-8 h-[3px] rounded-full bg-gold-500"/><p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('studium.updates')}</p></div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{t('studium.updatesTitle')}</h2>
                <p className="text-sm text-slate-500 mb-1 max-w-2xl">{t('studium.updatesSub')}</p>
                <p className="text-xs text-slate-400 mb-6">{t('studium.updatesDate')} <strong className="text-slate-500">{currentSemester}</strong></p>

                {updates.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                    {t('studium.noUpdates')}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden px-6">
                    {updates.map((u, i) => (
                      <Acc key={u.program_id} title={u.program_name} testId={`update-${i}`}>
                        <ul className="space-y-2">
                          {u.updates.map((item, j) => (
                            <li key={item.id || j} className="text-sm text-slate-500 leading-relaxed flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-500 mt-[8px] shrink-0"/>
                              {item.content}
                            </li>
                          ))}
                        </ul>
                      </Acc>
                    ))}
                  </div>
                )}
              </RevealOnScroll>
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}
