import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  CalendarCheck,
  ChartColumn,
  ChartLine,
  CircleCheck,
  ClipboardCheck,
  Code,
  Combine,
  Crown,
  Database,
  Dumbbell,
  EyeOff,
  FileWarning,
  Gamepad2,
  Globe,
  GraduationCap,
  Highlighter,
  ListChecks,
  Map,
  Medal,
  MessagesSquare,
  Move,
  Palette,
  Presentation,
  Rocket,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TextCursorInput,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import type { BrandColor } from "@/components/site/section";

export type { BrandColor };

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Learn", href: "#how-it-works" },
  { label: "Games", href: "#games" },
  { label: "AI Tools", href: "#ai-team" },
  { label: "SkillTech", href: "#skilltech" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;

/* ---------------------------------- Games --------------------------------- */

export type GameCategory =
  | "Solo"
  | "Multiplayer"
  | "Speed"
  | "Memory"
  | "Practice";

export const GAME_CATEGORIES: ("All" | GameCategory)[] = [
  "All",
  "Solo",
  "Multiplayer",
  "Speed",
  "Memory",
  "Practice",
];

export interface Game {
  name: string;
  tagline: string;
  description: string;
  categories: GameCategory[];
  icon: LucideIcon;
  color: BrandColor;
  xp: number;
  mode: string;
}

export const GAMES: Game[] = [
  {
    name: "Quiz Battle",
    tagline: "Real-time 1v1 duels",
    description:
      "Battle a classmate on any topic. Fastest correct answer takes the round.",
    categories: ["Multiplayer", "Practice"],
    icon: Swords,
    color: "blue",
    xp: 50,
    mode: "1v1",
  },
  {
    name: "Speed Challenge",
    tagline: "Beat the clock",
    description:
      "Rapid-fire questions against the timer. Build speed without losing accuracy.",
    categories: ["Speed", "Solo"],
    icon: Zap,
    color: "red",
    xp: 80,
    mode: "Solo",
  },
  {
    name: "Memory Match",
    tagline: "Flip, recall, match",
    description:
      "Flip cards and match concept pairs to sharpen recall and long-term retention.",
    categories: ["Memory", "Solo"],
    icon: Brain,
    color: "green",
    xp: 40,
    mode: "Solo",
  },
  {
    name: "Matching Pairs",
    tagline: "Terms ↔ definitions",
    description:
      "Drag terms onto their definitions before the timer runs out.",
    categories: ["Practice", "Memory"],
    icon: Combine,
    color: "yellow",
    xp: 30,
    mode: "Solo",
  },
  {
    name: "Fill in the Blank",
    tagline: "Complete the concept",
    description:
      "Complete sentences, formulas and code snippets with the right word.",
    categories: ["Practice", "Solo"],
    icon: TextCursorInput,
    color: "blue",
    xp: 35,
    mode: "Solo",
  },
  {
    name: "True or False",
    tagline: "Snap verdicts",
    description:
      "One statement at a time — perfect for quick revision on the go.",
    categories: ["Speed", "Solo"],
    icon: CircleCheck,
    color: "red",
    xp: 25,
    mode: "Solo",
  },
  {
    name: "Drag & Drop Lab",
    tagline: "Sort, sequence, build",
    description:
      "Sequence events, sort categories and build diagrams by dragging pieces into place.",
    categories: ["Practice", "Memory"],
    icon: Move,
    color: "green",
    xp: 45,
    mode: "Solo",
  },
  {
    name: "Team Battle",
    tagline: "Squad vs squad",
    description:
      "Classroom mode — teams collaborate to top the weekly leaderboard.",
    categories: ["Multiplayer"],
    icon: Users,
    color: "yellow",
    xp: 120,
    mode: "2–16 players",
  },
  {
    name: "Boss Challenge",
    tagline: "Epic chapter bosses",
    description:
      "End-of-chapter bosses mixing every question type, with bonus XP on the line.",
    categories: ["Solo", "Practice"],
    icon: Crown,
    color: "blue",
    xp: 200,
    mode: "Solo",
  },
  {
    name: "Story Quest",
    tagline: "Learn through adventure",
    description:
      "Narrative quests where every chapter you clear unlocks new skills.",
    categories: ["Solo"],
    icon: Map,
    color: "red",
    xp: 100,
    mode: "Solo",
  },
];

/* -------------------------------- AI Learning Team ------------------------ */

export interface AIBot {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  icon: LucideIcon;
  color: BrandColor;
}

export const AI_BOTS: AIBot[] = [
  {
    name: "AI Tutor",
    role: "Your 24/7 personal teacher",
    description:
      "Explains any concept step by step, at exactly your level, in your language.",
    capabilities: [
      "Step-by-step concept explanations",
      "Adjusts to your learning level",
      "Examples from your own syllabus",
    ],
    icon: GraduationCap,
    color: "blue",
  },
  {
    name: "Doubt Solver",
    role: "Ask anything, instantly",
    description:
      "Stuck on a problem? Get a guided solution — not just the answer.",
    capabilities: [
      "Snap a photo of your doubt",
      "Guided, hint-first solutions",
      "Follow-up questions welcome",
    ],
    icon: MessagesSquare,
    color: "red",
  },
  {
    name: "Practice Bot",
    role: "Infinite practice sets",
    description:
      "Generates fresh questions from your weak topics until they become strengths.",
    capabilities: [
      "Auto-built from your weak spots",
      "Adaptive difficulty",
      "Spaced-repetition scheduling",
    ],
    icon: Dumbbell,
    color: "green",
  },
  {
    name: "Quiz Bot",
    role: "Quizzes on demand",
    description:
      "Turns any chapter, PDF or note into a quiz in seconds.",
    capabilities: [
      "Quiz from any material",
      "Mixed question types",
      "Instant explanations",
    ],
    icon: ListChecks,
    color: "yellow",
  },
  {
    name: "Study Planner",
    role: "Plans that adapt",
    description:
      "Builds a realistic daily plan around your goals, exams and free time.",
    capabilities: [
      "Exam-aware daily plans",
      "Rebalances when life happens",
      "Smart revision windows",
    ],
    icon: CalendarCheck,
    color: "blue",
  },
  {
    name: "Teacher Copilot",
    role: "A teaching assistant for educators",
    description:
      "Lesson plans, question banks and grading help — hours saved every week.",
    capabilities: [
      "Lesson plan drafts",
      "Auto-generated question banks",
      "Class-level insights",
    ],
    icon: Presentation,
    color: "red",
  },
  {
    name: "Progress Analyst",
    role: "See exactly where you stand",
    description:
      "Mastery maps, trend reports and a clear list of what to fix next.",
    capabilities: [
      "Topic-level mastery maps",
      "Weekly progress reports",
      "Next-best-action suggestions",
    ],
    icon: ChartLine,
    color: "green",
  },
  {
    name: "Career Bot",
    role: "Skills → career path",
    description:
      "Maps what you're learning to real careers and tells you what's missing.",
    capabilities: [
      "Career path matching",
      "Skill-gap analysis",
      "Portfolio project ideas",
    ],
    icon: Briefcase,
    color: "yellow",
  },
];

/* -------------------------------- SkillTech ------------------------------- */

export interface SkillTrack {
  name: string;
  tagline: string;
  skills: string[];
  icon: LucideIcon;
  color: BrandColor;
  projects: number;
  large?: boolean;
}

export const SKILL_TRACKS: SkillTrack[] = [
  {
    name: "Coding",
    tagline: "From loops to full apps",
    skills: ["Python", "JavaScript", "DSA", "Git"],
    icon: Code,
    color: "blue",
    projects: 48,
    large: true,
  },
  {
    name: "AI & Machine Learning",
    tagline: "Build smart, stay ahead",
    skills: ["Prompting", "ML basics", "AI tools"],
    icon: Bot,
    color: "red",
    projects: 22,
  },
  {
    name: "Web Development",
    tagline: "Ship sites people love",
    skills: ["HTML/CSS", "React", "APIs"],
    icon: Globe,
    color: "green",
    projects: 36,
  },
  {
    name: "Cyber Security",
    tagline: "Think like a defender",
    skills: ["Safety", "Ethics", "Forensics"],
    icon: ShieldCheck,
    color: "yellow",
    projects: 14,
  },
  {
    name: "UI / UX Design",
    tagline: "Design that feels right",
    skills: ["Figma", "Wireframes", "Systems"],
    icon: Palette,
    color: "blue",
    projects: 26,
  },
  {
    name: "Data Science",
    tagline: "Numbers into stories",
    skills: ["Excel", "SQL", "Dashboards"],
    icon: Database,
    color: "red",
    projects: 19,
  },
  {
    name: "Communication",
    tagline: "Be clearly understood",
    skills: ["Speaking", "Writing", "Debate"],
    icon: MessagesSquare,
    color: "green",
    projects: 12,
  },
  {
    name: "Career Skills",
    tagline: "Ready for the real world",
    skills: ["Résumé", "Interviews", "Portfolio"],
    icon: Rocket,
    color: "yellow",
    projects: 16,
  },
];

/* ----------------------------- How it works ------------------------------- */

export interface Step {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: BrandColor;
}

export const HOW_IT_WORKS: Step[] = [
  {
    step: 1,
    title: "Upload",
    description: "Add your syllabus, notes, PDFs or past papers.",
    icon: Upload,
    color: "blue",
  },
  {
    step: 2,
    title: "AI",
    description: "Lucous maps what you know — and what you don't.",
    icon: Sparkles,
    color: "red",
  },
  {
    step: 3,
    title: "Learn",
    description: "Bite-sized lessons built just for your gaps.",
    icon: BookOpen,
    color: "yellow",
  },
  {
    step: 4,
    title: "Play",
    description: "Lock it in with games instead of grinding.",
    icon: Gamepad2,
    color: "green",
  },
  {
    step: 5,
    title: "Practice",
    description: "Targeted sets on your weak spots only.",
    icon: Target,
    color: "blue",
  },
  {
    step: 6,
    title: "Test",
    description: "Real exam-like assessments, zero fear.",
    icon: ClipboardCheck,
    color: "red",
  },
  {
    step: 7,
    title: "Analyze",
    description: "See mastery, not just marks.",
    icon: ChartColumn,
    color: "yellow",
  },
  {
    step: 8,
    title: "Improve",
    description: "Smart revision loops until it sticks — then repeat.",
    icon: TrendingUp,
    color: "green",
  },
];

/* -------------------------------- Problem --------------------------------- */

export interface PainPoint {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PAIN_POINTS: PainPoint[] = [
  {
    title: "One pace for everyone",
    description:
      "Classes move on whether you understood or not. Gaps quietly stack up chapter after chapter.",
    icon: Users,
  },
  {
    title: "Passive studying doesn't stick",
    description:
      "Highlighting and re-reading feel productive, but most of it fades within days.",
    icon: Highlighter,
  },
  {
    title: "Tests feel like verdicts",
    description:
      "Scores label students instead of showing them exactly what to fix next.",
    icon: FileWarning,
  },
  {
    title: "Blind spots go unnoticed",
    description:
      "You don't know what you don't know — until the exam finds it for you.",
    icon: EyeOff,
  },
];

/* --------------------------------- Pricing -------------------------------- */

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthly: number | null;
  yearlyMonthly: number | null;
  unit?: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
  ctaVariant: "default" | "outline";
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For curious learners getting started",
    monthly: 0,
    yearlyMonthly: 0,
    features: [
      "3 starter courses",
      "5 learning games",
      "50 AI questions per month",
      "Basic progress tracking",
      "Community leaderboard",
    ],
    cta: "Start for free",
    ctaVariant: "outline",
  },
  {
    id: "student-pro",
    name: "Student Pro",
    tagline: "For learners who want it all",
    monthly: 299,
    yearlyMonthly: 239,
    badge: "Most popular",
    highlighted: true,
    features: [
      "All courses & crash programs",
      "All 10+ learning games",
      "Unlimited AI Learning Team",
      "Personalized study plans",
      "Advanced mastery analytics",
      "Priority support",
    ],
    cta: "Get Student Pro",
    ctaVariant: "default",
  },
  {
    id: "teacher-pro",
    name: "Teacher Pro",
    tagline: "For educators who save hours weekly",
    monthly: 499,
    yearlyMonthly: 399,
    features: [
      "Unlimited classes & students",
      "Teacher Copilot AI assistant",
      "Assignments & auto-grading",
      "Class analytics & reports",
      "Gamified homework modes",
    ],
    cta: "Get Teacher Pro",
    ctaVariant: "outline",
  },
  {
    id: "school",
    name: "School",
    tagline: "For institutions, per classroom or campus",
    monthly: 99,
    yearlyMonthly: 79,
    unit: "per student / month",
    features: [
      "Everything in Teacher Pro",
      "School-wide analytics dashboard",
      "White-label & custom branding",
      "Onboarding & teacher training",
      "Dedicated success manager",
    ],
    cta: "Book a demo",
    ctaVariant: "outline",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For groups, networks & custom deployments",
    monthly: null,
    yearlyMonthly: null,
    features: [
      "SSO & advanced security",
      "API & LMS integrations",
      "Custom AI model hosting",
      "SLA & 24/7 support",
      "Volume pricing",
    ],
    cta: "Contact sales",
    ctaVariant: "outline",
  },
];

