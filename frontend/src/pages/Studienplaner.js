/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  STUDIENPLANER PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Beschreibung:
 *  Seite mit Links zu den Studienplanern für verschiedene Studiengänge.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  Entwickelt von:     Raphael Böhmer
 *  Unternehmen:        Astra Capital e.U.
 *  Website:            https://astra-capital.eu
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RevealOnScroll } from '../components/Animations';
import { BookOpen, ArrowUpRight, ArrowRight, FileText, Download } from 'lucide-react';
import Marquee from '../components/Marquee';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100 hover:border-blue-300',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-500',
    btn: 'bg-blue-500 hover:bg-blue-600',
    btnSecondary: 'text-blue-600 hover:bg-blue-50 border-blue-200'
  },
  gold: {
    bg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-300',
    icon: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-500',
    btn: 'bg-amber-500 hover:bg-amber-600',
    btnSecondary: 'text-amber-600 hover:bg-amber-50 border-amber-200'
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-100 hover:border-teal-300',
    icon: 'bg-teal-100 text-teal-600',
    badge: 'bg-teal-500',
    btn: 'bg-teal-500 hover:bg-teal-600',
    btnSecondary: 'text-teal-600 hover:bg-teal-50 border-teal-200'
  }
};

export default function Studienplaner() {
  const { t } = useTranslation();

  const studienplaner = [
    {
      title: 'Wirtschaftswissenschaften',
      shortName: 'WiWi',
      url: 'https://heyzine.com/flip-book/4efdf121a1.html',
      color: 'blue',
      description: t('studienplaner.descriptions.wiwi')
    },
    {
      title: 'Betriebswirtschaftslehre',
      shortName: 'BWL',
      url: 'https://heyzine.com/flip-book/93d13220c6.html',
      color: 'gold',
      description: t('studienplaner.descriptions.bwl')
    },
    {
      title: 'International Business Administration',
      shortName: 'IBA',
      url: 'https://heyzine.com/flip-book/2b404116c1.html',
      color: 'teal',
      description: t('studienplaner.descriptions.iba')
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-5 relative overflow-hidden">
        <div className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-50" />
        <div className="max-w-[1120px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[3px] rounded-full bg-gold-500" />
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t('studienplaner.section')}
              </p>
            </div>
            <h1
              data-testid="studienplaner-title"
              className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4"
            >
              {t('studienplaner.title')}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              {t('studienplaner.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      <Marquee
        items={t('studienplaner.marquee', { returnObjects: true })}
        variant="blue"
        speed={35}
        reverse
      />

      {/* Studienplaner Cards */}
      <section data-testid="studienplaner-cards-section" className="px-5 pt-10 pb-16">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studienplaner.map((planer, index) => {
              const colors = colorClasses[planer.color];
              return (
                <RevealOnScroll key={planer.title} delay={index * 0.1}>
                  <div
                    data-testid={`studienplaner-card-${planer.shortName.toLowerCase()}`}
                    className={`${colors.bg} rounded-2xl border-2 ${colors.border} p-6 transition-all hover:shadow-lg group`}
                  >
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center`}>
                        <BookOpen size={28} />
                      </div>
                      <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {planer.shortName}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {planer.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      {planer.description}
                    </p>

                    {/* Button */}
                    <a
                      href={planer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`studienplaner-btn-${planer.shortName.toLowerCase()}`}
                      className={`w-full ${colors.btn} text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md group-hover:scale-[1.02]`}
                    >
                      <FileText size={18} />
                      {t('studienplaner.openBtn')}
                      <ArrowUpRight size={16} className="ml-1" />
                    </a>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="px-5 pb-16">
        <div className="max-w-[1120px] mx-auto">
          <RevealOnScroll>
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Download size={24} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {t('studienplaner.printTitle')}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t('studienplaner.printDesc')}
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="max-w-[900px] mx-auto">
          <RevealOnScroll>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-10 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                {t('studienplaner.ctaTitle')}
              </h2>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                {t('studienplaner.ctaDesc')}
              </p>
              <a
                href="mailto:wirtschaft@oeh.jku.at"
                data-testid="studienplaner-contact-btn"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 px-6 py-3 rounded-full transition-all"
              >
                {t('studienplaner.ctaBtn')} <ArrowRight size={15} />
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </motion.div>
  );
}
