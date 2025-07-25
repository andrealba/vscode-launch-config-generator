/**
 * VS Code Launch Config Generator.
 *
 * Generates or merges Visual Studio Code launch configurations from scripts defined
 * in package.json. It supports npm, yarn, or pnpm, with optional script name filtering,
 * timestamped backups, and a single confirmation prompt when overwriting existing entries.
 *
 * Features:
 * - Detects and loads scripts from package.json
 * - Adds one launch configuration per script
 * - Optionally filters scripts by prefix (e.g., "dev")
 * - Supports --yes to skip prompts
 * - Prompts once before overwriting any existing launch configs
 * - Creates timestamped backups of existing .vscode/launch.json
 *
 * Usage examples:
 *   node scripts/generate-launch-config.js
 *   node scripts/generate-launch-config.js --filter dev
 *   node scripts/generate-launch-config.js --manager yarn --yes
 *
 * CLI Flags:
 *   --manager <npm|yarn|pnpm>   Package manager to use (default: npm)
 *   --filter <prefix>           Only include scripts starting with this prefix
 *   --yes                       Automatically overwrite existing configs without prompting
 *
 *  File relative path: \scripts\generate-launch-config.js
 *  Project: vscode-launch-config-generator
 *
 *  File Created: Friday, 25th July 2025 14:33:40
 *  Author: Andrea Alba (AA) <https://github.com/andrealba>
 *
 *  Last Modified: Friday, 25th July 2025 20:07:03
 *  Modified By: Andrea Alba (AA) <https://github.com/andrealba>
 *
 *  @author     Andrea Alba (AA) <https://github.com/andrealba>
 *  @license    MIT License https://opensource.org/licenses/MIT
 *  @version    1.0.0
 *  @link       https://github.com/andrealba/vscode-launch-config-generator
 *
 *  HISTORY:
 *  Date        By   Comments
 *  ----------  ---  ---------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// -------------------- CLI Argument Parsing --------------------

const args = process.argv.slice(2);

/**
 * Retrieves a flag value from the CLI arguments
 * @param {string} flag - The flag to look for (e.g. '--manager')
 * @param {string} fallback - The default value if flag is not present
 * @returns {string}
 */
const getArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

/**
 * Checks whether a CLI flag is present
 * @param {string} flag
 * @returns {boolean}
 */
const hasFlag = (flag) => args.includes(flag);

const packageManager = getArg('--manager', 'npm'); // npm, yarn, or pnpm
const filterPrefix = getArg('--filter', ''); // optional script name prefix
const autoYes = hasFlag('--yes'); // skip confirmation prompts

// -------------------- File Paths --------------------

const packageJsonPath = path.resolve('package.json');
const vscodeDir = path.resolve('.vscode');
const launchJsonPath = path.join(vscodeDir, 'launch.json');

/**
 * Creates a timestamped backup path for launch.json
 * @returns {string} full path to backup file
 */
function getTimestampedBackupPath() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(vscodeDir, `launch.backup.${timestamp}.json`);
}

/**
 * Prompts the user with a yes/no question
 * @param {string} question
 * @returns {Promise<boolean>} true if user says yes
 */
function promptYesNo(question) {
  if (autoYes) return Promise.resolve(true);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question + ' (y/n): ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

// -------------------- Script Execution --------------------

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ No package.json found in the current directory.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
let scripts = pkg.scripts || {};

// Remove any scripts that include "generate-launch" anywhere in their name
scripts = Object.fromEntries(
  Object.entries(scripts).filter(([name]) => !name.includes('generate-launch'))
);

// Filter scripts by prefix if --filter is used
if (filterPrefix) {
  scripts = Object.fromEntries(
    Object.entries(scripts).filter(([name]) => name.startsWith(filterPrefix))
  );
}

if (Object.keys(scripts).length === 0) {
  console.warn(`⚠️ No scripts matched the filter "${filterPrefix}".`);
  process.exit(0);
}

// Ensure .vscode directory exists
if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir);
}

// Load existing launch.json and create a backup
let existingLaunchJson = {
  version: '0.2.0',
  configurations: [],
};

if (fs.existsSync(launchJsonPath)) {
  try {
    const originalContent = fs.readFileSync(launchJsonPath, 'utf-8');
    const backupPath = getTimestampedBackupPath();
    fs.writeFileSync(backupPath, originalContent);
    console.log(`🗂  Backup created: ${backupPath}`);
    existingLaunchJson = JSON.parse(originalContent);
  } catch (err) {
    console.warn('⚠️ Could not parse existing launch.json. Starting fresh.');
  }
}

const existingConfigs = existingLaunchJson.configurations || [];
const configMap = new Map(existingConfigs.map((cfg) => [cfg.name, cfg]));

// -------------------- Build New Configurations --------------------

const newConfigs = [];
const configsToOverwrite = [];

for (const scriptName of Object.keys(scripts)) {
  const configName = `${packageManager}: ${scriptName}`;
  const config = {
    type: 'node',
    request: 'launch',
    name: configName,
    runtimeExecutable: packageManager,
    runtimeArgs: ['run', scriptName],
    console: 'integratedTerminal',
    internalConsoleOptions: 'neverOpen',
    skipFiles: ['<node_internals>/**'],
  };

  if (configMap.has(configName)) {
    configsToOverwrite.push([configName, config]);
  } else {
    configMap.set(configName, config);
    newConfigs.push(configName);
  }
}

// -------------------- Confirm Overwrites and Save --------------------

(async () => {
  let overwriteConfirmed = autoYes;

  if (configsToOverwrite.length > 0 && !autoYes) {
    overwriteConfirmed = await promptYesNo(
      `⚠️ ${configsToOverwrite.length} configuration(s) already exist. Overwrite all?`
    );
  }

  if (overwriteConfirmed) {
    for (const [name, config] of configsToOverwrite) {
      configMap.set(name, config);
    }
    console.log(`✅ Overwrote ${configsToOverwrite.length} existing configurations.`);
  } else {
    console.log(`⏭  Skipped ${configsToOverwrite.length} existing configurations.`);
  }

  const mergedLaunchJson = {
    version: '0.2.0',
    configurations: Array.from(configMap.values()),
  };

  fs.writeFileSync(launchJsonPath, JSON.stringify(mergedLaunchJson, null, 2));
  console.log(
    `✅ launch.json updated with ${
      newConfigs.length + (overwriteConfirmed ? configsToOverwrite.length : 0)
    } configuration(s).`
  );
})();