/* ------------------------------ Testimonials ------------------------------ */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: BrandColor;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Placeholder — replace with a real story. Something like: “I stopped dreading study time. The streak somehow makes me open the app every single day.”",
    name: "Aarav S.",
    role: "Class 12 student · placeholder",
    initials: "AS",
    color: "blue",
  },
  {
    quote:
      "Placeholder — replace with a real story. Something like: “The weak-topic radar found gaps I didn't know I had before my boards.”",
    name: "Priya M.",
    role: "Class 10 student · placeholder",
    initials: "PM",
    color: "red",
  },
  {
    quote:
      "Placeholder — replace with a real story. Something like: “Assigning a Team Battle takes me two minutes and my class actually asks for homework now.”",
    name: "R. Sharma",
    role: "Mathematics teacher · placeholder",
    initials: "RS",
    color: "green",
  },
  {
    quote:
      "Placeholder — replace with a real story. Something like: “I went from avoiding aptitude tests to clearing my placement round in six weeks.”",
    name: "Karan V.",
    role: "Final-year student · placeholder",
    initials: "KV",
    color: "yellow",
  },
  {
    quote:
      "Placeholder — replace with a real story. Something like: “We can finally see mastery at a class level instead of waiting for term exams.”",
    name: "Dr. N. Iyer",
    role: "School principal · placeholder",
    initials: "NI",
    color: "blue",
  },
  {
    quote:
      "Placeholder — replace with a real story. Something like: “The AI Tutor explains things at my level — I ask the ‘dumb' questions I'd never ask in class.”",
    name: "Sana K.",
    role: "Class 9 student · placeholder",
    initials: "SK",
    color: "red",
  },
];

