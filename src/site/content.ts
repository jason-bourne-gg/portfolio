/* =====================================================================
   CONTENT — every word on the site lives here.
   Components render it; they never hold copy of their own.
   ===================================================================== */

export const me = {
  name: "Aniket Charjan",
  fullName: "Aniket Ravindra Charjan",
  role: "Software engineer",
  place: "Nagpur, India",
};

export const contact = {
  email: "aniketcharjan3@gmail.com",
  github: { url: "https://github.com/jason-bourne-gg", label: "jason-bourne-gg" },
  linkedin: { url: "https://www.linkedin.com/in/aniket-charjan/", label: "aniket-charjan" },
  phone: { display: "+91 90212 94482", e164: "+919021294482" },
};

export const sections = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "toolkit", label: "Toolkit" },
  { id: "contact", label: "Contact" },
] as const;

/** Hero headline, one array entry per rendered line. */
export const headline = [
  "I make autonomous systems",
  "fast enough, cheap enough,",
  "and accurate enough to ship.",
];

export const standfirst =
  "I'm a software engineer at BrowserStack, where I build an AI agent that writes and runs end-to-end browser tests for enterprise web apps.";

/** The three proof points, each a measured before → after. */
export const shifts = [
  { label: "Agent task success", from: "20%", to: "80%" },
  { label: "Cost per session", from: "$5", to: "under $1" },
  { label: "Creating an ad order", from: "days", to: "minutes" },
];

export const about = {
  standfirst: "Backend systems, and lately the agents that drive them.",
  paragraphs: [
    "I spend my time on the parts that are hard to fake: latency, correctness, and security. Most recently that has meant agentic AI — shipping an autonomous agent at BrowserStack that authors and runs end-to-end browser tests for enterprise apps, then rebuilding its inference layer so it answers roughly ten times faster and succeeds four times as often.",
    "Before that I built backend platforms at Sigmoid Analytics for some of the world's largest consumer-goods companies: a budgeting tool used by bottlers in 22 countries, a performance-marketing system that lifted revenue 370%, and a pipeline that folded 25 unrelated data sources into one schema.",
  ],
  facts: [
    { label: "Currently", value: "BrowserStack, AI Products" },
    { label: "Focus", value: "Backend and agentic AI" },
    { label: "Studied", value: "IIT Bhubaneswar" },
    { label: "Based in", value: "Nagpur, India" },
    { label: "Experience", value: "3.5 years" },
    { label: "Open to", value: "New conversations" },
  ],
};

export interface Role {
  title: string;
  org: string;
  period: string;
  points: string[];
  stack: string[];
}

export const work: Role[] = [
  {
    title: "Software engineer, AI Products",
    org: "BrowserStack",
    period: "Feb 2025 — present",
    points: [
      "Designed and shipped an autonomous agent that writes and runs end-to-end browser tests for enterprise web apps: a planner-executor loop, Playwright tool use over MCP, retrieval across historical test artifacts, and step-level observability while it runs.",
      "Rebuilt the inference layer from single large-model calls into a tiered pipeline that routes between a large model, a small one, and the SDK directly. Median response time fell about 90%, task success went 20% to 60% to 80%, and cost per session dropped from $5 to under $1.",
      "Built the enterprise surface around it — Salesforce sign-in, role-based access, and hooks into Test Suites, Builds and Automate — plus the tracing and evaluation gates that make agent behaviour debuggable in production.",
    ],
    stack: ["Ruby on Rails", "Node.js", "TypeScript", "React", "LLMs and SLMs", "MCP", "BullMQ", "Redis", "MySQL", "Docker", "Kubernetes", "AWS"],
  },
  {
    title: "Backend engineer, SDE-1",
    org: "Sigmoid Analytics",
    period: "Jan 2024 — Jan 2025",
    points: [
      "One of three backend engineers replacing the annual budgeting and audit process of the world's largest soft-drink company with software.",
      "Built the allocator that spreads a yearly budget across roughly 70 tiers per brand, using prior revenue and sales forecasts to shape the split. Bottlers in 22 countries file their expenses against those tiers.",
      "Added the reporting the finance team had never had: expense ageing, rejection rates, approval times, taxonomy adherence, and how often entries were backdated.",
    ],
    stack: ["Node.js", "MySQL", "React", "Azure", "Docker", "Kubernetes"],
  },
  {
    title: "Backend engineer, ASDE",
    org: "Sigmoid Analytics",
    period: "Jul 2022 — Dec 2023",
    points: [
      "Built the entire backend of a performance-marketing tool for a consumer-goods giant. Revenue on products advertised through Amazon Ads rose 370%.",
      "Cut ad-order creation from days to minutes with product-specific audience targeting, and added a model that read 42 daily metrics to recommend changes to each ad group.",
      "Engineered the pipeline behind it: 25 sources — relational, semi-structured, IoT streams and third-party APIs — harmonised into one schema on Amazon EMR and watched through CloudWatch.",
    ],
    stack: ["Python", "FastAPI", "Flask", "Django", "SQL", "Amazon EMR", "CloudWatch"],
  },
];

