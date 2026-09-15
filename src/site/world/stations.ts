/* =====================================================================
   STATIONS — the places on the map, in the order I got to them.
   School, college, the two employers, a roadside store holding every
   side project, the garage of tools, and a way to get in touch.
   ===================================================================== */

import {
  about,
  alsoBuilt,
  closing,
  contact,
  featured,
  headline,
  standfirst,
  toolkit,
  work,
  type Project,
} from "../content";

export type StationKind = "home" | "school" | "college" | "office" | "store" | "garage" | "finish";

export interface StationLink {
  label: string;
  href: string;
}

export interface StationRole {
  title: string;
  period: string;
  points: string[];
  stack: string[];
}

export interface Station {
  id: string;
  kind: StationKind;
  /** Name on the map marker. */
  sign: string;
  eyebrow?: string;
  title: string;
  body: string[];
  chips?: string[];
  links?: StationLink[];
  accent: number;
  showShifts?: boolean;
  /** An employer can hold more than one role; the card lists each in turn. */
  roles?: StationRole[];
  /** Office proportions, so two employers never look like the same building. */
  tower?: { width: number; height: number; floors: number; columns: number };
  /** Only the store has these: one per item on the rack. */
  shelf?: Project[];
}

const COBALT = 0x1d4bff;
const NAVY = 0x16264f;
const AMBER = 0xf2b705;
const TEAL = 0x1f9e8f;

export const shelf: Project[] = [...featured, ...alsoBuilt];

/** One building per employer, however many roles I held there. */
const employer = (
  org: string,
  roles: (typeof work)[number][],
  accent: number,
  tower: Station["tower"]
): Station => ({
  id: org.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  kind: "office",
  sign: org,
  eyebrow: `${roles[roles.length - 1].period.split(" — ")[0]} — ${
    roles[0].period.split(" — ")[1]
  }`,
  title: org,
  body: [],
  roles: roles.map((role) => ({
    title: role.title,
    period: role.period,
    points: role.points,
    stack: role.stack,
  })),
  accent,
  tower,
});

export const stations: Station[] = [
  {
    id: "start",
    kind: "home",
    sign: "Nagpur",
    eyebrow: "Where the road starts",
    title: headline.join(" "),
    body: [standfirst, ...about.paragraphs],
    accent: COBALT,
    showShifts: true,
  },
  {
    id: "school-x",
    kind: "school",
    sign: "Class X",
    eyebrow: "CBSE, 2015",
    title: "School",
    body: ["Ten out of ten in Class X — the last time anything I did came with a perfect score."],
    accent: AMBER,
  },
  {
    id: "school-xii",
    kind: "school",
    sign: "Class XII",
    eyebrow: "Maharashtra State Board, 2017",
    title: "Two more years, then the entrance exams",
    body: ["Class XII at 88%, and the JEE result that decided the next five years."],
    accent: AMBER,
  },
  {
    id: "iit",
    kind: "college",
    sign: "IIT Bhubaneswar",
    eyebrow: "2017 — 2022",
    title: "Integrated Masters, IIT Bhubaneswar",
    body: [
      "Five years and a CGPA of 8.60 of 10 — and the first software I wrote that other people depended on.",
    ],
    accent: NAVY,
  },
  employer("Sigmoid Analytics", [work[1], work[2]], NAVY, {
    width: 7.6,
    height: 8.4,
    floors: 4,
    columns: 4,
  }),
  employer("BrowserStack", [work[0]], COBALT, {
    width: 5.4,
    height: 14.5,
    floors: 7,
    columns: 3,
  }),
  {
    id: "store",
    kind: "store",
    sign: "Side projects",
    eyebrow: "Everything built after hours",
    title: "The roadside store",
    body: ["Six things I built on my own time. Take one off the rack."],
    accent: TEAL,
    shelf,
  },
  {
    id: "toolkit",
    kind: "garage",
    sign: "The garage",
    eyebrow: "What I reach for",
    title: "Toolkit",
    body: toolkit.map((group) => `${group.group}: ${group.items.join(", ")}.`),
    accent: AMBER,
  },
  {
    id: "contact",
    kind: "finish",
    sign: "Say hello",
    eyebrow: closing.blurb,
    title: closing.line,
    body: [],
    accent: COBALT,
    links: [
      { label: contact.email, href: `mailto:${contact.email}` },
      { label: "GitHub", href: contact.github.url },
      { label: "LinkedIn", href: contact.linkedin.url },
      { label: contact.phone.display, href: `tel:${contact.phone.e164}` },
    ],
  },
];
