/* =====================================================================
   CONTENT — single source of truth for the whole site.
   Edit values here; components render them.
   ===================================================================== */

export const profile = {
  first: "ANIKET",
  last: "CHARJAN",
  fullName: "Aniket Ravindra Charjan",
  role: "AI DEVELOPER",
  status: "DEPLOYED @ BROWSERSTACK",
  location: "Nagpur, India",
};

/** Contact — edit once, used everywhere. */
export const contact = {
  email: "aniketcharjan3@gmail.com",
  linkedin: { url: "https://www.linkedin.com/in/aniket-charjan/", label: "/in/aniket-charjan" },
  github: { url: "https://github.com/jason-bourne-gg", label: "@jason-bourne-gg" },
  phone: { display: "+91 90212 94482", e164: "+919021294482" },
  oldPortfolio: "https://portfolio-aniket.web.app/",
};

/** Hero scoreboard. `value` animates from 0 → `value`, then `suffix` appends. */
export const stats = [
  { value: 3.5, suffix: "+", label: "YEARS XP" },
  { value: 90, suffix: "%", label: "LATENCY CUT" },
  { value: 370, suffix: "%", label: "REVENUE LIFT" },
  { value: 22, suffix: "", label: "COUNTRIES" },
];

export const aboutParagraphs = [
  "I focus on the hard parts: performance optimization, code quality, and security. Most recently I've gone deep on agentic AI — shipping an autonomous agent at BrowserStack that authors and runs end-to-end browser tests for enterprise web apps, and re-architecting its inference layer to cut latency ~90% while pushing task-success accuracy from 20% to 80%.",
  "Before that, I built backend platforms at Sigmoid Analytics for some of the world's largest CPG companies — budgeting tools spanning 22 countries, performance-marketing systems, and data pipelines harmonizing 25 disparate sources.",
];

export const operatorProfile: { label: string; value: string; accent?: boolean }[] = [
  { label: "ROLE", value: "SWE · AI Products" },
  { label: "BASE", value: "BrowserStack" },
  { label: "SPEC", value: "Backend / Agentic AI" },
  { label: "EDU", value: "IIT Bhubaneswar" },
  { label: "LOCATION", value: "Nagpur, India" },
  { label: "STATUS", value: "Available", accent: true },
];

export type Rarity =
  | "covert"
  | "classified"
  | "restricted"
  | "milspec"
  | "industrial";

export interface SkillCategory {
  name: string;
  rarity: Rarity;
  tier: string;
  items: string[];
}

export const skills: SkillCategory[] = [
  {
    name: "AI / ML",
    rarity: "covert",
    tier: "COVERT",
    items: ["Agentic AI", "LLMs", "SLMs", "RAG Systems", "Prompt Engineering", "Vector DBs", "MCP"],
  },
  {
    name: "Languages",
    rarity: "classified",
    tier: "CLASSIFIED",
    items: ["Python", "JavaScript", "TypeScript", "C++"],
  },
  {
    name: "Backend",
    rarity: "restricted",
    tier: "RESTRICTED",
    items: ["Node.js", "FastAPI", "Flask", "Express.js", "Ruby on Rails", "Django"],
  },
  {
    name: "Infra / DevOps",
    rarity: "milspec",
    tier: "MIL-SPEC",
    items: ["Docker", "Kubernetes", "Kafka", "Redis", "BullMQ"],
  },
  {
    name: "Cloud",
    rarity: "milspec",
    tier: "MIL-SPEC",
    items: ["AWS", "Azure", "GCP"],
  },
  {
    name: "Data / Design",
    rarity: "industrial",
    tier: "INDUSTRIAL",
    items: ["PostgreSQL", "MySQL", "HLD", "LLD"],
  },
];

export interface Experience {
  role: string;
  org: string;
  date: string;
  points: string[];
  stack: string[];
}

