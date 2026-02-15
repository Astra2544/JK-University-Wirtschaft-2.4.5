# ÖH Wirtschaft Website - Product Requirements Document

## Original Problem Statement
Die ÖH Wirtschaft Website benötigte mehrere Design-Updates und Feature-Erweiterungen:
1. Aktualisierung der Profilbilder auf der Team-Seite
2. Komplettes Design-Overhaul der Homepage mit neuen Bildern
3. Logo und Favicon Update auf "ÖH JKU Linz"
4. Responsive Design für Desktop und Mobile
5. Image-Slider/Diashow in der Galerie-Sektion

## User Personas
- Studierende der JKU Linz im Wirtschaftsbereich
- Interessierte an der Studienvertretung
- Potenzielle neue Teammitglieder

## Core Requirements
- ✅ Moderne, responsive Website
- ✅ Professionelle Team-Präsentation
- ✅ Einfache Navigation zu wichtigen Bereichen
- ✅ Dynamische Bildergalerie mit Diashow

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: FastAPI (minimal verwendet)
- **Routing**: react-router-dom
- **Animation**: framer-motion
- **Image Slider**: Swiper.js v11
- **Icons**: lucide-react

## What's Been Implemented

### Phase 1 - Team Page Updates (Completed)
- Profilbilder für 10 Teammitglieder aktualisiert
- Face-Detection für optimales Cropping verwendet
- Platzhalter-Bild für 9 fehlende Teammitglieder

### Phase 2 - Homepage Redesign (Completed)
- Hero-Sektion mit Bildcollage neu gestaltet
- "Über uns" Sektion mit neuen Landschaftsbildern
- Statistik-Bar unterhalb der Bilder
- Quick-Links zu allen Hauptbereichen
- Responsive für Desktop und Mobile
- Horizontales Scrollen auf Mobile behoben

### Phase 3 - Branding Update (Completed)
- Neues Logo und Favicon implementiert
- Navbar-Text auf "ÖH JKU Linz" geändert
- Logo-Größe erhöht

### Phase 4 - Image Slider/Diashow (Completed - 14.02.2026)
- Swiper.js v11 integriert
- ImageSlider-Komponente erstellt
- 5 Bilder im automatischen Slider (3 Sekunden Intervall)
- Fade-Effekt für sanfte Übergänge
- Pagination-Dots für manuelle Navigation
- Loop-Funktion für endloses Abspielen
- Responsive für alle Geräte

## File Structure
```
/app/frontend/
├── src/
│   ├── components/
│   │   ├── ImageSlider.js (NEU)
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Home.js
│   │   └── Team.js
│   └── App.js
├── public/
│   └── images/
│       ├── background/
│       │   ├── slide-1.jpg bis slide-5.jpg
│       │   ├── hero-*.jpg
│       │   ├── about-*.jpg
│       │   └── gallery-*.jpg
│       └── team/
│           └── *.png (Profilbilder)
```

## Prioritized Backlog

### P0 (Critical) - NONE
Alle kritischen Features sind implementiert.

### P1 (High Priority)
- Fehlende Profilbilder für 9 Teammitglieder (BLOCKED - wartet auf Bilder vom User)

### P2 (Medium Priority)
- Refactoring: Home.js in kleinere Komponenten aufteilen (Hero, AboutUs, Gallery)
- Performance-Optimierung der Bilder (WebP-Format)

### P3 (Low Priority)
- Dark Mode Support
- Weitere Animationen und Micro-Interactions

## Known Issues
- 9 Teammitglieder zeigen Platzhalter-Bild (wartet auf User-Input)

## Testing Status
- Frontend Testing: 100% bestanden
- Test Report: /app/test_reports/iteration_16.json
