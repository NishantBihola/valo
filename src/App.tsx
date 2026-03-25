/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  Crosshair, 
  ChevronRight, 
  Menu, 
  X, 
  Github, 
  Twitter, 
  ArrowUpRight,
  Shield,
  Zap,
  Eye,
  Target
} from 'lucide-react';
import { cn } from './lib/utils';
import { Agent } from './types';

// Mock data for initial structure, we'll fetch real data in useEffect
const AGENTS_FALLBACK = [
  {
    uuid: "gekko",
    displayName: "GEKKO",
    role: { displayName: "INITIATOR" },
    fullPortrait: "https://media.valorant-api.com/agents/e370fa57-4757-3404-580f-18ae350b51f3/fullportrait.png",
    description: "Calamitous and clever, Gekko leads his squad of mischievous companions through the battlefield with calculated chaos."
  }
];

const NEXUS_LORE = {
  gekko: {
    description: "Gekko leads his band of calamitous creatures across the battlefield. With daring precision and unshakable cunning, he clears paths for allies, chases down foes, and regroups to strike again.",
    origin: "Classified",
    coordinates: "34.0522° N, 118.2437° W",
    status: "Active",
    scanId: "e370fa57",
    abilities: [
      { slot: "Slot 1", displayName: "Wingman", description: "Deploy Gekko’s trusty companion to scout, disrupt, or plant/defuse the Spike. When its mission completes, reclaim Wingman to reset your strategy." },
      { slot: "Slot 2", displayName: "Dizzy", description: "Launch Dizzy into the fray. Its plasma blasts blind enemies in line of sight, turning chaos into opportunity. Reclaim Dizzy to recharge." },
      { slot: "Slot E", displayName: "Mosh Pit", description: "Toss Mosh to the ground. It duplicates, dealing damage over time before exploding in controlled devastation. Reclaim to reuse and dominate the field." },
      { slot: "Slot C", displayName: "Thrash", description: "Take control of Thrash directly. Lunge through enemy lines, detain enemies in a tight radius, then explode for tactical disruption. Thrash can be reclaimed once per use." }
    ]
  },
  fade: {
    description: "Fade moves like a shadow, striking fear before she is even seen. Her mastery over darkness and intelligence gathering allows her to control the battlefield, uncovering enemies and manipulating engagements to her team’s advantage.",
    origin: "Classified",
    coordinates: "Unknown",
    status: "Active",
    scanId: "dade",
    abilities: [
      { slot: "Slot 1", displayName: "Haunt", description: "Send an ethereal scout forward to reveal enemy positions." },
      { slot: "Slot 2", displayName: "Seize", description: "Create zones that immobilize opponents, leaving them vulnerable." },
      { slot: "Slot E", displayName: "Nightfall", description: "Unleash a wave of darkness that blinds and disorients all caught in its path." },
      { slot: "Slot C", displayName: "Paranoia", description: "Charge a spectral projectile that marks enemies, exposing them to your team." }
    ]
  },
  breach: {
    description: "Breach is a seismic force on the battlefield. His mechanical precision and raw power disrupt enemy formations, leaving paths open for his team to capitalize on chaos.",
    origin: "Sweden",
    coordinates: "59.3293° N, 18.0686° E",
    status: "Active",
    scanId: "5f8d",
    abilities: [
      { slot: "Slot 1", displayName: "Aftershock", description: "Send a seismic charge through walls, damaging and destabilizing enemies." },
      { slot: "Slot 2", displayName: "Flashpoint", description: "Deploy a flash charge that blinds opponents in its radius." },
      { slot: "Slot E", displayName: "Fault Line", description: "Trigger a concussive tremor that stuns and disorients multiple enemies." },
      { slot: "Slot C", displayName: "Rolling Thunder", description: "Release a massive quake that knocks foes off balance and controls territory." }
    ]
  },
  deadlock: {
    description: "Deadlock is the unmovable guardian of her team. Through superior tactics and advanced defense systems, she fortifies positions and ensures that no enemy can penetrate her watch.",
    origin: "Classified",
    coordinates: "Unknown",
    status: "Active",
    scanId: "cc8b",
    abilities: [
      { slot: "Slot 1", displayName: "Anchor", description: "Deploy devices that trap intruders in place." },
      { slot: "Slot 2", displayName: "Barrier", description: "Generate energy shields to protect allies or block pathways." },
      { slot: "Slot E", displayName: "Suppress", description: "Emit zones that weaken or slow enemies." },
      { slot: "Slot C", displayName: "Lockdown", description: "Activate a comprehensive defensive array to secure a zone." }
    ]
  },
  raze: {
    description: "Raze speaks in explosions. Every encounter is her canvas, every grenade a stroke of controlled chaos. She thrives in the thick of battle, turning destruction into art.",
    origin: "Brazil",
    coordinates: "-15.7801° S, -47.9292° W",
    status: "Active",
    scanId: "f94c",
    abilities: [
      { slot: "Slot 1", displayName: "Boom Bot", description: "Deploy a rolling scout that hunts enemies and explodes on contact." },
      { slot: "Slot 2", displayName: "Paint Shells", description: "Launch cluster grenades for maximum disruption and damage." },
      { slot: "Slot E", displayName: "Blast Pack", description: "Propel herself or enemies with explosive force." },
      { slot: "Slot C", displayName: "Showstopper", description: "Equip a rocket launcher for devastating ultimate impact." }
    ]
  },
  chamber: {
    description: "Chamber is elegance in action. His precision and tactical control allow him to dominate the field from a distance, protecting allies while dismantling enemy strategies with deadly efficiency.",
    origin: "France",
    coordinates: "48.8566° N, 2.3522° E",
    status: "Active",
    scanId: "2269",
    abilities: [
      { slot: "Slot 1", displayName: "Trademark", description: "Place traps that alert and slow enemies." },
      { slot: "Slot 2", displayName: "Headhunter", description: "Use a high-precision firearm to pick off key targets." },
      { slot: "Slot E", displayName: "Rendezvous", description: "Teleport between pre-set locations for rapid repositioning." },
      { slot: "Slot C", displayName: "Tour De Force", description: "Deploy a custom sniper rifle for ultimate elimination." }
    ]
  },
  kayo: {
    description: "KAY/O is humanity’s answer to synthetic threats. Equipped to suppress enemy abilities and disrupt coordination, he’s the relentless force that levels the playing field for his team.",
    origin: "Classified",
    coordinates: "Unknown",
    status: "Active",
    scanId: "601d",
    abilities: [
      { slot: "Slot 1", displayName: "FRAG/ment", description: "Throw explosive charges that force enemies out of cover." },
      { slot: "Slot 2", displayName: "FLASH/drive", description: "Deploy blinding flashes to control engagements." },
      { slot: "Slot E", displayName: "ZERO/point", description: "Suppress enemy powers in a radius." },
      { slot: "Slot C", displayName: "NULL/cmd", description: "Activate ultimate ability, boosting allies while disabling enemies’ skills." }
    ]
  },
  jett: {
    description: "Jett is the embodiment of agility and speed. Her movements are a blur, allowing her to outmaneuver any opponent and strike from unexpected angles with lethal precision.",
    origin: "South Korea",
    coordinates: "37.5665° N, 126.9780° E",
    status: "Active",
    scanId: "add6",
    abilities: [
      { slot: "Slot 1", displayName: "Cloudburst", description: "Deploy a smoke cloud that obscures vision and provides cover." },
      { slot: "Slot 2", displayName: "Updraft", description: "Propel herself high into the air for superior positioning." },
      { slot: "Slot E", displayName: "Tailwind", description: "Dash forward with incredible speed to engage or escape." },
      { slot: "Slot C", displayName: "Blade Storm", description: "Equip a set of deadly throwing knives for ultimate precision." }
    ]
  },
  phoenix: {
    description: "Phoenix is a force of fire and rebirth. His aggressive style and self-sustaining abilities make him a formidable presence on the front lines, leading his team with confidence and heat.",
    origin: "United Kingdom",
    coordinates: "51.5074° N, 0.1278° W",
    status: "Active",
    scanId: "ee8b",
    abilities: [
      { slot: "Slot 1", displayName: "Blaze", description: "Create a wall of fire that blocks vision and heals Phoenix." },
      { slot: "Slot 2", displayName: "Curveball", description: "Throw a blinding flare that curves around corners." },
      { slot: "Slot E", displayName: "Hot Hands", description: "Launch a fireball that damages enemies and heals Phoenix." },
      { slot: "Slot C", displayName: "Run It Back", description: "Mark a location to return to after a short duration or upon death." }
    ]
  },
  sage: {
    description: "Sage is the cornerstone of her team’s survival. Her mastery over life and earth allows her to heal allies, slow enemies, and create barriers that reshape the battlefield.",
    origin: "China",
    coordinates: "39.9042° N, 116.4074° E",
    status: "Active",
    scanId: "569f",
    abilities: [
      { slot: "Slot 1", displayName: "Barrier Orb", description: "Create a solid wall that blocks pathways and provides cover." },
      { slot: "Slot 2", displayName: "Slow Orb", description: "Deploy a field that slows and disorients enemies." },
      { slot: "Slot E", displayName: "Healing Orb", description: "Heal herself or an ally over time." },
      { slot: "Slot C", displayName: "Resurrection", description: "Bring a fallen ally back to life with full health." }
    ]
  },
  sova: {
    description: "Sova is the ultimate tracker. His precision with a bow and his ability to gather intelligence from afar make him an invaluable asset for any team looking to control the flow of battle.",
    origin: "Russia",
    coordinates: "55.7558° N, 37.6173° E",
    status: "Active",
    scanId: "320b",
    abilities: [
      { slot: "Slot 1", displayName: "Owl Drone", description: "Deploy a remote-controlled drone to scout and mark enemies." },
      { slot: "Slot 2", displayName: "Shock Bolt", description: "Fire an explosive arrow that damages enemies on impact." },
      { slot: "Slot E", displayName: "Recon Bolt", description: "Launch a tracking arrow that reveals enemy positions in its line of sight." },
      { slot: "Slot C", displayName: "Hunter’s Fury", description: "Fire three massive energy blasts that pierce walls and damage enemies." }
    ]
  },
  viper: {
    description: "Viper is a master of chemical warfare. Her toxic clouds and corrosive barriers allow her to control large areas of the map, slowly wearing down enemies and forcing them into unfavorable positions.",
    origin: "USA",
    coordinates: "37.7749° N, 122.4194° W",
    status: "Active",
    scanId: "7073",
    abilities: [
      { slot: "Slot 1", displayName: "Snake Bite", description: "Launch a canister of acid that creates a damaging pool." },
      { slot: "Slot 2", displayName: "Poison Cloud", description: "Deploy a gas emitter that creates a toxic cloud." },
      { slot: "Slot E", displayName: "Toxic Screen", description: "Create a long wall of toxic gas that blocks vision and damages enemies." },
      { slot: "Slot C", displayName: "Viper’s Pit", description: "Unleash a massive chemical cloud that obscures vision and reduces enemy health." }
    ]
  },
  cypher: {
    description: "Cypher is the master of surveillance. His network of cameras and traps allows him to monitor every corner of the battlefield, ensuring that no enemy movement goes unnoticed.",
    origin: "Morocco",
    coordinates: "33.5731° N, 7.5898° W",
    status: "Active",
    scanId: "117e",
    abilities: [
      { slot: "Slot 1", displayName: "Trapwire", description: "Place a hidden tripwire that dazes and reveals enemies." },
      { slot: "Slot 2", displayName: "Cyber Cage", description: "Deploy a remote-activated zone that blocks vision and slows enemies." },
      { slot: "Slot E", displayName: "Spycam", description: "Place a camera to monitor areas and fire tracking darts." },
      { slot: "Slot C", displayName: "Neural Theft", description: "Extract information from a fallen enemy to reveal all living opponents." }
    ]
  },
  reyna: {
    description: "Reyna is a soul-harvesting predator. She thrives on eliminations, using the life force of her victims to heal herself, become intangible, or unleash her full potential in battle.",
    origin: "Mexico",
    coordinates: "19.4326° N, 99.1332° W",
    status: "Active",
    scanId: "a3bf",
    abilities: [
      { slot: "Slot 1", displayName: "Leer", description: "Deploy an ethereal eye that nearsights enemies." },
      { slot: "Slot 2", displayName: "Devour", description: "Consume a soul orb to rapidly heal herself." },
      { slot: "Slot E", displayName: "Dismiss", description: "Consume a soul orb to become intangible for a short duration." },
      { slot: "Slot C", displayName: "Empress", description: "Enter a frenzied state with increased fire rate and reload speed." }
    ]
  },
  killjoy: {
    description: "Killjoy is a genius inventor. Her array of turrets, traps, and bots allows her to secure areas and protect her team with mechanical precision and tactical ingenuity.",
    origin: "Germany",
    coordinates: "52.5200° N, 13.4050° E",
    status: "Active",
    scanId: "1e58",
    abilities: [
      { slot: "Slot 1", displayName: "Alarmbot", description: "Deploy a bot that hunts down enemies and makes them vulnerable." },
      { slot: "Slot 2", displayName: "Turret", description: "Place a sentry gun that automatically fires at enemies." },
      { slot: "Slot E", displayName: "Nanoswarm", description: "Toss a grenade that creates a damaging swarm of nanobots." },
      { slot: "Slot C", displayName: "Lockdown", description: "Deploy a device that detains all enemies in its radius after a delay." }
    ]
  },
  skye: {
    description: "Skye is a guardian of nature. Her ability to summon spirit animals allows her to heal allies, scout ahead, and disrupt enemy formations with the power of the wild.",
    origin: "Australia",
    coordinates: "35.2809° S, 149.1300° E",
    status: "Active",
    scanId: "6f2a",
    abilities: [
      { slot: "Slot 1", displayName: "Regrowth", description: "Heal all allies in range and line of sight." },
      { slot: "Slot 2", displayName: "Trailblazer", description: "Take control of a Tasmanian tiger to scout and stun enemies." },
      { slot: "Slot E", displayName: "Guiding Light", description: "Summon a hawk that can be detonated to blind enemies." },
      { slot: "Slot C", displayName: "Seekers", description: "Send out three seekers to track and nearsight the nearest enemies." }
    ]
  },
  yoru: {
    description: "Yoru is a master of deception and dimensional travel. His ability to create decoys and teleport allows him to confuse his enemies and strike from the shadows with lethal efficiency.",
    origin: "Japan",
    coordinates: "35.6762° N, 139.6503° E",
    status: "Active",
    scanId: "7f94",
    abilities: [
      { slot: "Slot 1", displayName: "Fakeout", description: "Deploy a decoy that mimics footsteps or his appearance." },
      { slot: "Slot 2", displayName: "Blindside", description: "Throw a dimensional fragment that bounces and blinds enemies." },
      { slot: "Slot E", displayName: "Gatecrash", description: "Send a tether to teleport to a pre-set location." },
      { slot: "Slot C", displayName: "Dimensional Drift", description: "Enter a dimensional state where he is invisible and intangible." }
    ]
  },
  astra: {
    description: "Astra is a cosmic strategist. Her ability to manipulate the stars allows her to control the battlefield from a higher plane, placing stars that can be activated to stun, pull, or smoke enemies.",
    origin: "Ghana",
    coordinates: "5.6037° N, 0.1870° W",
    status: "Active",
    scanId: "41fb",
    abilities: [
      { slot: "Slot 1", displayName: "Gravity Well", description: "Pull enemies toward a star before it explodes." },
      { slot: "Slot 2", displayName: "Nova Pulse", description: "Stun enemies in a radius around a star." },
      { slot: "Slot E", displayName: "Nebula", description: "Transform a star into a smoke cloud." },
      { slot: "Slot C", displayName: "Cosmic Divide", description: "Create a massive wall that blocks vision and dampens sound." }
    ]
  },
  neon: {
    description: "Neon is a high-speed electrical force. Her incredible speed and electrical blasts allow her to rush into battle and overwhelm her enemies before they can even react.",
    origin: "Philippines",
    coordinates: "14.5995° N, 120.9842° E",
    status: "Active",
    scanId: "bb2a",
    abilities: [
      { slot: "Slot 1", displayName: "Fast Lane", description: "Create two walls of electricity that block vision and damage enemies." },
      { slot: "Slot 2", displayName: "Relay Bolt", description: "Launch an electrical bolt that bounces and stuns enemies." },
      { slot: "Slot E", displayName: "High Gear", description: "Increase her speed and enable a slide maneuver." },
      { slot: "Slot C", displayName: "Overdrive", description: "Unleash her full electrical power for a high-damage beam attack." }
    ]
  },
  harbor: {
    description: "Harbor is a master of water and tide. His ability to control the flow of water allows him to create barriers, protect his team, and disrupt enemy movements with the power of the ocean.",
    origin: "India",
    coordinates: "19.0760° N, 72.8777° E",
    status: "Active",
    scanId: "95b3",
    abilities: [
      { slot: "Slot 1", displayName: "Cascade", description: "Send a wave of water forward that blocks vision and slows enemies." },
      { slot: "Slot 2", displayName: "Cove", description: "Deploy a sphere of water that blocks bullets and vision." },
      { slot: "Slot E", displayName: "High Tide", description: "Create a wall of water that blocks vision and slows enemies." },
      { slot: "Slot C", displayName: "Reckoning", description: "Summon a massive geyser field that stuns enemies in its radius." }
    ]
  },
  iso: {
    description: "Iso is a tactical duelist who thrives in the heat of battle. His ability to create energy shields and isolate enemies in a dimensional arena makes him a formidable opponent in any engagement.",
    origin: "China",
    coordinates: "31.2304° N, 121.4737° E",
    status: "Active",
    scanId: "0e3a",
    abilities: [
      { slot: "Slot 1", displayName: "Contingency", description: "Deploy an energy wall that blocks bullets." },
      { slot: "Slot 2", displayName: "Undercut", description: "Fire a molecular bolt that makes enemies vulnerable." },
      { slot: "Slot E", displayName: "Double Tap", description: "Gain a shield after an elimination." },
      { slot: "Slot C", displayName: "Kill Contract", description: "Pull an enemy into a dimensional arena for a 1v1 duel." }
    ]
  },
  vyse: {
    description: "Vyse is a master of metallic manipulation. Her ability to control liquid metal allows her to trap enemies, block vision, and disrupt weapons with cold, calculated precision.",
    origin: "Classified",
    coordinates: "Unknown",
    status: "Active",
    scanId: "8e25",
    abilities: [
      { slot: "Slot 1", displayName: "Shear", description: "Deploy a hidden trap that creates a metallic wall when triggered." },
      { slot: "Slot 2", displayName: "Arc Rose", description: "Place a metallic rose that can be activated to blind enemies." },
      { slot: "Slot E", displayName: "Razorvine", description: "Toss a nest of liquid metal that slows and damages enemies." },
      { slot: "Slot C", displayName: "Steel Garden", description: "Unleash a field of metal that jams enemy primary weapons." }
    ]
  },
  brimstone: {
    description: "Brimstone is the seasoned commander of his team. His orbital arsenal and tactical utility allow him to control the flow of battle, providing cover and fire support exactly where it’s needed.",
    origin: "USA",
    coordinates: "38.9072° N, 77.0369° W",
    status: "Active",
    scanId: "2809",
    abilities: [
      { slot: "Slot 1", displayName: "Stim Beacon", description: "Deploy a beacon that grants RapidFire to all players in its radius." },
      { slot: "Slot 2", displayName: "Incendiary", description: "Launch an incendiary grenade that creates a damaging pool of fire." },
      { slot: "Slot E", displayName: "Sky Smoke", description: "Deploy long-lasting smoke clouds from an orbital map." },
      { slot: "Slot C", displayName: "Orbital Strike", description: "Launch a devastating orbital laser strike on a chosen location." }
    ]
  },
  omen: {
    description: "Omen is a phantom on the battlefield. His ability to teleport and obscure vision allows him to strike from the shadows and keep his enemies in a constant state of paranoia.",
    origin: "Classified",
    coordinates: "Unknown",
    status: "Active",
    scanId: "8e06",
    abilities: [
      { slot: "Slot 1", displayName: "Shrouded Step", description: "Teleport a short distance after a brief delay." },
      { slot: "Slot 2", displayName: "Paranoia", description: "Fire a shadow projectile that nearsights all players it touches." },
      { slot: "Slot E", displayName: "Dark Cover", description: "Deploy a shadow orb that obscures vision in a chosen location." },
      { slot: "Slot C", displayName: "From The Shadows", description: "Teleport to any location on the map as a shadow." }
    ]
  },
  clove: {
    description: "Clove is a mischievous force of nature who defies death itself. Their ability to influence the battlefield even after falling makes them a unique and unpredictable asset to any team.",
    origin: "Scotland",
    coordinates: "55.9533° N, 3.1883° W",
    status: "Active",
    scanId: "e2ad",
    abilities: [
      { slot: "Slot 1", displayName: "Pick-Me-Up", description: "Absorb the life force of a fallen enemy to gain a temporary health boost." },
      { slot: "Slot 2", displayName: "Meddle", description: "Throw a fragment of immortality essence that decays enemies." },
      { slot: "Slot E", displayName: "Ruse", description: "Deploy smoke clouds that can be cast even after death." },
      { slot: "Slot C", displayName: "Not Dead Yet", description: "Resurrect themselves after being defeated to continue the fight." }
    ]
  }
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const detailRef = useRef<HTMLElement>(null);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    detailRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Loading simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Fetch real agent data
  useEffect(() => {
    fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
      .then(res => res.json())
      .then(data => {
        const enrichedAgents = data.data.map((agent: Agent) => {
          const lowerName = agent.displayName.toLowerCase().replace('/', '');
          const lore = NEXUS_LORE[lowerName as keyof typeof NEXUS_LORE];
          if (lore) {
            return {
              ...agent,
              description: lore.description,
              origin: lore.origin,
              coordinates: lore.coordinates,
              status: lore.status,
              scanId: lore.scanId,
              abilities: agent.abilities.map((ability, index) => ({
                ...ability,
                description: lore.abilities[index]?.description || ability.description,
                displayName: lore.abilities[index]?.displayName || ability.displayName
              }))
            };
          }
          return agent;
        });

        // Add "Tejo" manually since he's custom
        const tejo: Agent = {
          uuid: "tejo-custom",
          displayName: "TEJO",
          description: "Tejo is a tactical innovator. His ingenuity with gadgets and devices makes every skirmish unpredictable. He thrives in uncertainty, turning chaos into advantage for his team.",
          developerName: "Tejo",
          displayIcon: "",
          fullPortrait: "https://media.valorant-api.com/agents/f94c351b-4761-397c-82c3-252301d3595e/fullportrait.png", // Using Raze's as placeholder or similar
          background: "",
          role: { displayName: "INITIATOR", description: "", displayIcon: "" },
          origin: "Classified",
          coordinates: "Unknown",
          status: "Active",
          scanId: "b444",
          abilities: [
            { slot: "Slot 1", displayName: "Spark", description: "Deploy devices that track or damage enemies remotely.", displayIcon: "" },
            { slot: "Slot 2", displayName: "Pulse", description: "Send energy waves that disrupt opponents’ actions.", displayIcon: "" },
            { slot: "Slot E", displayName: "Trapline", description: "Set traps to catch enemies off-guard.", displayIcon: "" },
            { slot: "Slot C", displayName: "Overload", description: "Trigger a large-area disruption that destabilizes enemy formations.", displayIcon: "" }
          ]
        };

        const finalAgents = [...enrichedAgents, tejo];
        setAgents(finalAgents);
        setSelectedAgent(finalAgents.find(a => a.displayName === "GEKKO") || finalAgents[0]);
      })
      .catch(err => console.error("Failed to fetch agents:", err));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-val-dark flex flex-col items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="text-[12vw] font-display leading-none tracking-tighter opacity-10 select-none text-val-red">
            VALORANT
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm font-mono tracking-widest text-val-white">
              INITIALIZING — {progress}%
            </div>
          </div>
        </motion.div>
        <div className="absolute bottom-12 left-12 right-12 h-[1px] bg-val-white/10">
          <motion.div 
            className="h-full bg-val-red"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-kpr-purple selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-20 py-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-12">
          <div className="text-2xl font-display tracking-tighter text-val-white">NEXUS DEV</div>
          <div className="hidden md:flex gap-8 font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
            <a href="#" className="hover:text-val-red transition-colors">Project</a>
            <a href="#" className="hover:text-val-red transition-colors">The Keep</a>
            <a href="#" className="hover:text-val-red transition-colors">Factions</a>
            <a href="#" className="hover:text-val-red transition-colors">The World</a>
          </div>
        </div>
        <div className="flex items-center gap-8 text-val-white">
          <div className="hidden md:flex flex-col items-end font-mono text-[10px] tracking-widest opacity-40">
            <span>VERSION_4.0.2</span>
            <span>SYSTEM_STABLE</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative w-10 h-10 flex items-center justify-center border border-val-white/10 hover:border-val-red transition-colors"
          >
            <div className="relative w-5 h-4">
              <span className={cn("absolute left-0 w-full h-[1px] bg-val-white transition-all", isMenuOpen ? "top-2 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 w-full h-[1px] bg-val-white transition-all top-2", isMenuOpen && "opacity-0")} />
              <span className={cn("absolute left-0 w-full h-[1px] bg-val-white transition-all", isMenuOpen ? "top-2 -rotate-45" : "top-4")} />
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Marquee Section */}
      <div className="py-12 bg-val-red overflow-hidden border-y border-val-white/10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-8">
              <span className="text-4xl md:text-6xl font-display uppercase tracking-tighter text-val-dark">10,000 UNIQUE DIGITAL COLLECTIBLES</span>
              <div className="w-4 h-4 bg-val-dark rotate-45" />
            </div>
          ))}
        </div>
      </div>

      {/* Team Section (Refined Grid) */}
      <section className="py-32 px-6 md:px-20 border-t border-val-white/10 kpr-grid relative overflow-hidden bg-val-dark">
        <div className="absolute top-0 left-0 w-20 h-full border-r border-val-white/10 hidden md:flex flex-col items-center py-10 gap-20">
          <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">01 // PROTOCOL</div>
          <div className="w-[1px] h-32 bg-val-white/10" />
          <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">VAL_UNIT</div>
        </div>

        <div className="flex flex-col mb-32 md:pl-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[10px] text-val-red tracking-[0.5em] uppercase block">01 // THE ROSTER</span>
            <div className="h-[1px] w-20 bg-val-red/30" />
          </div>
          <h2 className="text-[12vw] font-display uppercase tracking-tighter leading-[0.8] text-val-white">Meet the<br />Keepers</h2>
        </div>

        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-val-white/10 border border-val-white/10 md:ml-20"
        >
          {agents.map((agent, index) => (
            <motion.div
              key={agent.uuid}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              onClick={() => handleAgentSelect(agent)}
              className={cn(
                "group relative aspect-square bg-val-dark overflow-hidden cursor-pointer p-8 flex flex-col justify-between transition-colors hover:bg-val-red/5",
                selectedAgent?.uuid === agent.uuid && "bg-val-red/[0.03]"
              )}
            >
              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="font-mono text-[10px] opacity-40 block mb-1 tracking-widest text-val-white">00{index + 1} // SCAN_ID: {agent.uuid.slice(0, 4)}</span>
                  <h3 className="text-2xl font-display tracking-tight group-hover:text-val-red transition-colors uppercase text-val-white">{agent.displayName}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="p-2 border border-val-white/10 rounded-full group-hover:border-val-red transition-colors">
                    <ArrowUpRight size={14} className="text-val-white" />
                  </div>
                  <span className="font-mono text-[8px] opacity-20 uppercase tracking-tighter text-val-white">STATUS: ACTIVE</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.img 
                  whileHover={{ scale: 1.1, y: -10 }}
                  src={agent.fullPortrait} 
                  className="w-[120%] h-[120%] object-contain opacity-20 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="z-10 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 block text-val-white">{agent.role?.displayName}</span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-val-red/20 group-hover:bg-val-red transition-colors" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 10K Section (Marquee) */}
      <MarqueeSection agents={agents} />

      {/* Protect Section */}
      <ProtectSection />

      {/* Reimagine Section */}
      <ReimagineSection />

      {/* Agent Detail Section */}
      <AgentDetailSection selectedAgent={selectedAgent} detailRef={detailRef} />

      {/* Footer */}
      <footer className="bg-val-dark py-32 px-6 md:px-20 border-t border-val-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full kpr-grid opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-12 max-w-xl">
            <div className="text-[12vw] font-display leading-[0.8] tracking-tighter text-val-white">NEXUS<br />DEV</div>
            <p className="text-val-white/40 font-mono text-xs uppercase tracking-widest leading-relaxed">
              Nexus Dev is a collective narrative project. We are building a world that is inclusive, imaginative, and ever-evolving. Join us in the keep.
            </p>
            <div className="flex gap-6">
              <a href="#" className="w-12 h-12 border border-val-white/10 flex items-center justify-center hover:bg-val-red hover:text-val-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-12 h-12 border border-val-white/10 flex items-center justify-center hover:bg-val-red hover:text-val-white transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div className="space-y-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-val-red">Navigation</span>
              <ul className="space-y-4 font-mono text-[10px] tracking-widest uppercase text-val-white/60">
                <li><a href="#" className="hover:text-val-red transition-colors">Project</a></li>
                <li><a href="#" className="hover:text-val-red transition-colors">The Keep</a></li>
                <li><a href="#" className="hover:text-val-red transition-colors">Factions</a></li>
                <li><a href="#" className="hover:text-val-red transition-colors">The World</a></li>
              </ul>
            </div>
            <div className="space-y-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-val-red">Resources</span>
              <ul className="space-y-4 font-mono text-[10px] tracking-widest uppercase text-val-white/60">
                <li><a href="#" className="hover:text-val-red transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-val-red transition-colors">Brand Kit</a></li>
                <li><a href="#" className="hover:text-val-red transition-colors">Support</a></li>
              </ul>
            </div>
            <div className="space-y-8 hidden md:block">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-val-red">Contact</span>
              <p className="font-mono text-[10px] tracking-widest uppercase text-val-white/60">hello@nexusdev.com</p>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-val-white/10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-val-red" />
            <p className="font-mono text-[10px] opacity-40 uppercase tracking-widest text-val-white">© 2026 NEXUS DEV. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-8 font-mono text-[10px] opacity-40 uppercase tracking-widest text-val-white">
            <a href="#" className="hover:text-val-red transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-val-red transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Custom Cursor / Crosshair */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 border border-val-red pointer-events-none z-50 hidden md:flex items-center justify-center rounded-full mix-blend-difference"
        animate={{
          x: -16,
          y: -16,
        }}
        style={{
          left: 'var(--mouse-x)',
          top: 'var(--mouse-y)',
        }}
      >
        <div className="w-1 h-1 bg-val-red rounded-full" />
      </motion.div>

      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('mousemove', (e) => {
          document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
          document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
      `}} />
    </div>
  );
}

const MarqueeSection = ({ agents }: { agents: Agent[] }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-20 border-t border-val-white/10 overflow-hidden relative bg-val-dark">
      <div className="absolute top-0 left-0 w-20 h-full border-r border-val-white/10 hidden md:flex flex-col items-center py-10 gap-20">
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">COLLECTIBLES</div>
        <div className="w-[1px] h-32 bg-val-white/10" />
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">THE DIGITAL LEGACY</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 md:pl-20">
        <h2 className="text-6xl md:text-[10vw] font-display uppercase tracking-tighter leading-[0.8] text-val-white">
          10,000 UNIQUE<br />KEEPERS EXIST.
        </h2>
        <p className="max-w-xs text-sm opacity-60 font-light text-val-white uppercase tracking-widest leading-relaxed">
          Every Keeper is born, endowed with attributes from a collection of over 400 meticulously hand-painted assets. They are personable, iconic possessions that represent the foundational pillars of evolution, inclusion, and imagination.
        </p>
      </div>

      <div className="relative h-[60vh] flex items-center">
        <motion.div style={{ x }} className="flex gap-4 whitespace-nowrap">
          {agents.map((agent) => (
            <div key={agent.uuid} className="w-64 h-80 bg-val-white/5 border border-val-white/10 flex-shrink-0 relative group overflow-hidden">
              <img 
                src={agent.fullPortrait} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100" 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-val-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-display text-lg uppercase text-val-white">{agent.displayName}</p>
                <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest text-val-white">{agent.role?.displayName}</p>
              </div>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {agents.map((agent) => (
            <div key={`${agent.uuid}-dup`} className="w-64 h-80 bg-val-white/5 border border-val-white/10 flex-shrink-0 relative group overflow-hidden">
              <img 
                src={agent.fullPortrait} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100" 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-val-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-display text-lg uppercase text-val-white">{agent.displayName}</p>
                <p className="font-mono text-[8px] opacity-40 uppercase tracking-widest text-val-white">{agent.role?.displayName}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const AgentDetailSection = ({ selectedAgent, detailRef }: { selectedAgent: Agent | null, detailRef: React.RefObject<HTMLElement | null> }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const portraitY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={(node) => {
      // @ts-ignore
      sectionRef.current = node;
      if (detailRef) {
        // @ts-ignore
        detailRef.current = node;
      }
    }} className="min-h-screen bg-val-dark text-val-white py-32 px-6 md:px-20 relative overflow-hidden kpr-grid">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="scanline" />
      </div>
      
      <div className="absolute top-0 left-0 w-20 h-full border-r border-val-white/10 hidden md:flex flex-col items-center py-10 gap-20">
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">THE KEEP</div>
        <div className="w-[1px] h-32 bg-val-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [-128, 128] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-8 bg-val-white/40"
          />
        </div>
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">DATA_SCAN</div>
        <div className="mt-auto space-y-4 mb-10">
          <div className="w-1 h-1 bg-val-red rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-val-red rounded-full animate-pulse delay-75" />
          <div className="w-1 h-1 bg-val-red rounded-full animate-pulse delay-150" />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center md:pl-20">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <motion.div
            key={selectedAgent?.uuid}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs tracking-widest uppercase bg-val-red text-val-white px-3 py-1">AGENT SPOTLIGHT</span>
                <div className="h-[1px] flex-1 bg-val-white/10" />
              </div>
              <h2 className="text-[10vw] font-display leading-none tracking-tighter uppercase text-val-white">{selectedAgent?.displayName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 border-y border-val-white/10 py-12 relative tech-border">
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase opacity-40">Role</span>
                <p className="font-display text-4xl uppercase text-val-red leading-none">{selectedAgent?.role?.displayName}</p>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase opacity-40">Origin</span>
                <p className="font-display text-4xl uppercase text-val-white leading-none">{selectedAgent?.origin || "Classified"}</p>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase opacity-40">Coordinates</span>
                <p className="font-mono text-xs uppercase tracking-widest text-val-white">{selectedAgent?.coordinates || "Unknown"}</p>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase opacity-40">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-val-red rounded-full animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest text-val-red">{selectedAgent?.status || "Active"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase">
                <span className="w-8 h-[1px] bg-val-white" />
                <span>Biography // DATA_LOG</span>
              </div>
              <p className="text-val-white/60 leading-relaxed font-light text-xl max-w-2xl uppercase tracking-wide">
                {selectedAgent?.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="group relative px-12 py-5 bg-val-red text-val-white font-display uppercase tracking-widest overflow-hidden">
                <span className="relative z-10">View Dossier</span>
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  className="absolute inset-0 bg-val-white/20"
                />
              </button>
              <button className="px-12 py-5 border border-val-white/20 text-val-white font-display uppercase tracking-widest hover:border-val-red transition-all">
                Scan Data
              </button>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 relative aspect-square group">
          <div className="absolute inset-0 border border-val-white/10 rounded-full animate-spin-slow opacity-20" />
          <div className="absolute inset-10 border border-val-red/20 rounded-full animate-reverse-spin opacity-20" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-full h-[1px] bg-val-red/20 absolute top-1/4" />
            <div className="w-full h-[1px] bg-val-red/20 absolute top-3/4" />
            <div className="h-full w-[1px] bg-val-red/20 absolute left-1/4" />
            <div className="h-full w-[1px] bg-val-red/20 absolute left-3/4" />
          </div>

          <motion.div 
            style={{ y: portraitY }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <motion.img 
              key={selectedAgent?.uuid}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              src={selectedAgent?.fullPortrait} 
              className="w-[120%] h-[120%] object-contain drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="absolute top-0 left-0 p-8 font-mono text-[8px] tracking-widest opacity-40 uppercase space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-val-red" />
              <span>SCAN_ACTIVE</span>
            </div>
            <div>FREQ: 44.1KHZ</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ReimagineSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[100vh] flex items-center justify-center px-6 md:px-20 overflow-hidden border-t border-val-white/10 bg-val-dark">
      <div className="absolute top-0 left-0 w-20 h-full border-r border-val-white/10 hidden md:flex flex-col items-center py-10 gap-20 z-20">
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">03 // REIMAGINE</div>
        <div className="w-[1px] h-32 bg-val-white/10" />
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">WORLD_OF_KEEPERS</div>
      </div>
      
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img 
          src="https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt1675f2846937542d/63e410403889106967839363/VALORANT_Ep6_Act2_Cinematic_Wallpaper_1920x1080.jpg" 
          className="w-full h-full object-cover opacity-40 scale-110 grayscale"
          alt="VAL Cinematic"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-val-dark via-val-dark/40 to-val-dark" />
        <div className="absolute inset-0 kpr-grid opacity-20" />
      </motion.div>
      
      <motion.div style={{ opacity }} className="relative z-10 text-center space-y-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-[15vw] font-display uppercase tracking-tighter leading-[0.8] text-val-white">REIMAGINE.</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm md:text-lg text-val-white/60 leading-relaxed font-light uppercase tracking-widest">
              Agents are windows into a new world, symbols of transformation, and embody our hopes for the future. We display them with pride as we push each other to reimagine possibilities in physical and digital realms.
            </p>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-12 py-4 bg-val-red text-val-white font-display uppercase tracking-widest hover:bg-val-white hover:text-val-dark transition-all duration-500">
            Explore Lore
          </button>
          <button className="px-12 py-4 border border-val-white/20 text-val-white font-display uppercase tracking-widest hover:border-val-red transition-all duration-500">
            View Archives
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 right-10 flex items-center gap-4 z-20">
        <span className="font-mono text-[10px] tracking-widest opacity-40 text-val-white uppercase">STATUS: EVOLVING</span>
        <div className="w-2 h-2 bg-val-red animate-pulse" />
      </div>
    </section>
  );
};

const ProtectSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const pY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const pRotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <section ref={sectionRef} className="py-32 px-6 md:px-20 border-t border-val-white/10 overflow-hidden relative bg-val-dark">
      <div className="absolute top-0 left-0 w-20 h-full border-r border-val-white/10 hidden md:flex flex-col items-center py-10 gap-20">
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">02 // PROTECT</div>
        <div className="w-[1px] h-32 bg-val-white/10" />
        <div className="vertical-rl font-mono text-[10px] tracking-[0.5em] uppercase opacity-40 text-val-white">CORE_VALUES</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center md:pl-20">
        <div className="relative aspect-square md:aspect-auto h-[60vh]">
          <motion.div 
            style={{ y: pY, rotate: pRotate }}
            className="text-[40vw] font-display leading-none tracking-tighter text-val-white select-none opacity-10"
          >
            P
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-val-white/10" />
            <div className="h-full w-[1px] bg-val-white/10 absolute left-1/2 -translate-x-1/2" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8">
            <div className="relative">
              <Shield className="text-val-red" size={120} strokeWidth={1} />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-val-red/20 blur-3xl rounded-full"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 bg-val-red" />
              <div className="w-2 h-2 bg-val-red/40" />
              <div className="w-2 h-2 bg-val-red/20" />
            </div>
          </div>
        </div>
        <div className="space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-val-red tracking-[0.5em] uppercase">MISSION_02</span>
              <div className="h-[1px] w-12 bg-val-red/30" />
            </div>
            <h2 className="text-7xl md:text-[10vw] font-display uppercase tracking-tighter leading-[0.8] text-val-white">PROTECT.</h2>
          </div>
          
          <p className="text-val-white/60 leading-relaxed font-light max-w-md text-xl uppercase tracking-wide">
            Community is the pulse of Nexus Dev. Every decision, every update, every collectible is built with inclusion, empathy, and mutual respect at the forefront. Here, players aren’t just participants—they’re collaborators in a living, breathing universe.
          </p>

          <div className="grid grid-cols-2 gap-8 border-t border-val-white/10 pt-12">
            <div className="space-y-2">
              <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest text-val-white">01 // INCLUSION</span>
              <p className="text-xs text-val-white/40 uppercase tracking-tighter">Unified by diversity, driven by common purpose.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest text-val-white">02 // EMPATHY</span>
              <p className="text-xs text-val-white/40 uppercase tracking-tighter">Understanding the player, respecting the journey.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.3em] opacity-40 uppercase text-val-white">
            <div className="w-8 h-[1px] bg-val-white" />
            <span>COMMUNITY FIRST. ALWAYS.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroSection = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.4]);
  const videoOpacity = useTransform(smoothProgress, [0, 0.8], [0.6, 0]);
  const videoY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  
  const textY = useTransform(smoothProgress, [0, 1], [0, 400]);
  const textOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden bg-val-dark">
      {/* Background Video */}
      <motion.div 
        style={{ scale: videoScale, opacity: videoOpacity, y: videoY }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-val-dark via-val-dark/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-val-dark z-10" />
        <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale opacity-40">
          <source src="https://assets.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt4380962372d80d2d/63b7264a4805821109156578/VALORANT_REVELATION_Cinematic_Trailer_1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 kpr-grid opacity-20 z-20" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end h-full pb-20">
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="lg:col-span-8"
        >
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase">
              <span className="w-8 h-[1px] bg-val-white" />
              <span>KPR_INITIATIVE_001</span>
            </div>
          </div>
          <h1 className="text-[18vw] lg:text-[14vw] font-display leading-[0.8] tracking-tighter uppercase text-val-white">
            <span className="block">KEEP.</span>
            <span className="block">PROTECT.</span>
            <span className="block text-stroke text-val-red">REIMAGINE.</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="lg:col-span-4 hidden lg:block pb-10"
        >
          <div className="space-y-8 border-l border-val-white/10 pl-12">
            <p className="text-sm text-val-white/60 leading-relaxed font-light max-w-xs uppercase tracking-widest">
              KPR is a brand that focuses on collective narrative and empowering storytellers. Keepers is a living story, an uncharted world waiting to be explored, to be imagined.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] opacity-40 uppercase">Status</span>
                <span className="font-mono text-xs text-val-red">CONNECTED</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] opacity-40 uppercase">Region</span>
                <span className="font-mono text-xs">NEW_EDEN</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-20 flex items-center gap-4 font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">
        <span>SCROLL</span>
        <ChevronRight size={14} className="rotate-90" />
      </div>

      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 scanline opacity-10" />
    </section>
  );
};
