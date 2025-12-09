"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function SplitTextAnimated({
  text,
  className = "",
  delay = 50,
  duration = 0.8,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 50, rotationX: -90 },
  to = { opacity: 1, y: 0, rotationX: 0 },
  tag: Tag = "p",
  textAlign = "center",
}) {
  const ref = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  // Manual split function to avoid premium GSAP plugin
  const splitText = (element, type) => {
    const content = element.textContent;
    element.innerHTML = "";

    if (type === "chars") {
      const chars = content.split("");
      return chars.map((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        element.appendChild(span);
        return span;
      });
    } else if (type === "words") {
      const words = content.split(" ");
      return words.map((word, i) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        element.appendChild(span);
        if (i < words.length - 1) {
          element.appendChild(document.createTextNode(" "));
        }
        return span;
      });
    } else {
      // lines
      const span = document.createElement("span");
      span.textContent = content;
      span.style.display = "inline-block";
      element.appendChild(span);
      return [span];
    }
  };

  useGSAP(() => {
    if (!ref.current || !fontsLoaded) return;

    const el = ref.current;

    // Clear previous content
    const targets = splitText(el, splitType);

    // Set initial state
    gsap.set(targets, from);

    // Animate in
    gsap.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        once: true,
      },
    });

    return () => {
      // Cleanup: restore original text
      el.textContent = text;
    };
  }, [fontsLoaded, text, delay, duration, ease, splitType]);

  return (
    <Tag
      ref={ref}
      className={`inline-block whitespace-normal ${className}`}
      style={{ textAlign }}
    >
      {text}
    </Tag>
  );
}