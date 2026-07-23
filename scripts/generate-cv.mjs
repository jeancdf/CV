import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('cv/jean-cazals-cv.html');
const outputPath = resolve('public/uploads/CV-Jean-Cazals-Harvard-2026.pdf');

const browserCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const browserPath = browserCandidates.find((candidate) => existsSync(candidate));

if (!browserPath) {
  console.error(
    'Aucun navigateur Chromium trouvé. Définissez CHROME_PATH vers Chrome, Chromium ou Edge.',
  );
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  console.error(`Source du CV introuvable : ${sourcePath}`);
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });

const usesWindowsBrowser = browserPath.toLowerCase().endsWith('.exe');

const toWindowsPath = (filePath) => {
  const conversion = spawnSync('wslpath', ['-w', filePath], { encoding: 'utf8' });
  if (conversion.status !== 0) {
    console.error(conversion.stderr || `Impossible de convertir le chemin : ${filePath}`);
    process.exit(1);
  }
  return conversion.stdout.trim();
};

const sourceUrl = usesWindowsBrowser
  ? `file:///${toWindowsPath(sourcePath).replaceAll('\\', '/')}`
  : pathToFileURL(sourcePath).href;
const browserOutputPath = usesWindowsBrowser ? toWindowsPath(outputPath) : outputPath;

const result = spawnSync(
  browserPath,
  [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-pdf-header-footer',
    `--print-to-pdf=${browserOutputPath}`,
    sourceUrl,
  ],
  { encoding: 'utf8' },
);

if (result.status !== 0 || !existsSync(outputPath)) {
  console.error(result.stderr || result.stdout || 'La génération du PDF a échoué.');
  process.exit(result.status || 1);
}

console.log(`CV généré : ${outputPath}`);
