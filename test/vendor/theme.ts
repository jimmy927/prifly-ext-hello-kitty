/**
 * Vendored, trimmed copy of prifly's `packages/wire/src/theme.ts` (as of
 * 2026-09-26), stripped of the zod schemas this extension's tests have no use
 * for — just the token list `validateTheme` needs. This extension has no
 * runtime dependency on prifly; refresh this file by hand if prifly's own
 * copy adds or renames a token.
 */

export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_TOKENS = {
  background: "chrome",
  foreground: "chrome",
  card: "chrome",
  "card-foreground": "chrome",
  popover: "chrome",
  "popover-foreground": "chrome",
  primary: "chrome",
  "primary-foreground": "chrome",
  secondary: "chrome",
  "secondary-foreground": "chrome",
  muted: "chrome",
  "muted-foreground": "chrome",
  accent: "chrome",
  "accent-foreground": "chrome",
  destructive: "chrome",
  "destructive-foreground": "chrome",
  border: "chrome",
  input: "chrome",
  ring: "chrome",
  favourite: "chrome",
  "favourite-surface": "chrome",
  backdrop: "chrome",
  "badge-foreground": "chrome",
  "terminal-background": "chrome",
  "terminal-foreground": "chrome",
  "terminal-bar": "chrome",
  "terminal-bar-foreground": "chrome",
  "viz-grid": "chrome",
  "viz-muted": "state",
  "viz-good": "state",
  "viz-warning": "state",
  "viz-critical": "state",
  "viz-running": "state",
  "viz-merged": "state",
  "ink-good": "state",
  "ink-warning": "state",
  "ink-critical": "state",
  "ink-running": "state",
  "ink-merged": "state",
  "ink-agent": "state",
  "ink-muted": "state",
  "ink-repeat": "state",
  "ink-wakeup": "state",
  "mode-manual": "state",
  "mode-plan": "state",
  "mode-accept": "state",
  "mode-danger": "state",
  "mode-auto": "state",
  "kind-wsl": "state",
  "kind-windows": "state",
  "kind-cloud": "state",
  "kind-ssh": "state",
} as const satisfies Record<string, "chrome" | "state">;
export type ThemeToken = keyof typeof THEME_TOKENS;

export function isThemeToken(name: string): name is ThemeToken {
  return Object.hasOwn(THEME_TOKENS, name);
}

/** The only colour form a theme may use: one form, so every value can be measured. */
export const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;

/** A token map as declared: `{"--primary": "#e86aa6"}`. Checked by `validateTheme`, not here. */
export type ThemeTokenMap = Record<string, string>;
