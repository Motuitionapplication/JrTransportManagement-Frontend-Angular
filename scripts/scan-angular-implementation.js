/**
 * scripts/scan-angular-implementation.js
 *
 * Scans src/app for TypeScript files, detects @Component/@Injectable and exported class names,
 * compares against a desired list, and writes scan-result.json to the repo root.
 *
 * Usage:
 *   node scripts/scan-angular-implementation.js
 *
 * Output:
 *   scan-result.json
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src', 'app');

if (!fs.existsSync(SRC_DIR)) {
  console.error('ERROR: src/app not found. Run this script from your project root.');
  process.exit(1);
}

// Edit this desiredList to reflect the components/services you expect in the driver frontend.
const desiredList = [
  "DriverLoginComponent",
  "DriverDashboardComponent",
  "DriverProfileComponent",
  "VehicleComponent",
  "ConsignmentComponent",
  "HistoryComponent",
  "DocumentUploadComponent",
  "ReviewComponent",
  "SupportComponent",
  "DriverService",
  "VehicleService",
  "ConsignmentService",
  "ReviewService",
  "OwnerService",
  "CustomerService"
];

function walkDir(dir) {
  const out = [];
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      out.push(...walkDir(fp));
    } else if (fp.endsWith('.ts')) {
      out.push(fp);
    }
  }
  return out;
}

function analyzeFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const result = {
    file: path.relative(PROJECT_ROOT, filePath),
    isComponent: /@Component\(/.test(src),
    isInjectable: /@Injectable\(/.test(src),
    exportedClasses: []
  };

  // capture exported class names
  const classRegex = /export\s+class\s+([A-Za-z0-9_]+)/g;
  let m;
  while ((m = classRegex.exec(src)) !== null) {
    result.exportedClasses.push(m[1]);
  }
  return result;
}

const tsFiles = walkDir(SRC_DIR);
const analysis = tsFiles.map(analyzeFile);

// map of className -> [files]
const foundMap = {};
analysis.forEach(a => {
  a.exportedClasses.forEach(cls => {
    if (!foundMap[cls]) foundMap[cls] = new Set();
    foundMap[cls].add(a.file);
  });
});

// Prepare report for desiredList
const report = desiredList.map(name => ({
  name,
  implemented: !!foundMap[name],
  files: foundMap[name] ? Array.from(foundMap[name]) : []
}));

// extra detected classes in project that are not in desiredList
const allDetected = Object.keys(foundMap).sort();
const extraDetected = allDetected.filter(n => !desiredList.includes(n));

const out = {
  timestamp: new Date().toISOString(),
  projectRoot: PROJECT_ROOT,
  scannedFiles: tsFiles.length,
  desiredListCount: desiredList.length,
  report,
  extraDetected,
  rawFoundMap: Object.fromEntries(Object.entries(foundMap).map(([k, v]) => [k, Array.from(v)]))
};

const outPath = path.join(PROJECT_ROOT, 'scan-result.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

console.log(`Scan finished. Files scanned: ${tsFiles.length}`);
console.log(`Report written to ${outPath}`);
console.log('Summary:');
report.forEach(r => {
  console.log(`${r.implemented ? '✔' : '✖'} ${r.name} ${r.implemented ? '(' + r.files.join(', ') + ')' : ''}`);
});
if (extraDetected.length) {
  console.log(`Found ${extraDetected.length} extra exported class names (not in desired list). See scan-result.json`);
}
