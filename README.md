# prifly-ext-hello-kitty

Two colour themes for prifly's theme picker, a font, and a page's worth of
bows and a kitty to go with them.

- **Hello Kitty** — strawberry milk by day, a plum night with pink lights.
- **Kuromi** — black and violet, and only at night.
- Both are set in [Fredoka](https://github.com/hafontia/Fredoka-One)
  (SIL OFL 1.1, `fonts/OFL.txt`) by default — the reader can still pick
  another font without losing the colours.
- A bow on every message you write, a small kitty signing every reply, a
  bigger one keeping watch from the corner of the transcript, and pink
  scrollbars. This part runs under either theme, or any other the reader has
  installed: its own colours are drawn from the active theme's `--primary`
  and `--card`, not fixed pink.

Status colours — a failed tool, a warning, the permission modes — are left as
prifly has them: they mean something.

## Install

Put this folder in `~/.local/share/prifly/extensions/` (or install it from its
git URL in prifly's Extensions dialog) and enable it. Then, in prifly, open
the command palette (Ctrl+K) and run **Switch theme…** to pick Hello Kitty or
Kuromi — enabling the extension only makes them available, the same as any
other theme; it does not switch you onto one by itself. The bows and kitty
apply as soon as the extension is enabled, under whichever theme is active.

## What this extension is made of

The manifest (`prifly-extension.json`) declares three separate things, each
its own slot in prifly:

- **`themes`** — colour tokens only, for light and/or dark, checked by prifly
  for contrast before they are drawn (`validateTheme`). One theme is active
  at a time, exactly like choosing a theme in any other editor.
- **`fonts`** — a family and the files that draw it. A theme may name one as
  its default (`"font": "fredoka"`), which the reader can still override.
- **`skin`** — the CSS in `skin/hello-kitty.css`: the bows, the kitty, the
  ribbon header, the pink scrollbars. It sets none of prifly's own tokens and
  no font; it only reads the active theme's tokens and dresses the regions
  prifly names with `data-part` (`window`, `header`, `sessions`, `main`,
  `side-panel`, `composer`, `status-bar`, `human-message`,
  `assistant-message`). That is what lets it run under Hello Kitty, Kuromi, or
  a theme this extension has never heard of.

The artwork in `skin/img` is drawn for this extension.

## License and contributing

Source-available under the Functional Source License 1.1 with an Apache 2.0 future license (`LICENSE.md`): use it, change it and fix it freely, but not to offer a competing product. Each version becomes Apache 2.0 two years after its release.

Pull requests are welcome. Before one can be merged, its author signs the contributor agreement (`CLA.md`), which assigns the copyright in the contribution to The Startup Factory AB; the CLA bot asks for it on the pull request.
