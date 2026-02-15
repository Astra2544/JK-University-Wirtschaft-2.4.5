/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CONTACT PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RevealOnScroll } from '../components/Animations';
import { 
  Mail, MapPin, Clock, Send, CheckCircle, AlertCircle,
  Instagram, Linkedin, ExternalLink, MessageCircle, Calendar,
  ArrowUpRight, Building, ChevronDown, HelpCircle
} from 'lucide-react';
import Marquee from '../components/Marquee';

const pv = { 
  initial: { opacity: 0 }, 
  animate: { opacity: 1, transition: { duration: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } } 
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// ─── KALENDER-IMPORT LINKS ─────────────────────────────────────────────────
const calLinks = [
  { name: 'Apple', url: 'https://calget.com/c/sxkur0db/subscribe?c=apple' },
  { name: 'Google', url: 'https://calget.com/c/sxkur0db/subscribe?c=google' },
  { name: 'Outlook', url: 'https://calget.com/c/sxkur0db/subscribe?c=outlook' },
  { name: 'Yahoo', url: 'https://calget.com/c/sxkur0db#' },
  { name: 'Office365', url: 'https://calget.com/c/sxkur0db/subscribe?c=office365' },
];

// ─── FAQ DATEN ─────────────────────────────────────────────────────────────
const faq = [
  { q: 'Welchen Taschenrechner brauche ich?', a: 'Für dein Studium reicht ein einfacher, wissenschaftlicher Taschenrechner (kein programmierbarer Grafikrechner). Viele Studierende verwenden z.\u00A0B. den Texas Instruments TI-30Xa. Wichtig ist, dass der Taschenrechner nicht programmierbar ist \u2013 in Prüfungen sind meist nur solche Modelle als Hilfsmittel erlaubt. Modelle wie der TI-30Xa oder vergleichbare von Casio (z.\u00A0B. fx-82-Serie) erfüllen die Anforderungen problemlos. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Wie borge ich ein Buch aus?', a: 'Als JKU-Studierender kannst du ganz einfach Bücher in der Universitätsbibliothek ausleihen. Deine JKU Card (Studierendenausweis) ist zugleich deine Bibliothekskarte. Du suchst dir das Buch im Regal (oder im Online-Katalog \u201ELISSS\u201C) und nimmst es heraus. Dann gehst du entweder zur Leihstelle (Schalter) oder nutzt die Selbstverbuchungsgeräte (Self-Check) vor Ort, um das Buch mit deiner Karte auszuborgen. Die Standard-Leihfrist beträgt 1 Monat und du kannst als Studierender bis zu 25 Bücher gleichzeitig entlehnen. Verlängern oder Vormerken von Büchern geht online über dein Bibliothekskonto. (Tipp: Zeitschriften und Zeitungen kann man nur vor Ort lesen, nicht ausborgen.) (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Wo bekomme ich Uni-Bücher zum Kaufen?', a: 'Die erste Adresse für den Kauf von Lehrbüchern und Skripten ist der ÖH JKU Shop am Campus. Dort bekommst du Studienliteratur oft vergünstigt \u2013 viele Bücher gibt\u2019s für Studierende mit etwa 20\u00A0% Rabatt. Der ÖH-Shop hat meist alle gängigen Skripten und Lehrbücher für deine Kurse lagernd oder kann sie bestellen. Alternativ kannst du natürlich auch in regulären Buchhandlungen oder online schauen, aber im ÖH-Shop sparst du Geld und unterstützt die Studierendenvertretung. (Infos zum Shop findest du auf oeh-jku-shop.myshopify.com) (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Wo kann ich meine alten Bücher verkaufen?', a: 'Dafür gibt es an der JKU die ÖH Bücherbörse. Dort kannst du gebrauchte Studienbücher, Skripten etc. von der ÖH für dich verkaufen lassen. Du bringst dein Buch einfach zur Bücherbörse (neben dem ÖH-Shop am Campus) und legst einen Preis fest \u2013 die ÖH bietet es dann vor Ort und online zum Verkauf an. Sobald ein:e Käufer:in dein Buch gekauft hat, wirst du benachrichtigt und bekommst den Verkaufserlös ausgezahlt. Genauso kannst du selbst günstig gebrauchte Bücher kaufen: Schau einfach in der Bücherbörse vorbei oder online in deren Verzeichnis. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Kann ich meine Bachelorarbeit überall schreiben? Was ist zu beachten?', a: 'Deine Bachelorarbeit kannst du themenmäßig nicht völlig frei und \u201Eüberall\u201C schreiben, sondern sie muss im Rahmen einer Lehrveranstaltung deines Studiums erfolgen. In der Praxis heißt das: Im Curriculum ist vorgesehen, in welchem Seminar oder bei welcher Betreuung du die Arbeit verfasst. Du meldest dich also für die entsprechende LV an und sprichst mit der Betreuerin/dem Betreuer ein Thema ab. Örtlich bist du aber nicht gebunden \u2013 du kannst natürlich zu Hause, in der Bibliothek oder auch extern (z.\u00A0B. in Kooperation mit einer Firma) schreiben. Wichtig ist, dass du die formalen Schritte beachtest: Das Thema muss offiziell beim Prüfungsservice angemeldet werden (mit Formular und Unterschrift deines Betreuers), und du musst während der Bearbeitung als Student:in inskribiert sein. Fazit: Grundsätzlich kannst du deine Bachelorarbeit überall schreiben, solange eine JKU-Betreuung dahintersteht und die Regeln der guten wissenschaftlichen Praxis eingehalten werden. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Prüfungsantritte: Was zählt?', a: 'Du hast für jede Prüfung an der Uni mehrere Versuche, allerdings sind diese begrenzt. Generell sind maximal 5 Antritte pro Prüfung zulässig (das heißt vier Wiederholungen) \u2013 bei STEOP-Prüfungen sogar nur 4 Antritte. Nur Prüfungen, zu denen du auch wirklich antrittst, zählen als Verbrauch eines Versuchs. Meldest du dich rechtzeitig ab oder erscheinst nicht, ist das kein offizieller Antritt (du wirst aber bei Nicht-Abmeldung für den nächsten Termin gesperrt). Jeder negative Antritt (Nicht Genügend) zählt als verbrauchter Versuch. Bei positiver Note brauchst du nicht nochmal anzutreten \u2013 du kannst aber innerhalb von 12 Monaten freiwillig einmal zur Notenverbesserung nochmals antreten (in dem Fall wird die neue Note gezählt, selbst wenn sie schlechter ausfällt). Beachte: Wenn du die maximale Anzahl an Antritten ausgeschöpft hast und die Prüfung endgültig nicht bestanden ist, darfst du dieses Studium nicht weiterführen. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Was ist die Studienbeihilfe? Habe ich Anspruch darauf?', a: 'Die Studienbeihilfe ist eine staatliche Unterstützung für Studierende, die finanziell Unterstützung brauchen. Ob du Anspruch hast, hängt von mehreren Kriterien ab: Staatsbürgerschaft (Österreicher:innen und Gleichgestellte), soziale Bedürftigkeit (Einkommen der Eltern, Familiengröße etc.) und ein \u201Egünstiger Studienerfolg\u201C (du musst nach den ersten zwei Semestern eine gewisse Zahl an ECTS nachweisen). Außerdem musst du dein Studium rechtzeitig begonnen haben (in der Regel vor dem 33. Geburtstag; für Selbsterhalter:innen und Studierende mit Kind gibt\u2019s Ausnahmen bis 38). Du darfst noch keinen gleichwertigen Abschluss haben und musst im vorgeschriebenen Zeitrahmen studieren (Mindeststudienzeit + Toleranzsemester). Antragsstellung: Du musst die Studienbeihilfe jedes Jahr beantragen (online auf stipendium.at oder per Formular). Die Fristen sind jedes Semester von 20. September bis 15. Dezember bzw. 20. Februar bis 15. Mai. Wenn du Fragen hast oder Hilfe beim Antrag brauchst, kannst du dich auch an die ÖH-Sozialberatung wenden. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Was sind freie Studienleistungen?', a: '\u201EFreie Studienleistungen\u201C sind frei wählbare Lehrveranstaltungen in deinem Studium. Im Curriculum ist meist eine gewisse ECTS-Anzahl dafür vorgesehen, die du nach deinen eigenen Interessen füllen kannst. Das Tolle: Nach Abschluss der STEOP kannst du dafür aus dem gesamten LV-Angebot der Uni wählen \u2013 also auch Kurse aus anderen Studienrichtungen, Fremdsprachenkurse, etc., sofern du die eventuellen Voraussetzungen erfüllst. Diese freien Wahlfächer dienen dazu, über den Tellerrand deines eigentlichen Studiums hinaus zusätzliche Kenntnisse zu erwerben. Sie zählen ganz normal zu deinem Studienabschluss dazu und ermöglichen es dir, dein Studium individueller zu gestalten. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Was sind USI-Kurse?', a: 'USI-Kurse sind die Sportkurse des Universitätssportinstituts (USI). Das USI bietet jedes Semester ein breites Sport- und Bewegungsprogramm mit über 200 Kursen an \u2013 von Aerobic und Yoga über Ballsportarten bis Klettern und mehr. Mitmachen können alle Studierenden; die Kurse kosten nur einen geringen Beitrag. Die Anmeldung läuft online über usi.jku.at, dort findest du das Kursprogramm. USI-Kurse sind eine tolle Gelegenheit, Ausgleich zum Studienalltag zu schaffen und neue Sportarten auszuprobieren. Außerdem gibt es an der JKU ein eigenes Fitnessstudio (im Kepler Hall). (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Wie funktioniert ein Auslandssemester?', a: 'Ein Auslandssemester planst du am besten über die Austauschprogramme der JKU. Die JKU hat rund 200 Partneruniversitäten weltweit für Studierendenaustausch. Typischerweise bewirbst du dich ein Jahr im Voraus beim Auslandsbüro der JKU für ein Programm wie Erasmus+ (in Europa) oder andere Austauschprogramme. Voraussetzungen sind u.\u00A0a., dass du an der JKU ordentlich inskribiert bist und schon genug studiert hast \u2013 mindestens 2 Semester und die STEOP abgeschlossen (ca. 40 ECTS), bevor du ins Ausland gehst. Ein Auslandsstudium dauert in der Regel ein Semester (bis maximal ein Jahr). Während des Auslandssemesters zahlst du keine Studiengebühren an der Gastuni, musst aber weiterhin an der JKU gemeldet sein. Oft bekommst du auch ein Stipendium bzw. Zuschüsse (z.\u00A0B. Erasmus-Stipendium). Wichtig ist, vorab ein Learning Agreement zu machen, damit dir die im Ausland absolvierten Kurse daheim an der JKU anerkannt werden. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Gibt es eine kostenfreie Lizenz für Microsoft 365?', a: 'Ja! Als JKU-Studierende:r bekommst du Microsoft Office 365 gratis. Die Uni stellt in Zusammenarbeit mit der ÖH allen Studierenden das Office-Paket kostenlos zur Verfügung \u2013 das umfasst Word, Excel, PowerPoint, OneNote, Outlook etc. Du kannst die Software auf bis zu 5 Geräten gleichzeitig installieren (PC, Laptop, Tablets, Smartphones) \u2013 Updates inklusive. Dazu gehört auch 1\u00A0TB Cloud-Speicher via OneDrive. Um die Gratis-Lizenz zu bekommen, musst du dich einmalig im JKU Moodle für den entsprechenden Office-365-Kurs registrieren; dort findest du genaue Anleitungen. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Gibt es eine kostenfreie Lizenz für Zoom?', a: 'Ja, die JKU stellt auch für Zoom (durch Initiative der ÖH eingeführt) eine Campuslizenz bereit. Als Student:in kannst du dich unter jku.zoom.us mit deinem JKU/KUSSS-Login anmelden und damit einen vollwertigen Zoom-Account nutzen. Damit entfallen die Begrenzungen der kostenlosen Basisversion (z.\u00A0B. Meetings ohne 40-Minuten-Limit). Dieses Angebot ist besonders praktisch, wenn du z.\u00A0B. für deine Bachelorarbeit Interviews über Zoom führen möchtest. Verwende zum Login immer den JKU-Login über das Zoom-Portal der Uni. (Zuletzt aktualisiert: 07.2025)' },
  { q: 'Wie komme ich am besten in die Universität? Wo kann ich parken?', a: 'Am JKU Campus gibt es mehrere Parkmöglichkeiten \u2013 unter anderem ein Parkhaus und eine Tiefgarage unter dem Science Park mit insgesamt rund 1.700 Stellplätzen. Als Student:in kannst du dort zu vergünstigten Tarifen parken. Allerdings sind die Parkplätze zu Studienzeiten oft sehr ausgelastet und das innere Campusgebiet ist autofrei. Daher empfiehlt die Uni, lieber öffentliche Verkehrsmittel zu nutzen. Am bequemsten erreichst du den Campus mit der Straßenbahnlinie 1 oder 2: beide fahren von Linz Innenstadt/Hauptbahnhof direkt bis zur Haltestelle \u201EUniversität\u201C (Fahrzeit ca. 25 Minuten). Zudem verbinden Buslinien die Uni mit verschiedenen Stadtteilen. Für umweltfreundliche Anreise gibt es auch gute Fahrradwege und viele Fahrradständer am Campus. Weitere Infos: jku.at/campus/der-jku-campus/anfahrt/. (Zuletzt aktualisiert: 07.2025)' },
];

// FAQ Akkordeon Komponente
function FaqAcc({ q, a, testId }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={testId} className="border-b border-slate-100 last:border-b-0">
      <button onClick={() => setOpen(!open)} data-testid={`${testId}-toggle`} className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-[15px] font-medium text-slate-800 pr-4 group-hover:text-blue-500 transition-colors">{q}</span>
        <ChevronDown className={`text-slate-300 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} size={16}/>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <div className="pb-5"><p className="text-sm text-slate-500 leading-relaxed">{a}</p></div>
      </motion.div>
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bereich: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Nachricht erfolgreich gesendet! Wir melden uns bald bei dir.' });
        setFormData({ name: '', email: '', bereich: '', subject: '', message: '' });
      } else {
        throw new Error(data.detail || 'Fehler beim Senden');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Wir sind für dich da</p>
            </div>
            <h1 data-testid="contact-page-title" className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Kontakt
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Du hast Fragen, Anregungen oder brauchst Hilfe? Wir freuen uns von dir zu hören!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-5">
        <div className="max-w-[1120px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            
            {/* Contact Form */}
            <RevealOnScroll className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 h-full">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Schreib uns</h2>
                <p className="text-sm text-slate-500 mb-6">Fülle das Formular aus und wir melden uns so schnell wie möglich bei dir.</p>
                
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-4 rounded-xl mb-6 ${
                      status.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {status.message}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        data-testid="contact-name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Dein Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-Mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="contact-email"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="deine@email.at"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bereich <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="bereich"
                          value={formData.bereich}
                          onChange={handleChange}
                          required
                          data-testid="contact-bereich"
                          className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                            formData.bereich ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          <option value="" disabled>Bereich auswahlen</option>
                          <option value="Allgemein">Allgemein</option>
                          <option value="Studium">Studium</option>
                          <option value="Events">Events</option>
                          <option value="Internationals">Internationals</option>
                          <option value="Medien">Medien</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Mitmachen">Mitmachen</option>
                          <option value="Sonstiges">Sonstiges</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Betreff</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        data-testid="contact-subject"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Worum geht es?"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nachricht <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      data-testid="contact-message"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Deine Nachricht an uns..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={sending}
                    data-testid="contact-submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    {sending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Senden...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Nachricht senden
                      </>
                    )}
                  </button>
                </form>
              </div>
            </RevealOnScroll>

            {/* Contact Info Sidebar */}
            <RevealOnScroll delay={0.1} className="lg:col-span-2">
              <div className="space-y-4">
                
                {/* Quick Contact */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-4">Direkter Kontakt</h3>
                  <div className="space-y-3">
                    <a href="mailto:wirtschaft@oeh.jku.at" className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
                      <Mail size={18} />
                      <span className="text-sm">wirtschaft@oeh.jku.at</span>
                    </a>
                    <div className="flex items-center gap-3 text-blue-100">
                      <MapPin size={18} />
                      <span className="text-sm">Keplergebäude, JKU Linz</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-white/20">
                    <p className="text-xs text-blue-200 uppercase tracking-wider mb-3">Social Media</p>
                    <div className="flex gap-3">
                      <a href="https://www.instagram.com/oeh_wirtschaft_wipaed/" target="_blank" rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Instagram size={18} />
                      </a>
                      <a href="http://linkedin.com/company/wirtschaft-wipaed" target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* ÖH JKU Link */}
                <a href="https://oeh.jku.at" target="_blank" rel="noopener noreferrer" 
                  className="block bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Building size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">ÖH JKU</p>
                        <p className="text-xs text-slate-400">Hauptvertretung</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </a>

              </div>
            </RevealOnScroll>
          </div>

          {/* Sprechstunden Section */}
          <RevealOnScroll>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Clock size={24} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sprechstunden</h2>
                  <p className="text-sm text-slate-500">Persönliche Beratung vor Ort oder online</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
                    Über den folgenden Button kannst du dir ganz bequem einen Termin für eine Sprechstunde buchen – 
                    egal ob vor Ort oder online via Zoom. Eine Buchung ist bis spätestens 24 Stunden vor dem 
                    gewünschten Termin möglich.
                  </p>
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
                    Die Beratung ist natürlich <strong className="text-slate-800">kostenlos</strong>, da wir alle 
                    ehrenamtlich für dich im Einsatz sind.
                  </p>
                  <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-5">
                    <p className="text-sm text-gold-700 font-medium flex items-center gap-2">
                      <AlertCircle size={16} />
                      In der vorlesungsfreien Zeit finden keine Sprechstunden statt!
                    </p>
                  </div>
                  <a 
                    href="https://zeeg.me/wirtschaft" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="sprechstunde-btn"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <Calendar size={16} /> Sprechstunde buchen <ArrowUpRight size={14} />
                  </a>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageCircle size={18} className="text-blue-500" />
                    Was wir für dich tun können
                  </h4>
                  <ul className="space-y-2.5">
                    {[
                      'Fragen zu Prüfungen & Anmeldungen',
                      'Studienplanung & Kurswahl',
                      'Probleme mit Professor:innen',
                      'Anrechnungen & Wechsel',
                      'Stipendien & Förderungen',
                      'Allgemeine Studienberatung'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* WhatsApp Community */}
          <RevealOnScroll delay={0.05}>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <MessageCircle size={24} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">WhatsApp-Community</h2>
                  <p className="text-sm text-slate-500">Vernetze dich mit anderen Studierenden</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-3">
                    Um dich im Studium bestmöglich zu unterstützen und den Austausch unter Studierenden zu 
                    erleichtern, betreiben wir als deine Vertretung eine WhatsApp-Community für alle 
                    wirtschaftswissenschaftlichen Studiengänge an der JKU.
                  </p>
                  <p className="text-[15px] text-slate-600 leading-relaxed">
                    In den jeweiligen Studiengruppen kannst du dich mit Kolleg:innen aus deinem Studium 
                    vernetzen, Fragen stellen, Informationen austauschen und erhältst wichtige Hinweise 
                    rund um dein Studium, Prüfungen, Services und Veranstaltungen.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Beitritt zur Community</p>
                    <p className="text-xs text-slate-500">
                      Schreib eine kurze Nachricht an wirtschaft@oeh.jku.at und sende deine 
                      Inskriptionsbestätigung mit. Nach der Prüfung erhältst du den Einladungslink.
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Hinweis für Erstsemestrige</p>
                    <p className="text-xs text-slate-500">
                      Studierende im ersten Semester erhalten den Einladungslink per E-Mail vor Semesterbeginn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Kalender Import */}
          <RevealOnScroll delay={0.1}>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
                  <Calendar size={24} className="text-gold-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kalender abonnieren</h2>
                  <p className="text-sm text-slate-500">Events direkt in deinen Kalender</p>
                </div>
              </div>
              
              <p className="text-[15px] text-slate-600 leading-relaxed mb-4">
                Mit dem Kalender der ÖH Wirtschaft kannst du Veranstaltungen der ÖH und Partner an der JKU 
                direkt in deinen eigenen Kalender übernehmen. Von Workshops und Info-Veranstaltungen bis hin 
                zu Partys – alle Events werden automatisch synchronisiert. So behältst du jederzeit den 
                Überblick und verpasst keine für dich relevanten Veranstaltungen an der JKU!
              </p>
              
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Kalender importieren</p>
              <div className="flex flex-wrap gap-2">
                {calLinks.map(l => (
                  <a 
                    key={l.name} 
                    href={l.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    data-testid={`calendar-${l.name.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors"
                  >
                    {l.name} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <Marquee
            items={['Wir hören zu', 'Kein Problem zu klein', 'Immer für dich da', 'Deine Fragen, unsere Antworten', 'Zusammen finden wir eine Lösung']}
            variant="subtle"
            speed={34}
            className="rounded-2xl mb-6"
          />

          {/* FAQ Section */}
          <RevealOnScroll delay={0.15}>
            <div data-testid="faq-section" className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <HelpCircle size={24} className="text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Häufig gestellte Fragen</h2>
                  <p className="text-sm text-slate-500">Antworten auf die wichtigsten Fragen</p>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {faq.map((item, i) => <FaqAcc key={i} q={item.q} a={item.a} testId={`faq-${i}`}/>)}
              </div>
            </div>
          </RevealOnScroll>

        </div>
      </section>
    </motion.div>
  );
}
