/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import {
  X, Zap, Shield, Target, Activity,
  ArrowUpRight, Hash, Terminal, Compass, ChevronRight, ChevronDown, Search
} from 'lucide-react';
import { cn } from './lib/utils';
import { Agent } from './types';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef    = useRef<HTMLDivElement>(null);
  const mousePos  = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.('(pointer: fine)') as MediaQueryList | undefined;
    const update = () => setEnabled(!!mql?.matches);
    update();
    if (!mql) return;
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
      setHovered(!!(e.target as HTMLElement).closest('button, a, [data-magnetic]'));
    };
    let raf: number;
    const animate = () => {
      cursorPos.current.x = lerp(cursorPos.current.x, mousePos.current.x, 0.12);
      cursorPos.current.y = lerp(cursorPos.current.y, mousePos.current.y, 0.12);
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${cursorPos.current.x - 16}px, ${cursorPos.current.y - 16}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 pointer-events-none z-[300] will-change-transform">
        <div className={cn("w-8 h-8 rounded-full border transition-all duration-300",
          hovered ? "scale-[2.5] border-val-blue opacity-100" : "scale-100 border-val-orange/60 opacity-60")} />
      </div>
      <div ref={dotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[301] will-change-transform" />
    </>
  );
};

// ─── HUD OVERLAY ──────────────────────────────────────────────────────────────
const HUDOverlay = () => {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] p-10 hidden lg:flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-1">
          <span className="hud-metadata flex items-center gap-2">
            <span className="w-1 h-1 bg-val-blue rounded-full animate-pulse inline-block" /> Sector_ID // 004A-NXS
          </span>
          <span className="hud-metadata text-val-blue/60">Node Status: Operational</span>
        </motion.div>
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-end gap-1">
          <span className="hud-metadata">34.0522° N, 118.2437° W</span>
          <span className="hud-metadata text-val-orange/60">{time}</span>
        </motion.div>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex gap-10 items-end">
          <div className="flex flex-col gap-2">
            <div className="flex gap-[3px] h-4 items-end">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} animate={{ height: ["30%","100%","50%"] }}
                  transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                  className="w-[2px] bg-val-blue/50" />
              ))}
            </div>
            <span className="hud-metadata text-[7px]">Latency_Flux</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-white/10 pl-6 ml-2">
            <span className="hud-metadata text-[7px] text-white/20">Uptime</span>
            <span className="hud-metadata text-val-blue/80">99.999%</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 items-center">
            <Hash size={8} className="text-val-blue" />
            <span className="hud-metadata">NXS_FRONTIER_v4</span>
          </div>
          <div className="w-28 h-px bg-white/10 relative overflow-hidden">
            <motion.div animate={{ x: ["-100%","100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-val-orange/70" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Nav = ({ activeSection }: { activeSection: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Frontier", href: "#hero",    id: "hero" },
    { label: "Archive",  href: "#agents",  id: "agents" },
    { label: "Network",  href: "#network", id: "network" },
    { label: "Codex",    href: "#codex",   id: "codex" },
  ];

  const scrollTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    // Update URL hash without triggering a jump
    window.history.pushState(null, '', href);
    const target = document.querySelector(href);
    if (target) gsap.to(window, { duration: 1.6, scrollTo: { y: target, offsetY: 0 }, ease: "power4.inOut" });
  };

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* ── Desktop nav pill ── */}
      <nav className="fixed top-5 sm:top-8 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-2xl">
        <div className="hud-container px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-white/20 backdrop-blur-3xl">
          {/* Logo */}
          <button onClick={(e) => scrollTo(e, "#hero")} className="flex items-center gap-2.5 group">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-val-blue/10 border border-val-blue group-hover:rotate-180 transition-transform duration-700" />
            <span className="font-display font-black text-base sm:text-lg tracking-tighter">NEXUS</span>
          </button>

          {/* Desktop links — hidden on mobile */}
          <div className="hidden md:flex gap-5 lg:gap-8 font-mono text-[8px] tracking-[0.4em] uppercase">
            {navLinks.map((link) => (
              <a key={link.id} href={link.href} onClick={(e) => scrollTo(e, link.href)}
                className="relative py-1 transition-colors hover:text-val-blue"
                style={{ color: activeSection === link.id ? 'var(--color-val-blue)' : 'rgba(255,255,255,0.4)' }}>
                {link.label}
                {activeSection === link.id && (
                  <motion.span layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-val-blue"
                    transition={{ type: "spring", stiffness: 400, damping: 40 }} />
                )}
              </a>
            ))}
          </div>

          {/* Right side: hamburger on mobile, terminal icon on desktop */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 group"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={cn("block h-px w-5 bg-white transition-all duration-300", menuOpen ? "rotate-45 translate-y-[7px]" : "")} />
            <span className={cn("block h-px w-5 bg-white transition-all duration-300", menuOpen ? "opacity-0" : "")} />
            <span className={cn("block h-px w-5 bg-white transition-all duration-300", menuOpen ? "-rotate-45 -translate-y-[7px]" : "")} />
          </button>
          <button className="hidden md:block opacity-30 hover:opacity-100 transition-opacity p-1">
            <Terminal size={13} />
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-2 md:hidden"
          >
            {/* Close hit-area at top */}
            <div className="absolute inset-x-0 top-0 h-24" onClick={() => setMenuOpen(false)} />

            <div className="flex flex-col items-center gap-1 w-full px-8">
              <span className="hud-metadata text-val-orange mb-8">// Navigation</span>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(
                    "w-full text-center py-5 border-b border-white/[0.06] font-display font-black text-3xl uppercase tracking-tighter transition-colors",
                    activeSection === link.id ? "text-val-blue" : "text-white/60 hover:text-white"
                  )}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-2">
              <span className="hud-metadata text-[7px] text-white/20">NEXUS // v4.0</span>
              <span className="hud-metadata text-[7px] text-val-blue/40">Sector Online</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── AGENT DOSSIER ─── close button FIXED at z-[260] outside the modal ────────
const AgentDossier = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* X button — lives OUTSIDE the modal card at z-[260] so nothing can block it */}
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[260] p-3 bg-white/10 border border-white/20 rounded-full hover:bg-val-orange hover:border-val-orange transition-all group backdrop-blur-xl"
      >
        <X size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <motion.div
        initial={{ scale: 0.93, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hud-container w-full max-w-6xl flex flex-col lg:flex-row relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full lg:w-1/2 p-10 md:p-14 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-white/5">
          <div>
            <span className="hud-metadata text-val-blue block mb-5">// Tactical Analysis // {agent.role?.displayName}</span>
            <h2 className="text-5xl md:text-7xl font-display font-black leading-none tracking-tighter uppercase mb-5">{agent.displayName}</h2>
            <p className="text-sm text-white/50 font-sans leading-relaxed max-w-md">{agent.description}</p>
          </div>
          <div>
            <span className="hud-metadata text-white/30 block mb-4">// Ability_Set</span>
            <div className="grid grid-cols-2 gap-3">
              {agent.abilities?.map((ability: any, i: number) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-val-blue/30 transition-colors group/ability">
                  <div className="flex items-center justify-between">
                    <span className="hud-metadata text-[7px] text-val-orange">Skill_0{i + 1}</span>
                    {ability.displayIcon && <img src={ability.displayIcon} className="w-6 h-6 opacity-50 group-hover/ability:opacity-100 transition-opacity" referrerPolicy="no-referrer" alt={ability.displayName} />}
                  </div>
                  <span className="font-display font-bold text-sm uppercase tracking-tight">{ability.displayName}</span>
                  {ability.description && <p className="text-white/30 text-[10px] font-sans leading-snug line-clamp-2">{ability.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-val-blue/5 to-val-orange/5 flex items-end justify-center overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
            <span className="text-[50vw] font-display font-black leading-none tracking-tighter uppercase">{agent.displayName[0]}</span>
          </div>
          <motion.img
            initial={{ scale: 0.85, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            src={agent.fullPortrait}
            className="relative z-10 h-full max-h-[600px] w-auto object-contain drop-shadow-[0_0_100px_rgba(0,245,255,0.15)]"
            referrerPolicy="no-referrer" alt={agent.displayName}
          />
          <div className="absolute bottom-6 left-6 flex flex-col gap-1">
            <span className="hud-metadata text-[8px] opacity-60">Holographic Rendering Active</span>
            <span className="hud-metadata text-[7px] text-val-blue animate-pulse">Scanning Neural Network...</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── AGENT NETWORK MODAL (Codex detail + Network-like UI) ────────────────
const AgentNetworkModal = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const summary =
    agent.description ||
    'Intel restricted. This agent profile is being hydrated from the Protocol index.';

  const roleName = agent.role?.displayName ?? 'Unknown Role';
  const abilities = agent.abilities ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[260] p-3 bg-white/10 border border-white/20 rounded-full hover:bg-val-red hover:border-val-red transition-all group backdrop-blur-xl"
        aria-label="Close"
        type="button"
      >
        <X size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="hud-container w-full max-w-6xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top: LIVE OPS + animated portrait */}
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/5">
            <span className="hud-metadata text-val-red block mb-4">
              // LIVE OPS // {roleName.toUpperCase()}
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black leading-none tracking-tighter uppercase mb-5">
              {agent.displayName}
            </h2>
            <p className="text-base sm:text-lg text-white/70 font-sans leading-relaxed max-w-xl">
              {summary}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-5">
              {[
                { label: 'Protocol Vector', val: roleName.toUpperCase(), color: 'text-val-red' },
                {
                  label: 'Loadout Signals',
                  val: `${Math.min(abilities.length, 4)} ACTIVE`,
                  color: 'text-val-red',
                },
                { label: 'Uplink Status', val: 'SYNC', color: 'text-val-red' },
                { label: 'Threat Window', val: 'LIVE', color: 'text-val-red' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-widest text-white/45 uppercase">
                    {item.label}
                  </span>
                  <span className={`font-display font-black text-lg tracking-tighter uppercase ${item.color}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-val-red/10 via-black/0 to-val-red/10 flex items-end justify-center overflow-hidden min-h-[320px] sm:min-h-[420px]">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.15 }}
              animate={{ opacity: 0.28 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'sine.inOut' }}
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,70,85,0.35) 0%, transparent 55%), radial-gradient(circle at 70% 75%, rgba(255,70,85,0.25) 0%, transparent 60%)',
              }}
            />
            <div className="absolute inset-x-[10%] bottom-0 h-[65%] rounded-full bg-val-red/20 blur-[90px] opacity-30" />

            <motion.img
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              src={agent.fullPortrait}
              referrerPolicy="no-referrer"
              alt={agent.displayName}
              className="relative z-10 w-full max-w-xs sm:max-w-sm h-auto object-contain drop-shadow-[0_0_60px_rgba(255,70,85,0.18)]"
              whileHover={{ scale: 1.04 }}
            />

            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
              <span className="hud-metadata text-[8px] text-val-red/80">UNIT // {agent.displayName.toUpperCase()}</span>
              <span className="hud-metadata text-[7px] text-white/30">{roleName}</span>
            </div>
            <div className="absolute bottom-7 left-6 z-20 flex flex-col gap-1">
              <span className="hud-metadata text-[8px] opacity-70">Neural Sync Active</span>
              <span className="hud-metadata text-[7px] text-val-red animate-pulse">● LIVE</span>
            </div>
          </div>
        </div>

        {/* Bottom: abilities (Network-like hoverable cards) */}
        <div className="p-6 sm:p-10 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <span className="hud-metadata text-white/30">// Combat Abilities</span>
            <span className="hud-metadata text-val-red/60">Hover abilities • Press Esc to close</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {abilities.slice(0, 6).map((ab, i) => (
              <motion.div
                key={`${ab.displayName}-${i}`}
                whileHover={{ y: -4 }}
                data-magnetic
                className="group p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-val-red/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="hud-metadata text-val-red/70 text-[8px] whitespace-nowrap">
                    SIG_{String(i + 1).padStart(2, '0')}
                  </span>
                  {ab.displayIcon ? (
                    <img
                      src={ab.displayIcon}
                      className="w-7 h-7 opacity-70 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                      alt={ab.displayName}
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-lg bg-white/10" />
                  )}
                </div>
                <div className="font-display font-black uppercase tracking-tight text-lg mb-2 group-hover:text-val-red transition-colors">
                  {ab.displayName}
                </div>
                {ab.description ? (
                  <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                    {ab.description}
                  </p>
                ) : (
                  <p className="text-sm text-white/45 leading-relaxed">No description available.</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".hero-panel", { scale: 0.94, opacity: 0, duration: 1.4, ease: "expo.out", delay: 0.3 });
    gsap.to(".hero-character-img", {
      yPercent: -25,
      scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 1.5 }
    });
  }, { scope: containerRef });

  const goToAgents = () => gsap.to(window, { duration: 1.6, scrollTo: "#agents", ease: "power4.inOut" });

  return (
    <section id="hero" ref={containerRef} className="relative min-h-[120vh] sm:min-h-[150vh] flex flex-col items-center justify-start pt-28 sm:pt-36 md:pt-40 bg-val-dark overflow-hidden px-4 sm:px-6">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(0,245,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-1/3 left-0 w-[60vw] h-[60vw] rounded-full lighting-cyan blur-[160px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[50vw] h-[50vw] rounded-full lighting-orange blur-[140px] opacity-10 pointer-events-none" />

      {/* Hero card — full width on mobile, aspect-ratio only on large screens */}
      <div className="hero-panel hud-container w-full max-w-7xl min-h-[60vh] sm:aspect-[16/8] sm:min-h-0 flex flex-col items-center justify-center relative shadow-[0_0_120px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 lighting-cyan opacity-10 pointer-events-none" />
        <div className="absolute inset-x-4 sm:inset-x-8 bottom-4 sm:bottom-6 hidden sm:flex justify-between hud-metadata uppercase tracking-[0.5em] sm:tracking-[1em] opacity-20 z-20 pointer-events-none">
          <span>// Grid Lockdown Active</span>
          <span>044X-LINK // NXS</span>
        </div>
        <div className="relative z-10 text-center overflow-hidden px-4">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.8 }}
            className="font-mono text-[8px] sm:text-[9px] tracking-[0.8em] sm:tracking-[1.5em] text-val-blue mb-6 sm:mb-10 block uppercase">
            Tactical Frontier Established
          </motion.span>
          {/* Fluid type: 3rem on 375px → 11rem at 1440px */}
          <h1 className="font-display font-black leading-[0.78] sm:leading-[0.72] tracking-tight uppercase" style={{ fontSize: 'clamp(3rem, 13vw, 11rem)' }}>
            <motion.span initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.9 }} className="block">BEYOND</motion.span>
            <motion.span initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.1 }} className="block text-val-blue font-light italic">FRONTIER</motion.span>
          </h1>
        </div>
        <div className="hero-character-img absolute bottom-0 w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl pointer-events-none translate-y-8">
          <motion.img initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 1.3 }}
            src="https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png"
            className="w-full h-full object-contain drop-shadow-[0_0_100px_rgba(0,245,255,0.2)]"
            referrerPolicy="no-referrer" alt="Reyna" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-10 flex flex-wrap justify-between items-center gap-4 border-t border-white/5 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex gap-6 sm:gap-12">
            <div>
              <span className="hud-metadata text-[7px] text-white/25 block mb-1">Protocol</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-val-blue shadow-[0_0_8px_#00F5FF]" />
                <span className="font-display font-bold text-sm sm:text-base tracking-tighter">NEXUS_V.4</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="hud-metadata text-[7px] text-white/25 block mb-1">Sector Load</span>
              <span className="font-display font-medium text-sm sm:text-base text-val-blue">24% — STABLE</span>
            </div>
          </div>
          <button data-magnetic onClick={goToAgents}
            className="relative py-2.5 sm:py-3 px-7 sm:px-10 bg-white/5 border border-white/10 hover:border-val-blue rounded-full group overflow-hidden transition-colors">
            <div className="absolute inset-0 bg-val-blue translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="flex items-center gap-2 sm:gap-3 relative z-10 group-hover:text-black transition-colors">
              <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-bold">Deploy Archive</span>
              <Compass size={12} className="group-hover:rotate-90 transition-transform duration-700" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

// ─── ROSTER ───────────────────────────────────────────────────────────────────
const Roster = ({ agents, onSelect }: { agents: Agent[]; onSelect: (a: Agent) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!trackRef.current || !containerRef.current) return;
    const totalWidth = trackRef.current.scrollWidth - window.innerWidth + 96;
    gsap.to(trackRef.current, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${totalWidth * 1.2}`,
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  }, { scope: containerRef });

  return (
    <section id="agents" ref={containerRef} className="bg-val-dark overflow-hidden">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.015] select-none">
        <span className="text-[40vw] font-display font-black uppercase leading-none tracking-tighter">ARCHIVE</span>
      </div>
      <div className="absolute top-20 left-20 z-10 pointer-events-none hidden lg:block">
        <span className="hud-metadata text-val-orange">// Agent Roster</span>
        <p className="hud-metadata text-white/20 mt-1">Scroll to navigate</p>
      </div>
      <div ref={trackRef} className="flex gap-8 px-[12vw] items-center min-h-screen will-change-transform">
        {agents.map((agent, i) => (
          <motion.div key={agent.uuid}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.4) }}
            viewport={{ once: true }}
            onClick={() => onSelect(agent)}
            data-magnetic
            className="hud-container min-w-[300px] md:min-w-[340px] aspect-[3/4.5] cursor-pointer group hover:border-val-blue transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-val-blue/15 via-transparent to-transparent pointer-events-none" />
            <div className="p-8 flex flex-col justify-between h-full relative z-10">
              <div>
                <span className="hud-metadata text-val-blue/50 block mb-1">// {agent.role?.displayName}</span>
                <h3 className="text-3xl font-display font-black tracking-tighter uppercase group-hover:text-val-blue transition-colors">{agent.displayName}</h3>
              </div>
              <div className="flex justify-between items-center">
                <span className="hud-metadata text-[8px] border border-white/10 px-3 py-1.5 rounded-full bg-white/5 group-hover:bg-val-blue group-hover:border-val-blue group-hover:text-black transition-all">View Dossier</span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-end justify-center overflow-hidden pointer-events-none z-0">
              <img src={agent.fullPortrait}
                className="w-[130%] h-[130%] object-contain opacity-35 group-hover:opacity-90 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 translate-y-4 group-hover:translate-y-0"
                referrerPolicy="no-referrer" alt={agent.displayName} />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-20 pointer-events-none">
        <ChevronRight className="rotate-180" size={14} />
        <span className="hud-metadata">Scroll to navigate archive</span>
        <ChevronRight size={14} />
      </div>
    </section>
  );
};

// ─── NETWORK / DASHBOARD ── Waylay + Lore ─────────────────────────────────────
const WAYLAY_PORTRAIT = 'https://media.valorant-api.com/agents/df1cb487-4902-002a-ec80-078d4cb0e9b3/fullportrait.png';

const WAYLAY_LORE = {
  designation: 'Agent 28 // WAYLAY',
  origin: 'Bangkok, Thailand',
  classification: 'Duelist // Prismatic Radiant',
  status: 'Active — Valorant Protocol',
  summary: `She is light. Trained to act with precision, Waylay earned her place on the Protocol not through subtlety but through results. A prismatic Radiant with the ability to transform into pure light, she moves faster than most agents can track — slipping in, eliminating targets, and vanishing before the echo of a gunshot fades.`,
  lore: [
    `Recruited through her longtime ally Tejo, an intelligence consultant who vouched for her directly to Brimstone, Waylay's path to the Protocol was unconventional. Hints in her contract suggest a history of infiltration — heists, extraction missions, and operations most agents never hear about.`,
    `Serious and demanding by nature, she trains younger agents ruthlessly, believing that early correction prevents battlefield failure. When she helps turn the tide of a Kingdom-linked battle in Bangkok, she demonstrates what a Radiant who has truly mastered their gift can do.`,
    `Her debuff mechanic — "Hindering" — reflects her philosophy: slow everything around you, then strike at light speed. She does not believe in equal footing.`,
  ],
  abilities: [
    { name: 'Saturate', type: 'Basic', desc: 'Throws a cluster of light that explodes on contact, Hindering nearby players — slowing movement, fire rate, and reflexes.' },
    { name: 'Light Speed', type: 'Basic', desc: 'A powerful double-dash that covers more ground than Jett\'s dash. First dash can send her upward.' },
    { name: 'Refract', type: 'Signature', desc: 'Plants a beacon of light. Reactivate to speed back to it as a mote of pure light — invulnerable in transit.' },
    { name: 'Convergent Paths', type: 'Ultimate', desc: 'Focuses prismatic power to project a beam that expands after a brief delay, Hindering all players in the area while Waylay gains a powerful speed boost.' },
  ],
};

const GridDashboard = ({ agents }: { agents: Agent[] }) => {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const waylayWrap  = useRef<HTMLDivElement>(null);
  const waylayImg   = useRef<HTMLImageElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const mouse       = useRef({ x: 0, y: 0 });
  const current     = useRef({ x: 0, y: 0 });
  const rafId       = useRef<number>(0);

  const waylayAgent    = agents.find(a => a.displayName.toLowerCase() === 'waylay');
  const waylayPortrait = waylayAgent?.fullPortrait ?? WAYLAY_PORTRAIT;

  useGSAP(() => {
    if (!sectionRef.current || !waylayWrap.current) return;

    // Scroll entry — rises from below
    gsap.fromTo(waylayWrap.current,
      { y: 120, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', end: 'top 20%', scrub: 2 } }
    );

    // Gentle idle float
    gsap.to(waylayWrap.current, { y: -16, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Glow pulse
    gsap.to(glowRef.current, { opacity: 0.6, scale: 1.18, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Stagger stat cards
    gsap.fromTo('.stat-card',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.stat-grid', start: 'top 80%' } }
    );

    // Left panel slide
    gsap.fromTo('.grid-left-panel',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 74%' } }
    );
  }, { scope: sectionRef });

  // Clean mouse parallax — NO rotation, just translateX/Y (no distortion)
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
      mouse.current.x = ((e.clientX - left) / width  - 0.5) * 2;
      mouse.current.y = ((e.clientY - top)  / height - 0.5) * 2;
    };

    const tick = () => {
      current.current.x = lerp(current.current.x, mouse.current.x * 18, 0.05);
      current.current.y = lerp(current.current.y, mouse.current.y * 10, 0.05);
      // Translate only — clean, no perspective distortion
      if (waylayImg.current) {
        waylayImg.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px) scale(1.04)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${current.current.x * 0.5}px, ${current.current.y * 0.5}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafId.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafId.current); window.removeEventListener('mousemove', onMove); };
  }, []);

  const stats = [
    { icon: <Zap className="text-val-blue" size={18} />, label: 'Saturate', val: 'HINDER_ECHO', sub: 'Prismatic Slow', desc: 'Light clusters detonate to disrupt enemy tempo and reflex windows.' },
    { icon: <Target className="text-val-orange" size={18} />, label: 'Light Speed', val: 'PHASE_DRIVE', sub: 'Traversal Burst', desc: 'High-velocity dashes that reshape fight angles before the counterplay lands.' },
    { icon: <Shield className="text-val-blue" size={18} />, label: 'Refract', val: 'BEACON_LOCK', sub: 'Return Vector', desc: 'Beaconed light supports safe transit and fast re-engagement routes.' },
    { icon: <Activity className="text-val-orange" size={18} />, label: 'Convergent Paths', val: 'NEXUS_RAY', sub: 'Ultimate Pulse', desc: 'An expanding beam that hinders the area while Waylay escalates forward.' },
  ];

  return (
    <section id="network" ref={sectionRef}
      className="relative bg-val-dark overflow-hidden">

      {/* ── Stats Dashboard ── */}
      <div className="relative min-h-screen py-20 lg:py-0 px-5 sm:px-10 lg:px-20 flex items-center">
        {/* Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50vw] h-full lighting-cyan blur-[200px] opacity-10" />
          <div className="absolute bottom-0 left-1/4 w-[30vw] h-1/2 lighting-orange blur-[160px] opacity-[0.08]" />
        </div>

        {/* Waylay — right side, clean parallax (no rotation) */}
        <div ref={waylayWrap}
          className="absolute right-0 bottom-0 w-[68vw] sm:w-[48vw] lg:w-[40vw] max-w-[620px] z-0 opacity-0 pointer-events-none will-change-transform">
          <div ref={glowRef}
            className="absolute inset-x-[8%] bottom-0 h-[75%] rounded-full bg-val-blue/20 blur-[80px] opacity-30 will-change-transform" />
          <img
            ref={waylayImg}
            src={waylayPortrait}
            alt="Waylay"
            referrerPolicy="no-referrer"
            className="relative z-10 w-full h-auto object-contain will-change-transform"
            style={{ filter: 'drop-shadow(0 0 60px rgba(0,245,255,0.2)) drop-shadow(0 0 120px rgba(0,245,255,0.08))' }}
          />
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
            <span className="hud-metadata text-[7px] text-val-blue/70">UNIT // WAYLAY</span>
            <span className="hud-metadata text-[6px] text-white/25">Duelist // Agent 28</span>
          </div>
          <div className="absolute bottom-10 right-4 z-20">
            <span className="hud-metadata text-[7px] text-val-blue animate-pulse">● LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-12 gap-5 items-center min-h-screen py-36">
          <div className="col-span-12 mb-2">
            <span className="hud-metadata text-val-orange">// Real-Time Network Intelligence</span>
          </div>

          {/* Left info panel */}
          <div className="grid-left-panel col-span-12 lg:col-span-5">
            <div className="hud-container p-7 lg:p-9 flex flex-col gap-6">
              <div>
                <h2 className="text-[clamp(2.8rem,5vw,4.5rem)] font-display font-black tracking-tighter leading-[0.82] uppercase">
                  WAYLAY_<br /><span className="text-val-blue">LIVE OPS</span>
                </h2>
                <p className="text-sm text-white/60 font-sans leading-relaxed mt-4 max-w-xs">
                  Waylay slips between protocol layers, saturating sightlines and severing escape vectors.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.06]">
                {[
                  { label: 'Tempo Control', val: 'HINDER FIELD', color: 'text-val-blue' },
                  { label: 'Beacon Integrity', val: 'REFRACT LOCK', color: 'text-val-orange' },
                  { label: 'Escape Denial', val: 'CONVERGENCE', color: 'text-val-blue' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                    <span className="font-mono text-[10px] tracking-widest text-white/45 uppercase">{item.label}</span>
                    <span className={cn('font-display font-bold text-base tracking-tight', item.color)}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2×2 stat cards */}
          <div className="stat-grid col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card hud-container p-5 sm:p-6 hover:bg-white/[0.05] transition-all duration-500 group flex flex-col justify-between gap-4 min-h-[155px] sm:min-h-[170px] opacity-0">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg group-hover:border-white/25 transition-all">{stat.icon}</div>
                  <span className="font-mono text-[7px] text-white/35 text-right leading-tight ml-2">{stat.sub}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block mb-1">{stat.label}</span>
                  <span className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tighter group-hover:text-white transition-colors">{stat.val}</span>
                  <p className="text-white/35 text-[11px] font-sans leading-snug mt-1.5 hidden sm:block">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Waylay Lore Panel ── */}
      <div className="relative px-5 sm:px-10 lg:px-20 pb-24 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[60vw] h-full lighting-cyan blur-[250px] opacity-[0.06]" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 pt-20">

          {/* Header */}
          <div className="col-span-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <span className="hud-metadata text-val-orange block mb-2">// Classified Intel</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tighter uppercase leading-none">
                {WAYLAY_LORE.designation}
              </h2>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="hud-metadata text-val-blue">{WAYLAY_LORE.origin}</span>
              <span className="hud-metadata opacity-30">{WAYLAY_LORE.classification}</span>
              <span className="hud-metadata text-val-orange/60">{WAYLAY_LORE.status}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-7">
            <div className="hud-container p-8 lg:p-10 flex flex-col gap-8">
              <p className="text-base sm:text-lg text-white/70 font-sans leading-relaxed border-l-2 border-val-blue pl-6">
                {WAYLAY_LORE.summary}
              </p>
              <div className="flex flex-col gap-5">
                {WAYLAY_LORE.lore.map((para, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="hud-metadata text-val-blue/40 mt-1 flex-shrink-0">0{i+1}</span>
                    <p className="text-sm text-white/50 font-sans leading-relaxed">{para}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            <span className="hud-metadata text-white/30 block mb-2">// Combat Abilities</span>
            {WAYLAY_LORE.abilities.map((ab, i) => (
              <div key={i} className="hud-container p-5 sm:p-6 hover:border-val-blue/30 transition-colors group">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="font-display font-black text-lg uppercase tracking-tight group-hover:text-val-blue transition-colors">{ab.name}</span>
                  <span className="hud-metadata text-[8px] border border-white/10 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">{ab.type}</span>
                </div>
                <p className="text-white/40 text-sm font-sans leading-relaxed">{ab.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── CODEX — All Agent Lore ───────────────────────────────────────────────────
const Codex = ({
  agents,
  onSelectAgent,
}: {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}) => {
  const [query, setQuery]     = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const roles = ['All', ...Array.from(new Set(agents.map(a => a.role?.displayName).filter(Boolean)))];

  const filtered = agents.filter(a => {
    const matchRole = roleFilter === 'All' || a.role?.displayName === roleFilter;
    const matchSearch = !query || a.displayName.toLowerCase().includes(query.toLowerCase())
      || (a.description || '').toLowerCase().includes(query.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <section
      id="codex"
      className="relative min-h-screen py-24 px-5 sm:px-10 lg:px-20 bg-val-dark border-t border-white/[0.04] overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[55vw] h-full lighting-red blur-[200px] opacity-10" />
        <div className="absolute bottom-0 left-1/4 w-[35vw] h-1/2 lighting-red blur-[170px] opacity-[0.07]" />
      </div>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="hud-metadata text-val-red block mb-3">// Classified Agent Database</span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none text-val-red drop-shadow-[0_0_28px_rgba(255,70,85,0.14)]">
              CODEX
            </h2>
            <p className="text-sm text-white/65 font-sans mt-3 max-w-sm leading-relaxed">
              Agent intel profiles with official Valorant lore.
            </p>
          </div>
          {/* Search */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                placeholder="Search agent or lore..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full sm:w-64 bg-white/[0.04] border border-white/12 rounded-full pl-10 pr-5 py-3 text-sm text-white placeholder-white/30 font-sans focus:outline-none focus:border-val-red transition-colors"
              />
            </div>
            {/* Role filter */}
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={cn("hud-metadata px-3 py-1.5 rounded-full border transition-all text-[9px]",
                    roleFilter === r
                      ? "bg-val-red border-val-red text-black"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-val-red/30")}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <motion.div
              key={agent.uuid}
              layout
              className="hud-container overflow-hidden transition-all rounded-[26px] border border-white/[0.10] bg-white/[0.045] hover:border-val-red/40 hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(255,70,85,0.12)] group will-change-transform"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-val-red/20 via-transparent to-transparent"
                aria-hidden="true"
              />
              <button
                type="button"
                data-magnetic
                className="w-full flex flex-col gap-4 p-5 sm:p-6 relative z-10"
                onClick={() => onSelectAgent(agent)}
                aria-label={`Open Network profile for ${agent.displayName}`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-white/5 border border-white/10 relative">
                    <img
                      src={agent.displayIcon}
                      className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                      alt={agent.displayName}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-val-red/30 to-transparent" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="hud-metadata text-val-red/60 block mb-0.5">{agent.role?.displayName}</span>
                    <span className="font-display font-black text-xl uppercase tracking-tight truncate group-hover:text-val-red transition-colors">
                      {agent.displayName}
                    </span>
                  </div>
                  <ArrowUpRight size={16} className="text-white/35 group-hover:text-val-red transition-colors flex-shrink-0" />
                </div>

                <p className="text-sm text-white/65 font-sans leading-relaxed line-clamp-2">
                  {agent.description || 'Intelligence file restricted. Further access requires Alpha clearance.'}
                </p>

                <div className="flex items-center justify-between">
                  <span className="hud-metadata text-[9px] text-val-red/55 uppercase">Open Profile</span>
                  <span className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] grid place-items-center group-hover:border-val-red/35 transition-colors">
                    <ChevronRight size={16} className="text-val-red/80 group-hover:text-val-red transition-colors" />
                  </span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="hud-metadata text-white/20">No agents match your search query.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ─── LOADER ───────────────────────────────────────────────────────────────────
const Loader = () => (
  <div className="h-screen bg-black flex flex-col items-center justify-center gap-12 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{ backgroundImage: "linear-gradient(rgba(0,245,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.6) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
    <div className="relative w-80">
      <div className="absolute -top-8 left-0 hud-metadata text-val-blue animate-pulse">Scanning Node_01</div>
      <div className="h-px w-80 bg-white/10 overflow-hidden">
        <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-val-blue to-transparent shadow-[0_0_20px_#00F5FF]" />
      </div>
      <div className="absolute -bottom-8 right-0 hud-metadata text-val-orange">Security v.9.4A</div>
    </div>
    <div className="flex flex-col items-center gap-3 mt-8">
      <motion.div className="font-display font-black text-3xl tracking-[2em] uppercase ml-[2em]"
        animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
        Linking_Nexus
      </motion.div>
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.25, duration: 1 }}
            className="w-2 h-2 bg-val-blue rotate-45" />
        ))}
      </div>
    </div>
  </div>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="py-40 px-8 border-t border-white/[0.04] bg-val-dark relative overflow-hidden">
    <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
      <h2 className="text-[22vw] font-display font-black leading-none select-none tracking-tighter" style={{ color: 'rgba(255,255,255,0.03)' }}>NEXUS</h2>
      <div className="hud-container p-12 max-w-xl -mt-20 relative z-10 bg-white/[0.02] border-white/20">
        <span className="hud-metadata text-val-orange mb-4 block">// Session Terminal</span>
        <p className="hud-metadata text-white/30 leading-relaxed mb-10">
          All nodes synchronized. Global link secured. Nexus v4 protocol remains active.
        </p>
        <button data-magnetic onClick={() => gsap.to(window, { duration: 2, scrollTo: 0, ease: "power4.inOut" })}
          className="inline-flex items-center gap-4 py-4 px-14 border border-val-blue bg-val-blue/5 text-val-blue hover:bg-val-blue hover:text-black transition-all rounded-full group">
          <span className="font-mono text-[9px] tracking-[1em] uppercase font-bold">Restart Terminal_</span>
          <Compass size={14} className="group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>
      <p className="hud-metadata text-white/10 mt-16">© NEXUS Frontier Gaming // 2025</p>
    </div>
  </footer>
);

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading]             = useState(true);
  const [agents, setAgents]               = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedCodexAgent, setSelectedCodexAgent] = useState<Agent | null>(null);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      .then(r => r.json())
      .then(d => { setAgents(d.data); setTimeout(() => setLoading(false), 2000); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const sectionIds = ["hero", "agents", "network", "codex"];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [loading]);

  useEffect(() => {
    document.body.style.overflow = selectedAgent || selectedCodexAgent ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedAgent, selectedCodexAgent]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-val-dark relative overflow-x-hidden selection:bg-val-blue selection:text-black">
      <CustomCursor />
      <HUDOverlay />
      <Nav activeSection={activeSection} />
      <main>
        <Hero />
        <Roster agents={agents} onSelect={setSelectedAgent} />
        <GridDashboard agents={agents} />
        <Codex agents={agents} onSelectAgent={(a) => { setSelectedAgent(null); setSelectedCodexAgent(a); }} />
      </main>
      <Footer />
      <AnimatePresence>
        {selectedAgent && (
          <AgentDossier agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
        {selectedCodexAgent && (
          <AgentNetworkModal agent={selectedCodexAgent} onClose={() => setSelectedCodexAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
