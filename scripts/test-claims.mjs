import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));
for (const claim of claims) {
  console.log(`\n@claim:${claim.id} — ${claim.claim}`);
  const result = spawnSync(claim.test, { cwd: process.cwd(), shell: true, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`\nAll ${claims.length} declared claim commands passed.`);
