import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';

async function main() {
  const credentials = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json', 'utf8'));
  initializeApp({ credential: cert(credentials) });
  const rules = getSecurityRules();
  const current = await rules.getFirestoreRuleset();
  const file = current.source.find((entry) => entry.name === 'firestore.rules');
  if (!file) throw new Error('No existing firestore.rules source found; refusing to replace the ruleset.');
  const existing = file.content.replace(/\r\n/g, '\n');
  const addition = readFileSync('firestore.songsheets.rules', 'utf8').replace(/\r\n/g, '\n').trimEnd();
  if (existing.includes(addition)) {
    console.log('Songsheet rules are already deployed.');
    return;
  }
  if (existing.includes('match /songsheets/')) throw new Error('Songsheet rules already exist with different contents; review them manually.');
  const anchor = '    match /{document=**} {';
  if (!existing.includes(anchor) || !existing.includes('function isOwner(userId)')) {
    throw new Error('The live ruleset has changed; refusing to modify it automatically.');
  }
  const merged = existing.replace(anchor, `${addition}\n\n${anchor}`);
  const compiled = await rules.createRuleset(rules.createRulesFileFromSource('firestore.rules', merged));
  console.log('Firebase compiled the songsheet rule successfully; existing rules preserved.');
  if (process.argv.includes('--deploy')) {
    const latest = await rules.getFirestoreRuleset();
    if (latest.name !== current.name) throw new Error('Live rules changed during validation; refusing to overwrite them.');
    await rules.releaseFirestoreRuleset(compiled);
    console.log('Owner-only songsheet rules deployed.');
  } else {
    console.log('Validation only. Use --deploy to publish the compiled rules.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});