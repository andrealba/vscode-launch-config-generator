# VS Code Launch Config Generator

A JS script that automatically generates or updates VS Code `launch.json` debug configurations based on the scripts defined in your `package.json`.

It supports:

- `npm`, `yarn`, or `pnpm`
- Script filtering by prefix (e.g., only `dev:*` scripts)
- One-time confirmation prompt for overwriting existing configs
- Automatic backups of existing `launch.json` (timestamped)
- Automatic mode with `--yes` flag for CI or scripted use

---

## 📦 Installation

Place the script in your project under `scripts/` folder:

```bash
mkdir -p scripts
```

Then add the script to `scripts/generate-launch-config.js`.

## 🚀 Usage

You can run the script directly with Node:

```bash
node scripts/generate-launch-config.js
```

Or add it to your `package.json` scripts for convenience:

```bash
"scripts": {
  "generate-launch": "node scripts/generate-launch-config.js",
  "generate-launch:yes": "node scripts/generate-launch-config.js --yes",
  "generate-launch:yarn": "node scripts/generate-launch-config.js --manager yarn --yes",
  "generate-launch:dev": "node scripts/generate-launch-config.js --filter dev --yes"
}
```

Then run:

```bash
npm run generate-launch
```

## ⚙️ CLI Options

| Flag                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `--manager <pm>`    | Specify package manager: `npm` (default), `yarn`, or `pnpm`      |
| `--filter <prefix>` | Only include scripts starting with the given prefix (e.g. `dev`) |
| `--yes`             | Automatically confirm overwrites (no prompts)                    |

## 💡 Examples

Generate all launch configs using `npm`:

```bash
node scripts/generate-launch-config.js
```

Only include scripts starting with `dev:`:

```bash
node scripts/generate-launch-config.js --filter dev
```

Use `yarn` and skip confirmation prompts:

```bash
node scripts/generate-launch-config.js --manager yarn --yes
```

## 🧠 Behavior Details

- Existing `launch.json` is backed up to `.vscode/launch.backup.YYYY-MM-DDTHH-MM-SS.json`
- The script will only prompt **once** to confirm overwriting multiple configs
- Scripts are translated into VS Code launch configurations like:

```bash
{
  "type": "node",
  "request": "launch",
  "name": "npm: dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "skipFiles": ["<node_internals>/**"]
}
```

## 🛠️ Requirements

- Node.js installed
- A valid `package.json` with scripts
- VS Code workspace with a `.vscode/` directory (created automatically if missing)

## 🧩 License

MIT — use it freely for your projects.

```bash
Let me know if you'd like me to also:
- Add badges (npm, license, etc.)
- Turn this into a CLI package (`npx`, global install, etc.)
- Add screenshots of the debug UI in VS Code

I'm happy to help!
```
