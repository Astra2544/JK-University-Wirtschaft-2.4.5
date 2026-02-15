/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IMAGE SLIDER | Automatische Diashow mit Swiper + Thumbnail Grid
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Slider Bilder mit individueller Positionierung für perfekte Zentrierung
const sliderImages = [
  { 
    src: '/images/background/slide-1.jpg', 
    alt: 'Team Bild 1',
    // 2 Personen mit Daumen hoch - etwas höher zentrieren
    position: 'custom',
    customPosition: '50% 25%'
  },
  { 
    src: '/images/background/slide-2.jpg', 
    alt: 'Team Bild 2',
    // 3 Personen sitzend auf Couch - braucht top-Zentrierung für Köpfe
    position: 'top'
  },
  { 
    src: '/images/background/slide-3.jpg', 
    alt: 'Team Bild 3',
    // 2 Personen am Tisch sitzend - center ist OK
    position: 'center'
  },
  { 
    src: '/images/background/slide-4.jpg', 
    alt: 'Team Bild 4',
    // 2 Personen stehend am Wasser - braucht top für Köpfe
    position: 'top'
  },
  { 
    src: '/images/background/slide-5.jpg', 
    alt: 'Team Bild 5',
    // 3 Personen sitzend auf Bank - center ist OK
    position: 'center'
  },
];

// Thumbnail Bilder (Grid unten) - andere Bilder als Slider
const thumbnailImages = [
  { src: '/images/background/bg-1.jpg', alt: 'Campus 1' },
  { src: '/images/background/bg-2.jpg', alt: 'Campus 2' },
  { src: '/images/background/bg-3.jpg', alt: 'Campus 3' },
  { src: '/images/background/bg-4.jpg', alt: 'Campus 4' },
  { src: '/images/background/bg-5.jpg', alt: 'Campus 5' },
];

export default function ImageSlider() {
  return (
    <div data-testid="image-slider" className="w-full">
      {/* Hauptslider - kompakter */}
      <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-2 sm:mb-3">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          loop={true}
          className="w-full"
        >
          {sliderImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full h-full object-cover ${
                    image.position === 'top' ? 'object-top' : 
                    image.position === 'custom' ? '' : 'object-center'
                  }`}
                  style={image.customPosition ? { objectPosition: image.customPosition } : {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom Pagination Styles */}
        <style>{`
          .swiper-pagination-bullet {
            background: white;
            opacity: 0.6;
            width: 6px;
            height: 6px;
            transition: all 0.3s ease;
          }
          .swiper-pagination-bullet-active {
            opacity: 1;
            background: #3b82f6;
            width: 18px;
            border-radius: 3px;
          }
        `}</style>
      </div>
      
      {/* Thumbnail Grid - 5 kleine Bilder */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {thumbnailImages.map((image, index) => (
          <div 
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
