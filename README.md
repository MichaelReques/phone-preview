# Phone Preview

Preview your local web project inside a realistic phone, right next to your code in VS Code.

## Features

- **Devices:** iPhone 15, iPhone 15 Pro Max, Google Pixel 10.
- **Realistic browser chrome:** Safari-style bars on iPhone, Chrome-style bars on Pixel, with a status bar (live clock, signal, Wi-Fi, battery).
- **Real viewport size:** the browser bars take space, so your page sees the same viewport it would on a real phone.
- **Fit to panel:** the phone scales to the available space (or choose 50 / 75 / 100 %).
- **Rotate** to landscape.
- **Hidden scrollbar** for a mobile-like feel (toggle it with the *Scroll* button).
- **Light / dark browser bars.**
- **Reload on save** and a manual reload button.
- **Independent from your VS Code theme:** your page is rendered with a light color scheme, so it does not turn black when you use a dark theme.

## Usage

1. Start your dev server (Live Server, Astro, Vite, Next.js...).
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Run **Phone Preview: Open**.
4. Type the URL or just the port (for example `4321` becomes `http://localhost:4321`).

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `phonePreview.defaultUrl` | `http://localhost:5500` | URL loaded when the panel opens. |
| `phonePreview.autoReloadOnSave` | `true` | Reload the preview when you save a file. |

Tip: frameworks with hot reload (Astro, Vite) update by themselves, so you can turn off *auto reload on save*.

## Limitations

- Works best with local pages. Many external sites block being shown inside an iframe.
- Your dev server must be running; the extension only displays the page.
- Device sizes are CSS-pixel viewports; Pixel 10 values are approximate.
- This is a visual simulator, not a real device or emulator: it does not reproduce a phone's rendering engine.

## Disclaimer

iPhone and Safari are trademarks of Apple Inc. Pixel and Chrome are trademarks of Google LLC. This extension is not affiliated with or endorsed by them; the names are used only to describe screen sizes.

## License

MIT
