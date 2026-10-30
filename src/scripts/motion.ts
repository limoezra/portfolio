// Scroll and reveal motion shared by all sections.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

export { gsap, ScrollTrigger };
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $$ = (sel: string, root: ParentNode = document) => [...root.querySelectorAll<HTMLElement>(sel)];
const GLYPHS = '░▒▓█▚▞01';
let started = false;

export function initMotion() {
  if (started) return;
  started = true;
  if (reduced) return;

  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -60 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  intro();
  scramble();
  reveals();
  counters();
  drops();
}

/** Decode `el`'s text from noise. */
function decode(el: HTMLElement, duration = 1.1) {
  const text = el.textContent?.trim() ?? '';
  el.setAttribute('aria-label', text);
  return gsap.to(el, { duration, ease: 'none', scrambleText: { text, chars: GLYPHS, revealDelay: 0.15, speed: 0.5 } });
}

function intro() {
  const name = document.querySelector<HTMLElement>('[data-intro-name]');
  if (name) {
    name.style.visibility = 'visible';
    decode(name, 1.5);
  }
  gsap.fromTo(
    '[data-intro]',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.3 },
  );
}

function scramble() {
  $$('[data-scramble]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => decode(el) });
  });
}

function reveals() {
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  $$('[data-stagger]').forEach((el) => {
    gsap.from(el.children, {
      y: 32,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

function counters() {
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const v = { n: 0 };
    el.textContent = '0';
    gsap.to(v, {
      n: end,
      duration: 1.8,
      ease: 'power2.out',
      delay: 0.4,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => (el.textContent = String(Math.round(v.n))),
    });
  });
}

/** Experience markers fall like raindrops and splash. */
function drops() {
  $$('[data-drop]').forEach((el) => {
    gsap.from(el, {
      y: -90,
      opacity: 0,
      duration: 0.9,
      ease: 'bounce.out',
      scrollTrigger: { trigger: el.parentElement!, start: 'top 82%', once: true },
      onComplete: () => el.classList.add('splash'),
    });
  });
}
