"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SectionScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  blurStrength = 5,
  startTrigger = 'top bottom-=10%',
  endTrigger = 'top center',
  className = ''
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    // Animate opacity
    gsap.fromTo(
      el,
      { opacity: baseOpacity, willChange: 'opacity, filter' },
      {
        ease: 'none',
        opacity: 1,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: startTrigger,
          end: endTrigger,
          scrub: true
        }
      }
    );

    // Animate blur
    if (enableBlur) {
      gsap.fromTo(
        el,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: 'none',
          filter: 'blur(0px)',
          scrollTrigger: {
            trigger: el,
            scroller,
            start: startTrigger,
            end: endTrigger,
            scrub: true
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollContainerRef, enableBlur, baseOpacity, blurStrength, startTrigger, endTrigger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default SectionScrollReveal;