export const experience: Experience[] = [
  {
    role: "SWE — AI Products",
    org: "BrowserStack",
    date: "FEB '25 — PRESENT",
    points: [
      "Designed and shipped an autonomous AI agent that authors and executes end-to-end browser tests for enterprise web apps — planner-executor loop, Playwright tool-use via MCP, RAG over historical test artifacts, and live step-level observability.",
      "Re-architected the inference layer from monolithic LLM calls to a tiered LLM → SLM → SDK routing pipeline: median response time cut ~90%, task-success accuracy lifted 20% → 60% → 80%, per-session cost down ~80% ($5 → <$1).",
      "Built the enterprise integration surface — Salesforce SSO, RBAC, and cross-product hooks into Test Suites, Builds & Automate — plus structured tracing and eval gates that make agent behavior debuggable in production.",
    ],
    stack: ["Ruby on Rails", "Node.js", "TypeScript", "React", "LLMs/SLMs", "MCP", "BullMQ", "Redis", "MySQL", "Docker", "K8s", "AWS"],
  },
  {
    role: "SDE-1 — Backend",
    org: "Sigmoid Analytics",
    date: "JAN '24 — JAN '25",
    points: [
      "Core member of a three-person backend team digitizing the annual budgeting & auditing process for the world's largest soft-drink seller.",
      "Built a tool to allocate yearly budgets across ~70 tiers per brand using ML to optimize distribution from prior revenue and sales forecasts — bottlers across 22 countries upload expenses against these tiers.",
      "Delivered real-time analytics on KPIs previously unattainable: expense ageing, rejection rates, approval times, taxonomy adherence, and backdated-entry rates.",
    ],
    stack: ["Node.js", "MySQL", "React", "Azure", "Docker", "K8s"],
  },
  {
    role: "ASDE — Backend",
    org: "Sigmoid Analytics",
    date: "JUL '22 — DEC '23",
    points: [
      "Built the entire backend of a performance-marketing tool for a CPG giant, driving a 370% revenue increase for products marketed via Amazon Ads (Digital Display).",
      "Cut ad-order creation from days to minutes with product-specific audience targeting; an ML core tracked 42 KPIs daily to recommend ad-group changes. Included an admin panel and role-based authorization.",
      "Engineered a data pipeline harmonizing 25 disparate sources (structured, semi-structured, IoT streams, third-party APIs) into a unified schema on Amazon EMR, monitored with CloudWatch.",
    ],
    stack: ["Python", "FastAPI", "Flask", "Django", "SQL", "AWS EMR", "CloudWatch"],
  },
];

export interface Metric {
  num: string;
  label: string;
}

export interface Project {
  rank: string;
  kicker: string;
  title: string;
  desc: string;
  stack: string[];
  variant: "feature" | "media" | "default";
  media?: string;
  mediaTag?: string;
  repo?: string;
  live?: string;
  metrics?: Metric[];
  /** Short status caveat shown under the description (e.g. a demo that is partly offline). */
  note?: string;
}

/**
 * SIDE PROJECTS ONLY. Full-time work lives in `experience` (the Deployment
 * Log) — don't list employment here.
 */
