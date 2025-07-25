# VS Code Launch Config Generator

A JS scrip that automatically generates or merges VS Code `launch.json` debug configurations based on the scripts defined in your `package.json`.
in package.json. It supports npm, yarn, or pnpm, with optional script name filtering,
timestamped backups, and a single confirmation prompt when overwriting existing entries.

Features:

- Detects and loads scripts from `package.json`
- Adds one launch configuration per script
- It supports `npm`, `yarn`, or `pnpm`
- Optionally filters scripts by prefix (e.g., `dev`)
- Confirmation prompt before overwriting existing launch configurations
- Automatic timestamped backups of existing `.vscode/launch.json` file
- Command-line options to skip prompts (--yes) and specify package manager and filter
- Skipping scripts containing "generate-launch" anywhere in their names

---

## 📦 Installation

Place the script in your project under `scripts/` folder:

```bash
mkdir -p scripts
```

Then add the script to `scripts/generate-launch-config.js`.

## 🚀 Usage

Run the script with Node.js from your project root:

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

| Flag                          | Description                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `--manager <npm\|yarn\|pnpm>` | Specify package manager: `npm` (default), `yarn`, or `pnpm`      |
| `--filter <prefix>`           | Only include scripts starting with the given prefix (e.g. `dev`) |
| `--yes`                       | Automatically confirm overwrites (no prompts)                    |

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

## 🖥️ How it works

- Reads your project's `package.json` and extracts the scripts section.
- Filters out any scripts containing `generate-launch` in their names.
- Optionally filters scripts by prefix if `--filter` is specified.
- Loads existing `.vscode/launch.json` and creates a timestamped backup.
- Adds launch configurations for all matched scripts.
- Prompts once if any configs will be overwritten (unless `--yes` is used).
- Saves the merged configurations back to `.vscode/launch.json.`

## 🛠️ Requirements

- Node.js installed
- A valid `package.json` with scripts
- VS Code workspace with a `.vscode/` directory (created automatically if missing)

## 🧩 License

MIT License

## 🤝 Contributing

Feel free to open issues or submit pull requests if you'd like to improve this script!