/* ---------------------------------- FAQ ----------------------------------- */

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "What exactly is LUCOUS?",
    a: "LUCOUS is an AI-powered, gamified learning platform. We turn your syllabus into bite-sized lessons, let you practice through games, test you like a real exam, and show you exactly what to improve next. Learn. Play. Test. Improve.",
  },
  {
    q: "Is LUCOUS free to use?",
    a: "Yes. The Free plan includes starter courses, five learning games, a monthly quota of AI questions and basic progress tracking — free forever, no credit card. Student Pro unlocks everything, and placeholder pricing is shown above.",
  },
  {
    q: "How does the AI Learning Team actually work?",
    a: "Every AI assistant is API-ready: the product ships with the full chat, prompt and safety layer, and connects to an LLM provider. You can bring your own provider (OpenAI, Gemini, Claude and others) or use a managed setup. Nothing on this page fakes live AI — the interfaces are production previews.",
  },
  {
    q: "Which classes, exams and skills do you cover?",
    a: "Academics for Classes 8–12 (NCERT-aligned), exam prep for boards, JEE, NEET and aptitude, plus SkillTech tracks like coding, AI/ML, web development, cyber security, UI/UX and communication skills.",
  },
  {
    q: "Can teachers and schools use LUCOUS?",
    a: "Absolutely. Teachers get a dedicated dashboard with class analytics, auto-graded assignments and the Teacher Copilot. Schools get campus-wide analytics, white-labeling and parent reports on the School plan.",
  },
  {
    q: "Do games really help learning?",
    a: "Yes — when built on the right mechanics. LUCOUS games use active recall and spaced repetition, the two best-studied techniques for retention, wrapped in XP, streaks and leaderboards to keep motivation high.",
  },
  {
    q: "What about student data and privacy?",
    a: "Privacy is a product feature: student data is encrypted, never sold, and there are no third-party ads. We are built to comply with child-safety standards like COPPA and India's DPDP Act for school deployments.",
  },
  {
    q: "Which devices does LUCOUS work on?",
    a: "LUCOUS runs on any modern browser — phone, tablet or desktop — and stays in sync. Native mobile apps are on the roadmap.",
  },
];