export interface Project {
  name: string;
  kind: string;
  blurb: string;
  stack: string[];
  image?: string;
  /** Set when the screenshot must not be cropped. */
  fit?: "cover" | "contain";
  repo?: string;
  live?: string;
  note?: string;
}

/** Side projects only — paid work lives in `work`. */
export const featured: Project[] = [
  {
    name: "Genesis",
    kind: "AI app builder",
    blurb:
      "Describe an internal tool in a chat box and Claude writes it, streaming into a Monaco editor while a sandboxed preview runs the result against your own contacts and calendars. The generated code is treated as untrusted the whole way through: opaque origin, no tokens in the browser, and every call back to HighLevel re-checked on the server. Writes ship dark behind per-account flags. 539 tests, 91% coverage.",
    stack: ["TypeScript", "Vue 3", "Claude API", "Server-sent events", "Cloud Functions", "Firestore", "Monaco", "OAuth 2.0"],
    image: "/genesis.png",
    fit: "contain",
    repo: "https://github.com/jason-bourne-gg/genesis-highlevel-app-builder",
    live: "https://genesysbe-cbd7e.web.app",
    note: "Generation is switched off in the live demo — the model key has been removed, so prompts won't run. Sign-in, OAuth and the preview still work.",
  },
  {
    name: "Road Clash",
    kind: "Multiplayer game",
    blurb:
      "A pseudo-3D combat racer in the spirit of Road Rash that runs entirely in the browser. Race the AI alone, or open a room and brawl with friends over peer-to-peer WebRTC — no server, no accounts. Client-side prediction keeps the controls feeling local, remote riders are snapshot-interpolated to hide jitter, and a seeded generator builds an identical track on every machine.",
    stack: ["TypeScript", "Canvas 2D", "WebRTC", "Trystero", "Vite", "Procedural audio"],
    image: "/road-clash.png",
    repo: "https://github.com/jason-bourne-gg/road-clash",
    live: "https://road-clash.vercel.app",
  },
  {
    name: "DirectDrop",
    kind: "Peer-to-peer file transfer",
    blurb:
      "Send a file straight to someone else's browser. Pick it, share the link, and it streams peer-to-peer with live progress — nothing is uploaded, and the bytes never touch a backend. Signalling rides public infrastructure, files are chunked automatically, and the receiver reassembles them in memory.",
    stack: ["TypeScript", "WebRTC", "Trystero", "Vite"],
    image: "/direct-drop.png",
    repo: "https://github.com/jason-bourne-gg/DirectDrop",
    live: "https://direct-drop-sigma.vercel.app",
  },
];

export const alsoBuilt: Project[] = [
  {
    name: "Resume MCP Server",
    kind: "Developer tool",
    blurb:
      "My CV as a queryable API for AI assistants. Add it to Claude or Cursor and ask about my background; answers come from sourced data, not a guess. Implements all three MCP primitives — 11 tools, 3 resources, 2 prompts.",
    stack: ["TypeScript", "MCP", "Node.js"],
    repo: "https://github.com/jason-bourne-gg/my-mcp-server",
  },
  {
    name: "Web Clipper",
    kind: "Chrome extension",
    blurb:
      "Turns any page into clean Markdown or JSON in one click — navigation, ads and boilerplate stripped, tables and metadata kept. Built for feeding pages to agents rather than printing them.",
    stack: ["Chrome MV3", "JavaScript", "HTML to Markdown"],
    repo: "https://github.com/jason-bourne-gg/web-clipper-extension",
  },
  {
    name: "YouTube alerting",
    kind: "Streaming pipeline",
    blurb:
      "Pulls video statistics from playlists, serialises them onto a Kafka topic with Avro, processes the stream, and pushes alerts to a Telegram bot through Confluent HTTP connectors.",
    stack: ["Python", "Kafka", "Avro"],
  },
];

export const toolkit = [
  { group: "AI and machine learning", items: ["Agentic systems", "LLMs", "Small language models", "Retrieval-augmented generation", "Prompt engineering", "Vector databases", "MCP"] },
  { group: "Languages", items: ["Python", "JavaScript", "TypeScript", "C++"] },
  { group: "Backend", items: ["Node.js", "FastAPI", "Flask", "Express", "Ruby on Rails", "Django"] },
  { group: "Infrastructure", items: ["Docker", "Kubernetes", "Kafka", "Redis", "BullMQ"] },
  { group: "Cloud", items: ["AWS", "Azure", "Google Cloud"] },
  { group: "Data and design", items: ["PostgreSQL", "MySQL", "High-level design", "Low-level design"] },
];

export const education = [
  { title: "Integrated Masters, IIT Bhubaneswar", meta: "2017 — 2022, CGPA 8.60 of 10" },
  { title: "Class XII, Maharashtra State Board", meta: "2017, 88%" },
  { title: "Class X, CBSE", meta: "2015, 10 of 10" },
];

export const closing = {
  line: "Have something hard to build?",
  blurb: "I read everything that lands here, and I answer.",
};
