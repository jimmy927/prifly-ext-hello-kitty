/**
 * The manifest's shape, and its themes against prifly's own contrast check
 * (vendored in `test/vendor/`, see that folder's comments). Both themes must
 * pass with no state-token reverts, so a reader who picks Hello Kitty or
 * Kuromi still sees a failed tool as failed. A chrome warning is allowed —
 * the theme's own look, which the reader can see and undo — but this
 * extension aims to ship with none, so any is treated as a regression here.
 */

import { expect, test } from "bun:test";
import { HEX_COLOUR } from "./vendor/theme";
import { validateTheme } from "./vendor/theme-check";

import manifest from "../prifly-extension.json";

test("the manifest has the fields an extension needs", () => {
  expect(manifest.id).toBe("hello-kitty");
  expect(manifest.name.length).toBeGreaterThan(0);
  expect(manifest.version.length).toBeGreaterThan(0);
});

test("the skin points at a real stylesheet, and sets no font-family or prifly token", () => {
  expect(manifest.skin.folder).toBe("skin");
  expect(manifest.skin.styles).toContain("hello-kitty.css");

  const css = Bun.file(
    new URL(`../${manifest.skin.folder}/${manifest.skin.styles[0]}`, import.meta.url),
  );
  return css.text().then((text) => {
    expect(text).not.toMatch(/^\s*:root\s*\{/m);
    expect(text).not.toMatch(/\.dark\s*\{/);
    expect(text).not.toMatch(/@font-face/);
    expect(text).not.toMatch(/font-family/);
    expect(text).not.toMatch(/--radius/);
    // Bare, unscoped selectors a decoration must not use — as a whole selector
    // on its own line, not `[data-part="window"] *` or `.dark [data-part="window"]`.
    const selectorLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("{"));
    for (const line of selectorLines) {
      expect(line).not.toMatch(/^body\s*\{/);
      expect(line).not.toMatch(/^\*\s*\{/);
      expect(line).not.toMatch(/^:root\s*\{/);
    }
  });
});

test("every theme names a font this manifest also declares", () => {
  const fontIds = new Set(manifest.fonts.map((font) => font.id));
  for (const theme of manifest.themes) {
    if (theme.font !== "") expect(fontIds.has(theme.font)).toBe(true);
  }
});

test("every theme has at least one mode, as #rrggbb tokens only", () => {
  for (const theme of manifest.themes) {
    const modes = [theme.light, theme.dark].filter((m): m is Record<string, string> => m != null);
    expect(modes.length).toBeGreaterThan(0);
    for (const tokens of modes) {
      for (const [key, value] of Object.entries(tokens)) {
        expect(key.startsWith("--")).toBe(true);
        expect(HEX_COLOUR.test(value)).toBe(true);
      }
    }
  }
});

test("kuromi is dark-only, per the brief", () => {
  const kuromi = manifest.themes.find((theme) => theme.id === "kuromi");
  expect(kuromi?.light).toBeUndefined();
  expect(kuromi?.dark).toBeDefined();
});

for (const theme of manifest.themes) {
  for (const mode of ["light", "dark"] as const) {
    const declared = theme[mode];
    if (declared == null) continue;
    test(`${theme.id} (${mode}) passes validateTheme with no reverts and no warnings`, () => {
      const { notes } = validateTheme(declared, mode);
      const reverts = notes.filter(
        (note) => note.kind === "reverted" || note.kind === "indistinct",
      );
      expect(reverts).toEqual([]);
      expect(notes).toEqual([]);
    });
  }
}
