"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Land a section this far below the viewport top (px) so the floating
 *  pill header (≈72px tall including its top margin) never covers the
 *  section's eyebrow. */
const HEADER_OFFSET = 84;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Global smooth scrolling (Lenis) with GSAP ScrollTrigger kept in sync:
 * every Lenis scroll event nudges ScrollTrigger.update(), which is the
 * documented integration when Lenis runs on its own rAF loop. Pinned
 * ScrollTriggers (e.g. the hero) rely on this to stay frame-accurate.
 *
 * This component also owns the site's anchor + scroll-position policy:
 *
 *  - ANCHORS GLIDE (fix: nav clicks used to jump like plain
 *    hyperlinks). Every in-page anchor — header nav, hero buttons,
 *    the logo, "Scroll to explore" — is intercepted and Lenis animates
 *    to the target. The target's LIVE document position is measured
 *    at click time, so the pinned hero's pin-spacing is accounted for
 *    rather than hardcoded; the URL hash is updated via pushState
 *    (no native jump). User wheel/touch interrupts the glide (Lenis
 *    default — a programmatic scroll is never locked), and
 *    prefers-reduced-motion gets an instant jump.
 *
 *  - RELOADS START AT THE TOP. history.scrollRestoration is 'manual'
 *    (set even earlier by the inline script in the layout, so the
 *    browser can't flash a restored position) and a reload is forced
 *    back to the hero — a mid-page reload re-opens on the hero, not
 *    where the visitor left off. A FRESH visit carrying a #hash is
 *    the one exception: after load + ScrollTrigger.refresh() it
 *    walks to that section. Back/forward (popstate) walks to the
 *    hash the URL now carries, or to the top when it carries none.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = nav?.type === "reload";
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reload or hash-less visit: the hero top, never mid-page. Done
    // BEFORE Lenis starts so its very first sync reads scroll = 0.
    if (isReload || !window.location.hash) window.scrollTo(0, 0);

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    if (isReload || !window.location.hash) {
      lenis.scrollTo(0, { immediate: true });
    }

    const goTo = (target: HTMLElement | number) => {
      // Measure the target's true document position LIVE, at click
      // time — rect + current scroll inherently includes the pinned
      // hero's pin-spacing, so nothing is hardcoded. (Handing Lenis
      // the element instead landed a header-offset short twice over;
      // a plain number target is exact.) Lenis then animates the
      // native scroll to it.
      const y =
        typeof target === "number"
          ? target
          : target.getBoundingClientRect().top +
            window.scrollY -
            HEADER_OFFSET;
      lenis.scrollTo(Math.max(0, y), {
        duration: reduced ? 0 : 1.05,
        immediate: reduced,
        easing: easeInOutCubic,
      });
    };

    /** '#home' is the hero itself — always go to the absolute top
     *  (measuring the hero mid-pin would read its pinned rect). */
    const targetFor = (hash: string): HTMLElement | number | null => {
      if (hash === "#home" || hash === "#") return 0;
      try {
        return document.querySelector<HTMLElement>(hash);
      } catch {
        return null;
      }
    };

    // Anchor clicks: glide instead of the native hyperlink jump.
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = targetFor(hash);
      if (target === null) return; // unknown anchor — browser's job
      e.preventDefault();
      history.pushState(null, "", hash);
      goTo(target);
    };
    document.addEventListener("click", onClick);

    // Back/forward: with manual restoration the browser leaves the
    // scroll position alone, so walk to wherever the URL points.
    const onPopState = () => {
      const hash = window.location.hash;
      if (!hash) return goTo(0);
      const target = targetFor(hash);
      if (target !== null) goTo(target);
    };
    window.addEventListener("popstate", onPopState);

    // Pins measure layout — refresh once everything (fonts/images)
    // settles. A reload is pinned back to the top as the final word.
    // A fresh visit with a #hash lands on its section — but the
    // landing must WAIT OUT the pin: ScrollTrigger inserts the hero's
    // pin-spacer in its own post-load refresh, shifting every section
    // below it by the spacer's height. Measuring earlier is a trap —
    // the browser's fragment jump and an early measurement can agree
    // on the PRE-spacer position (the section's rect reads "already
    // there") and the page then freezes a full spacer short of the
    // real section. So the landing polls the target's document
    // position until it is stable across two checks, glides, and
    // re-corrects if it shifts again; any scroll intent cancels it.
    let hashTimer = 0;
    let cancelHashLand: (() => void) | null = null;

    const landOnHash = () => {
      let attempts = 0;
      let lastDocPos = -1;
      let lastY = -1;
      let issued = false;
      const cancel = () => {
        window.clearInterval(hashTimer);
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
        window.removeEventListener("keydown", cancel);
      };
      cancelHashLand = cancel;
      window.addEventListener("wheel", cancel, { passive: true });
      window.addEventListener("touchstart", cancel, { passive: true });
      window.addEventListener("keydown", cancel);
      hashTimer = window.setInterval(() => {
        if (attempts++ > 16) return cancel();
        const target = targetFor(window.location.hash);
        if (target === null) return cancel();
        if (typeof target === "number") {
          goTo(target);
          return cancel();
        }
        const docPos = target.getBoundingClientRect().top + window.scrollY;
        const stable = Math.abs(docPos - lastDocPos) < 1;
        lastDocPos = docPos;
        if (!stable) return;
        const desired = Math.max(0, docPos - HEADER_OFFSET);
        if (Math.abs(window.scrollY - desired) <= 4) return cancel();
        if (!issued) {
          // First move: the full glide.
          lenis.scrollTo(desired, {
            duration: reduced ? 0 : 1.05,
            immediate: reduced,
            easing: easeInOutCubic,
          });
          issued = true;
          lastY = window.scrollY;
          return;
        }
        // Later checks: while the glide is visibly flowing, leave it
        // alone; only a STUCK scroll (layout shifted under it, or it
        // never started) gets an immediate correction.
        if (Math.abs(window.scrollY - lastY) > 1) {
          lastY = window.scrollY;
          return;
        }
        lenis.scrollTo(desired, { immediate: true });
        return cancel();
      }, 250);
    };

    const onLoad = () => {
      ScrollTrigger.refresh();
      if (isReload) {
        lenis.scrollTo(0, { immediate: true });
      } else if (window.location.hash) {
        landOnHash();
      }
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("load", onLoad);
      window.clearInterval(hashTimer);
      cancelHashLand?.();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