export const projects: Project[] = [
  {
    rank: "A+",
    kicker: "// AI · APP BUILDER",
    title: "Genesis",
    desc: "An AI app builder for HighLevel: describe an internal tool in a chat box and Claude writes it, streaming into a Monaco editor while a sandboxed preview runs the result against your own contacts and calendars. Generated code is untrusted throughout — opaque origin, no tokens in the browser, every HighLevel call re-checked server-side. Writes and extended reads ship dark behind per-account feature flags. 539 tests, 91% coverage.",
    stack: ["TypeScript", "Vue 3", "Claude API", "SSE", "Cloud Functions", "Firestore", "Monaco", "OAuth 2.0"],
    variant: "media",
    media: "/genesis.png",
    mediaTag: "LIVE · AI",
    repo: "https://github.com/jason-bourne-gg/genesis-highlevel-app-builder",
    live: "https://genesysbe-cbd7e.web.app",
    note: "Generation is off on the live demo — the model API key has been removed, so prompts will not run. Sign-in, OAuth and the preview still work.",
  },
  {
    rank: "A+",
    kicker: "// GAME · MULTIPLAYER",
    title: "Road Clash",
    desc: "A pseudo-3D, Road Rash–style combat racer that runs entirely in the browser — race AI rivals solo or spin up a room and brawl with friends over peer-to-peer WebRTC, no server, no accounts. Client-side prediction keeps controls local-feeling; remote riders are snapshot-interpolated to hide jitter, and a seeded RNG builds an identical track on every peer.",
    stack: ["TypeScript", "Canvas 2D", "WebRTC", "Trystero", "Vite", "Procedural Audio"],
    variant: "media",
    media: "/road-clash.png",
    mediaTag: "LIVE · BROWSER",
    repo: "https://github.com/jason-bourne-gg/road-clash",
    live: "https://road-clash.vercel.app",
  },
  {
    rank: "A",
    kicker: "// WEBRTC · P2P",
    title: "DirectDrop",
    desc: "Send a file straight to another browser over WebRTC — pick a file, share a link, and it streams peer-to-peer with live progress. No upload, no server, no accounts; the bytes never touch a backend. Trystero handles signaling over public infrastructure, files are auto-chunked, and the receiver reassembles them in-memory.",
    stack: ["TypeScript", "WebRTC", "Trystero", "Vite"],
    variant: "media",
    media: "/direct-drop.png",
    mediaTag: "LIVE · P2P",
    live: "https://direct-drop-sigma.vercel.app",
    repo: "https://github.com/jason-bourne-gg/DirectDrop",
  },
  {
    rank: "A",
    kicker: "// MCP · OPEN SOURCE",
    title: "Resume MCP Server",
    desc: "An MCP server that exposes my resume as a queryable API for AI assistants — add it to Claude or Cursor and ask about my background, answered from sourced data. Implements all three MCP primitives: tools, resources, and prompts.",
    stack: ["TypeScript", "MCP", "@modelcontextprotocol/sdk", "Node.js"],
    variant: "feature",
    repo: "https://github.com/jason-bourne-gg/my-mcp-server",
    metrics: [
      { num: "11", label: "tools" },
      { num: "3", label: "resources" },
      { num: "2", label: "prompts" },
    ],
  },
  {
    rank: "B+",
    kicker: "// BROWSER · AGENTS",
    title: "Web Clipper Extension",
    desc: "A Chrome extension that extracts any page's main content into clean, LLM-ready Markdown or JSON in one click — strips nav, ads, and boilerplate, handles tables and metadata. Built for feeding pages to agents (not PDFs).",
    stack: ["Chrome MV3", "JavaScript", "DOM", "HTML→Markdown"],
    variant: "default",
    repo: "https://github.com/jason-bourne-gg/web-clipper-extension",
  },
  {
    rank: "B+",
    kicker: "// DATA · STREAMING",
    title: "YouTube Streaming & Alert System",
    desc: "Pulls video stats from YouTube playlists, Avro-serializes them onto a Kafka topic, processes the stream, and dispatches alerts to a Telegram bot via Confluent HTTP connectors.",
    stack: ["Python", "Kafka", "Avro", "APIs"],
    variant: "default",
  },
];

export const education = {
  primary: {
    badge: "IIT",
    degree: "Integrated Masters",
    school: "IIT Bhubaneswar",
    meta: "2017 — 2022 · CGPA 8.60/10",
  },
  rows: [
    { label: "Class XII — MH Board", meta: "2017 · 88%" },
    { label: "Class X — CBSE", meta: "2015 · 10/10" },
  ],
};

export const nav = [
  { href: "#about", label: "// ABOUT" },
  { href: "#arsenal", label: "// ARSENAL" },
  { href: "#experience", label: "// DEPLOYMENTS" },
  { href: "#operations", label: "// OPERATIONS" },
  { href: "#contact", label: "// CONTACT" },
];
