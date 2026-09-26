/**
 * Vendored, unmodified copy of prifly's `packages/wire/src/theme-check.ts`
 * (as of 2026-09-26): the one check every theme passes before it is drawn.
 * This extension has no runtime dependency on prifly; refresh this file by
 * hand if prifly's own copy changes its rules.
 *
 * - An unknown token, or a value that is not `#rrggbb`, is ignored and named.
 * - Text is held to 4.5:1 against the surface it sits on, a fill (a bar, a
 *   dot) to 3:1 — WCAG's text and non-text minimums. Never more than prifly's
 *   own value reaches on prifly's own surface, though: the amber fill is
 *   1.9:1 on the light card by choice, and a theme is not asked to be
 *   stricter than the window it restyles.
 * - Done, failed, warning and running must stay apart from each other.
 * - A failing STATE token reverts to prifly's value; a failing CHROME token
 *   is kept, with a warning (`theme.ts` says why the two differ).
 */

import {
  HEX_COLOUR,
  isThemeToken,
  THEME_TOKENS,
  type ThemeMode,
  type ThemeTokenMap,
} from "./theme";

/**
 * prifly's own values for every token a check reads, as `src/index.css` in
 * the window has them (a test there holds the two together). Tokens a check
 * never reads — the favourite gold, the backdrop — are left to the stylesheet.
 */
export const BUILTIN_TOKENS: Record<ThemeMode, Readonly<Record<string, string>>> = {
  light: {
    background: "#f8f8f6",
    foreground: "#0a0a0a",
    card: "#fdfdfc",
    "card-foreground": "#0a0a0a",
    popover: "#fdfdfc",
    "popover-foreground": "#0a0a0a",
    primary: "#2977d6",
    "primary-foreground": "#ffffff",
    secondary: "#edece8",
    "secondary-foreground": "#51504d",
    muted: "#efefeb",
    "muted-foreground": "#595854",
    accent: "#edece8",
    "accent-foreground": "#0a0a0a",
    destructive: "#cf3a3a",
    "destructive-foreground": "#ffffff",
    "badge-foreground": "#ffffff",
    "terminal-background": "#1e1e1e",
    "terminal-foreground": "#ffffff",
    "terminal-bar": "#2a2a2a",
    "terminal-bar-foreground": "#d4d4d4",
    "viz-muted": "#898781",
    "viz-good": "#0ca30c",
    "viz-warning": "#fab219",
    "viz-critical": "#d03b3b",
    "viz-running": "#2f7fe0",
    "viz-merged": "#8a5cd6",
    "ink-good": "#16751a",
    "ink-warning": "#8f5200",
    "ink-critical": "#b42323",
    "ink-running": "#1a5fb4",
    "ink-merged": "#6b3fc0",
    "ink-agent": "#0e7490",
    "ink-muted": "#6b6a65",
    "ink-repeat": "#0b6b6b",
    "ink-wakeup": "#9b2f86",
    "mode-manual": "#666666",
    "mode-plan": "#006666",
    "mode-accept": "#8700ff",
    "mode-danger": "#ab2b3f",
    "mode-auto": "#966c1e",
    "kind-wsl": "#1f8a52",
    "kind-windows": "#2f6fd0",
    "kind-cloud": "#8256c4",
    "kind-ssh": "#b4700f",
  },
  dark: {
    background: "#0d0d0d",
    foreground: "#ffffff",
    card: "#1a1a19",
    "card-foreground": "#ffffff",
    popover: "#1a1a19",
    "popover-foreground": "#ffffff",
    primary: "#3886e5",
    "primary-foreground": "#0a0a0a",
    secondary: "#2d2d2a",
    "secondary-foreground": "#c3c2b7",
    muted: "#2c2c2a",
    "muted-foreground": "#c3c2b7",
    accent: "#373734",
    "accent-foreground": "#ffffff",
    destructive: "#e66565",
    "destructive-foreground": "#0a0a0a",
    "badge-foreground": "#ffffff",
    "terminal-background": "#1e1e1e",
    "terminal-foreground": "#ffffff",
    "terminal-bar": "#2a2a2a",
    "terminal-bar-foreground": "#d4d4d4",
    "viz-muted": "#898781",
    "viz-good": "#0ca30c",
    "viz-warning": "#fab219",
    "viz-critical": "#d03b3b",
    "viz-running": "#4c9aff",
    "viz-merged": "#a78bfa",
    "ink-good": "#3cc43c",
    "ink-warning": "#fab219",
    "ink-critical": "#f06a6a",
    "ink-running": "#4c9aff",
    "ink-merged": "#a78bfa",
    "ink-agent": "#22d3ee",
    "ink-muted": "#9a9892",
    "ink-repeat": "#3cc8c8",
    "ink-wakeup": "#f07ad8",
    "mode-manual": "#999999",
    "mode-plan": "#48968c",
    "mode-accept": "#af87ff",
    "mode-danger": "#ff6b80",
    "mode-auto": "#ffc107",
    "kind-wsl": "#3fc47d",
    "kind-windows": "#6ea8fb",
    "kind-cloud": "#b891f5",
    "kind-ssh": "#e0a33a",
  },
};