/* ------------------------------ Gamification ------------------------------ */

export interface BadgeDef {
  name: string;
  description: string;
  icon: LucideIcon;
  color: BrandColor;
  unlocked: boolean;
}

export const BADGES: BadgeDef[] = [
  { name: "First Steps", description: "Complete your first lesson", icon: Sparkles, color: "blue", unlocked: true },
  { name: "Streak Starter", description: "7-day study streak", icon: Zap, color: "yellow", unlocked: true },
  { name: "Speed Demon", description: "Win 10 Speed Challenges", icon: Zap, color: "red", unlocked: true },
  { name: "Boss Slayer", description: "Defeat your first boss", icon: Crown, color: "blue", unlocked: true },
  { name: "Sharp Shooter", description: "95%+ accuracy in a battle", icon: Target, color: "green", unlocked: true },
  { name: "Deep Thinker", description: "Ask the AI Tutor 100 questions", icon: Brain, color: "red", unlocked: false },
  { name: "Team Player", description: "Win 5 Team Battles", icon: Users, color: "green", unlocked: false },
  { name: "Quest Legend", description: "Finish a Story Quest", icon: Medal, color: "yellow", unlocked: false },
];

export interface LeaderboardRow {
  rank: number;
  name: string;
  initials: string;
  xp: number;
  trend: "up" | "down" | "same";
  color: BrandColor;
  isYou?: boolean;
}

