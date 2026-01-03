import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
const packageLockJson = JSON.parse(readFileSync(join(__dirname, 'package-lock.json'), 'utf-8'));

const nodeVersion = process.version;
const nodeMajor = parseInt(process.versions.node.split('.')[0]);
const nodeMinor = parseInt(process.versions.node.split('.')[1]);
const nodePatch = parseInt(process.versions.node.split('.')[2]);
const viteVersion = packageLockJson.packages['node_modules/vite']?.version || 'unknown';
const viteMajor = parseInt(viteVersion.split('.')[0]);

console.log('Node.js version:', nodeVersion);
console.log('Vite version:', viteVersion);
console.log('Node.js major:', nodeMajor, 'minor:', nodeMinor, 'patch:', nodePatch);

// Vite 6.x works with Node.js 18+, Vite 7.x requires Node.js 20.19+ or 22.12+
// Check if Vite version is 7.x and if so, require newer Node.js
const meetsRequirement = viteMajor >= 7 
  ? ((nodeMajor === 20 && nodeMinor >= 19) || (nodeMajor === 22 && nodeMinor >= 12) || nodeMajor > 22)
  : (nodeMajor >= 18);

if (!meetsRequirement) {
  console.error('\n❌ Node.js version incompatibility detected!');
  console.error(`   Current: ${nodeVersion}`);
  if (viteMajor >= 7) {
    console.error(`   Required: Node.js 20.19+ or 22.12+`);
  } else {
    console.error(`   Required: Node.js 18+`);
  }
  console.error(`   Vite ${viteVersion} requires a newer Node.js version.`);
  process.exit(1);
}

console.log('✅ Version check passed');