const TEXT = 4.5;
const FILL = 3;

type Pair = { fg: string; bg: string; min: number };

/** Coloured words and glyphs, each read on the card and on the page. */
const INKS = Object.keys(THEME_TOKENS).filter((name) => /^(ink|kind|mode)-/.test(name));
/** Bars and dots; the grid is a hairline, meant to be faint. */
const FILLS = Object.keys(THEME_TOKENS).filter((name) => /^viz-/.test(name) && name !== "viz-grid");

const PAIRS: readonly Pair[] = [
  ...[
    ["foreground", "background"],
    ["card-foreground", "card"],
    ["popover-foreground", "popover"],
    ["muted-foreground", "muted"],
    ["secondary-foreground", "secondary"],
    ["accent-foreground", "accent"],
    ["primary-foreground", "primary"],
    ["destructive-foreground", "destructive"],
    ["badge-foreground", "viz-running"],
    ["terminal-foreground", "terminal-background"],
    ["terminal-bar-foreground", "terminal-bar"],
  ].map(([fg = "", bg = ""]) => ({ fg, bg, min: TEXT })),
  ...INKS.flatMap((fg) => ["card", "background"].map((bg) => ({ fg, bg, min: TEXT }))),
  ...FILLS.flatMap((fg) => ["card", "background"].map((bg) => ({ fg, bg, min: FILL }))),
];

/** The four states a reader must never confuse, as fills and as text. */
const DISTINCT = [
  ["viz-good", "viz-critical", "viz-warning", "viz-running"],
  ["ink-good", "ink-critical", "ink-warning", "ink-running"],
] as const;

/**
 * How far apart two of them must be, in OKLab. prifly's own closest pair —
 * the light warning and critical inks — is 0.12 apart; a just-noticeable
 * difference is about 0.02.
 */
const MIN_DISTANCE = 0.08;

export type ThemeNote = {
  token: string;
  kind: "unknown" | "invalid" | "reverted" | "low-contrast" | "indistinct";
  message: string;
};

export type ThemeCheck = {
  /** What to apply: the declared tokens that survived, without `--`. */
  tokens: Record<string, string>;
  notes: ThemeNote[];
};

/** Check one mode's declared tokens against prifly's rules; see the file's comment. */
export function validateTheme(declared: ThemeTokenMap, mode: ThemeMode): ThemeCheck {
  const notes: ThemeNote[] = [];
  const tokens = acceptable(declared, notes);
  const builtin = BUILTIN_TOKENS[mode];
  for (const pair of PAIRS) checkPair(pair, tokens, builtin, notes);
  for (const group of DISTINCT) checkDistinct(group, tokens, builtin, notes);
  return { tokens, notes };
}

