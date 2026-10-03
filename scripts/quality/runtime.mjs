import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// Lab adds the public purchase-requests package, its views and widgets to the
// native composition. The T41 source build with public SDK 1.2.0 and purchase
// requests 0.1.3 measures 7,046,827 raw / 1,327,438 gzip bytes across 71
// Worker files. The T38 adoption with Core 8756 and public SDK 1.9.0 needs
// its own measurement; do not raise these ceilings from a source diff. No local runtime, browser or
// hosted behavior is inferred from the earlier build.
// Other compositions still require explicit measurements.
// They are neither provider quotas nor production latency guarantees.
export const RUNTIME_BUDGETS = Object.freeze({ workerBytes: 7_150_000, workerGzipBytes: 1_350_000,
  selectedGraphInputs: 32, startupMs: 15_000, routeMs: 3_000 });

const check = (name, value, limit) => {
  if (!Number.isFinite(value) || value < 0 || value > limit) throw new Error(`Local runtime budget ${name} exceeded: ${value} > ${limit}.`);
};

/** Early size gate and the exact same size gate used by the final runtime witness. */
export function assertArtifactBudgets(artifact) {
  check('workerBytes', artifact.worker.bytes, RUNTIME_BUDGETS.workerBytes);
  check('workerGzipBytes', artifact.worker.gzipBytes, RUNTIME_BUDGETS.workerGzipBytes);
  return RUNTIME_BUDGETS;
}

export function assertRuntimeBudgets(report) {
  assertArtifactBudgets(report.artifact);
  check('selectedGraphInputs', report.witness.boundary.inputs.length, RUNTIME_BUDGETS.selectedGraphInputs);
  for (const name of ['startup', 'restart']) check(name, report.durationsMs[name], RUNTIME_BUDGETS.startupMs);
  for (const name of ['homepage', 'staticAsset', 'health', 'witness', 'storageRoundtrip']) check(name, report.durationsMs[name], RUNTIME_BUDGETS.routeMs);
  return RUNTIME_BUDGETS;
}

/** Local artifact measurement only: this does not prove browser or hosted behavior. */
export function measureRuntimeArtifacts(root) {
  const directory = resolve(root);
  function walk(path) {
    return readdirSync(path).sort().flatMap(name => {
      const file = join(path, name), stat = lstatSync(file);
      if (stat.isSymbolicLink()) throw new Error('Runtime evidence refuses linked artifacts.');
      return stat.isDirectory() ? walk(file) : [file];
    });
  }
  const files = [...walk(join(directory, 'dist/server')), ...walk(join(directory, 'dist/client'))]
    .map(file => {
      const bytes = readFileSync(file), path = relative(directory, file).replaceAll('\\', '/');
      return { path, bytes: bytes.length, sha256: hash(bytes),
        ...(path.startsWith('dist/server/') && /\.(?:m?js)$/.test(path) ? { gzipBytes: gzipSync(bytes).length } : {}) };
    });
  const workerFiles = files.filter(file => file.gzipBytes !== undefined);
  if (!workerFiles.some(file => file.path === 'dist/server/index.js')) throw new Error('A complete built Worker is required.');
  return {
    digest: `sha256-${hash(JSON.stringify(files))}`,
    worker: { files: workerFiles.length, bytes: workerFiles.reduce((total, file) => total + file.bytes, 0),
      gzipBytes: workerFiles.reduce((total, file) => total + file.gzipBytes, 0) },
    assets: { files: files.filter(file => file.path.startsWith('dist/client/')).length,
      bytes: files.filter(file => file.path.startsWith('dist/client/')).reduce((total, file) => total + file.bytes, 0) },
    files,
  };
}
