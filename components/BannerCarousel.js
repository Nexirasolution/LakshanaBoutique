'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Design tokens: shared with Navbar / CouponMarquee for a consistent system
const COFFEE = '#3E2B22';
const LIGHT_PEACH = '#F6DDC0';
const HAIRLINE = '#EDE6DE';
const PAPER = '#FFFFFF';

export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);
  // Only slides that are current or upcoming get their image requested.
  const [seen, setSeen] = useState(() => new Set([0]));

  const count = banners?.length || 0;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(t);
  }, [count]);

  useEffect(() => {
    if (!count) return;
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(index);
      next.add((index + 1) % count); // preload the upcoming slide
      return next;
    });
  }, [index, count]);

  if (!count) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: PAPER }}>
      {/*
        One desktop-size image is used on every screen.
        The box keeps the same wide ratio as the recommended upload (12:5 = 2.4:1),
        so it scales down proportionally on mobile and the FULL image stays visible.
        - Mobile: object-contain  -> never crops, whole banner is shown
        - Desktop (sm+): object-cover -> fills the box edge to edge
        Fixed aspect ratio = no layout shift while images load.
      */}
      <div className="relative w-full aspect-[12/5]">
        {banners.map((b, i) => {
          const isActive = i === index;
          const isFirst = i === 0;
          const shouldLoad = isActive || seen.has(i);

          return (
            <Link
              key={b._id}
              href={b.link || '#'}
              className={`absolute inset-0 block transition-opacity duration-700 ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${!b.link ? 'pointer-events-none' : ''}`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
            >
              {shouldLoad && (
                <img
                  src={b.image}
                  alt={b.title || 'Banner'}
                  // First slide is the LCP element: load it first. Others are lazy.
                  loading={isFirst ? 'eager' : 'lazy'}
                  fetchPriority={isFirst ? 'high' : 'auto'}
                  decoding={isFirst ? 'sync' : 'async'}
                  className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
                />
              )}
            </Link>
          );
        })}

        {count > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              className="absolute left-1.5 sm:left-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10"
              style={{ background: PAPER, color: COFFEE, border: `1px solid ${HAIRLINE}` }}
              aria-label="Previous"
            >
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              className="absolute right-1.5 sm:right-5 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full transition z-10"
              style={{ background: PAPER, color: COFFEE, border: `1px solid ${HAIRLINE}` }}
              aria-label="Next"
            >
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>

            {/* Thin dash indicators */}
            <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    height: '3px',
                    width: i === index ? '22px' : '10px',
                    background: i === index ? LIGHT_PEACH : 'rgba(255,255,255,0.7)',
                    boxShadow: i === index ? `0 0 0 1px ${COFFEE}20` : '0 0 0 1px rgba(62,43,34,0.15)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}