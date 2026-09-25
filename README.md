# prifly-ext-hello-kitty

A skin for prifly: the window, dressed in pink.

- **Light:** strawberry milk, with bows and hearts on the page.
- **Dark:** a plum night with pink lights.
- A bow on every message you write, a small kitty signing every reply, and a
  bigger one keeping watch from the corner of the transcript.
- Set in [Fredoka](https://github.com/hafontia/Fredoka-One) (SIL OFL 1.1,
  `skin/fonts/OFL.txt`).

Status colours — a failed tool, a warning, the permission modes — are left as
prifly has them: they mean something.

## Install

Put this folder in `~/.local/share/prifly/extensions/` (or install it from its
git URL in prifly's Extensions dialog) and enable it. The skin applies at once;
no session restarts.

## How a skin works

It has no code. The manifest names a folder and the stylesheets in it:

```json
"skin": { "folder": "skin", "styles": ["hello-kitty.css"] }
```

prifly loads each sheet after its own, from the host, so the sheet wins where
it says the same thing and its `url()`s reach the pictures and fonts beside it.
Only the skin's folder is served, and only while the extension is enabled.

What a sheet can hold on to:

- **The tokens** on `:root` (light) and `.dark` (dark): `--background`,
  `--foreground`, `--card`, `--primary`, `--border`, `--muted`, `--accent`,
  `--radius`, … — change them and every surface follows.
- **The regions**, by `data-part`: `window`, `header`, `sessions`, `main`,
  `side-panel`, `composer`, `status-bar`, `human-message`, `assistant-message`.

The artwork in `skin/img` is drawn for this skin.