/** The declared entries that name a known token with a `#rrggbb` value. */
function acceptable(declared: ThemeTokenMap, notes: ThemeNote[]): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(declared)) {
    const name = key.replace(/^--/, "");
    if (!isThemeToken(name)) {
      notes.push({ token: name, kind: "unknown", message: `--${name} is not a token; ignored` });
    } else if (!HEX_COLOUR.test(value)) {
      notes.push({
        token: name,
        kind: "invalid",
        message: `--${name}: "${value}" is not #rrggbb; ignored`,
      });
    } else tokens[name] = value.toLowerCase();
  }
  return tokens;
}

function shown(token: string, tokens: Record<string, string>, builtin: Record<string, string>) {
  return tokens[token] ?? builtin[token] ?? "#000000";
}

function checkPair(
  pair: Pair,
  tokens: Record<string, string>,
  builtin: Readonly<Record<string, string>>,
  notes: ThemeNote[],
): void {
  const { fg, bg } = pair;
  if (tokens[fg] === undefined && tokens[bg] === undefined) return;
  const own = contrast(shown(fg, {}, builtin), shown(bg, {}, builtin));
  const min = Math.min(pair.min, own);
  const ratio = () => contrast(shown(fg, tokens, builtin), shown(bg, tokens, builtin));
  const before = ratio();
  if (before >= min) return;
  // The state tokens of the pair the theme set go back to prifly's.
  for (const token of [fg, bg]) {
    if (tokens[token] === undefined || THEME_TOKENS[token as keyof typeof THEME_TOKENS] !== "state")
      continue;
    delete tokens[token];
    notes.push({
      token,
      kind: "reverted",
      message: `--${token} reverted to prifly's: --${fg} on --${bg} was ${ratioText(before, "down")}, needs ${ratioText(min, "up")}`,
    });
  }
  const after = ratio();
  if (after >= min) return;
  notes.push({
    token: tokens[fg] === undefined ? bg : fg,
    kind: "low-contrast",
    message: `--${fg} on --${bg} is ${ratioText(after, "down")}, needs ${ratioText(min, "up")}`,
  });
}

function checkDistinct(
  group: readonly string[],
  tokens: Record<string, string>,
  builtin: Readonly<Record<string, string>>,
  notes: ThemeNote[],
): void {
  const pairs = group.flatMap((a, i) => group.slice(i + 1).map((b) => [a, b] as const));
  for (const [a, b] of pairs) {
    const set = [a, b].filter((name) => tokens[name] !== undefined);
    if (set.length === 0) continue;
    if (distance(shown(a, tokens, builtin), shown(b, tokens, builtin)) >= MIN_DISTANCE) continue;
    for (const token of set) {
      delete tokens[token];
      notes.push({
        token,
        kind: "indistinct",
        message: `--${token} reverted to prifly's: too close to --${token === a ? b : a}`,
      });
    }
  }
}

/**
 * A ratio in words, to one decimal, rounded away from the other side of the
 * comparison: what a colour has, down; what it needs, up — so a warning can
 * never read "4.5:1, needs 4.5:1".
 */
function ratioText(ratio: number, way: "up" | "down"): string {
  const rounded = way === "up" ? Math.ceil(ratio * 10) / 10 : Math.floor(ratio * 10) / 10;
  return `${rounded.toFixed(1)}:1`;
}

/** `#rrggbb` as linear-light sRGB channels, 0–1. */
function linear(hex: string): [number, number, number] {
  const channel = (at: number) => {
    const v = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5)];
}

/** WCAG 2's contrast ratio of two `#rrggbb` colours, 1 to 21. */
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = linear(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/** How different two colours look: Euclidean distance in OKLab. */
export function distance(a: string, b: string): number {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function oklab(hex: string): [number, number, number] {
  const [r, g, b] = linear(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