export const LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, name: "Ishita R.", initials: "IR", xp: 4120, trend: "up", color: "blue" },
  { rank: 2, name: "Rohan D.", initials: "RD", xp: 3890, trend: "same", color: "red" },
  { rank: 3, name: "Meera J.", initials: "MJ", xp: 3240, trend: "up", color: "green" },
  { rank: 4, name: "You", initials: "You", xp: 2840, trend: "up", color: "yellow", isYou: true },
  { rank: 5, name: "Aditya K.", initials: "AK", xp: 2610, trend: "down", color: "blue" },
];

/* -------------------------------- Search index ---------------------------- */

export interface SearchEntry {
  label: string;
  group: string;
  href: string;
  keywords: string;
}

export const SEARCH_SECTIONS: { label: string; href: string; group: string }[] = [
  { label: "Home", href: "#home", group: "Section" },
  { label: "How Lucous Works", href: "#how-it-works", group: "Section" },
  { label: "Games", href: "#games", group: "Section" },
  { label: "AI Learning Team", href: "#ai-team", group: "Section" },
  { label: "SkillTech", href: "#skilltech", group: "Section" },
  { label: "Student Dashboard", href: "#student-dashboard", group: "Section" },
  { label: "Teacher Dashboard", href: "#teacher-dashboard", group: "Section" },
  { label: "For Schools", href: "#schools", group: "Section" },
  { label: "Pricing", href: "#pricing", group: "Section" },
  { label: "Gamification", href: "#gamification", group: "Section" },
  { label: "Testimonials", href: "#testimonials", group: "Section" },
  { label: "FAQ", href: "#faq", group: "Section" },
  { label: "About Lucous", href: "#about", group: "Section" },
];

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = SEARCH_SECTIONS.map((s) => ({
    label: s.label,
    group: s.group,
    href: s.href,
    keywords: s.label.toLowerCase(),
  }));
  for (const g of GAMES) {
    entries.push({
      label: g.name,
      group: "Game",
      href: "#games",
      keywords: `${g.name} ${g.tagline} ${g.categories.join(" ")} game`.toLowerCase(),
    });
  }
  for (const b of AI_BOTS) {
    entries.push({
      label: b.name,
      group: "AI Bot",
      href: "#ai-team",
      keywords: `${b.name} ${b.role} ${b.description} ai bot`.toLowerCase(),
    });
  }
  for (const t of SKILL_TRACKS) {
    entries.push({
      label: t.name,
      group: "SkillTech",
      href: "#skilltech",
      keywords: `${t.name} ${t.tagline} ${t.skills.join(" ")}`.toLowerCase(),
    });
  }
  return entries;
}
