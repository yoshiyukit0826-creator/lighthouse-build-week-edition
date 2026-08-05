import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  boot,
  buildOrientationPacket,
  classifyEvidence,
  validateObservation
} from '../src/ark_runtime.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

async function configs() {
  const identity = JSON.parse(await readFile(join(ROOT, 'config', 'identity_canon.json'), 'utf8'));
  const policy = JSON.parse(await readFile(join(ROOT, 'config', 'direction_policy.json'), 'utf8'));
  return { identity, policy };
}

test('boot connects identity and direction policy', async () => {
  const { manifest } = await boot();
  assert.equal(manifest.boot_status, 'BOOT_OK');
  assert.equal(manifest.mode, 'IDENTITY_DIRECTION_CONNECTED');
  assert.equal(manifest.runtime_id, 'ARK-QUEEN-HEART');
  assert.equal(manifest.host_model, 'GPT');
});

test('confirmed evidence requires a source', () => {
  assert.throws(
    () => validateObservation({ claim: 'implemented', state: 'confirmed' }),
    /requires source/
  );
});

test('evidence states remain separated', () => {
  const buckets = classifyEvidence([
    { claim: 'test passed', state: 'confirmed', source: 'test log #1' },
    { claim: 'connector works', state: 'unconfirmed' },
    { claim: 'old design', state: 'corpse' },
    { claim: 'deploy adapter', state: 'not_executed' }
  ]);
  assert.equal(buckets.confirmed.length, 1);
  assert.equal(buckets.unconfirmed.length, 1);
  assert.equal(buckets.corpse.length, 1);
  assert.equal(buckets.not_executed.length, 1);
});

test('not_executed evidence cannot contain a result', () => {
  assert.throws(
    () => validateObservation({ claim: 'deploy', state: 'not_executed', result: 'done' }),
    /cannot contain a result/
  );
});

test('packet directs GPT while preserving operator authority', async () => {
  const { identity, policy } = await configs();
  const packet = buildOrientationPacket({
    identity,
    policy,
    goal: 'Connect ARK runtime and establish directional continuity',
    successCriteria: ['boot succeeds', 'tests pass'],
    observations: [
      { claim: 'BOOT v0.1 exists', state: 'confirmed', source: 'BOOT_EVIDENCE.md' },
      { claim: 'AI model adapter exists', state: 'not_executed' }
    ]
  });
  assert.equal(packet.authority.final_decision, 'operator');
  assert.equal(packet.authority.runtime_scope, 'orient_GPT_not_command_user');
  assert.match(packet.direction.next_executable_step, /Execute and record/);
  assert.match(packet.model_instruction, /Perform an available executable step/);
});

test('corpse mixed into current is detected', async () => {
  const { identity, policy } = await configs();
  const packet = buildOrientationPacket({
    identity,
    policy,
    goal: 'Keep current canon clean',
    observations: [
      { claim: 'obsolete architecture', state: 'corpse', current: true }
    ]
  });
  assert.equal(packet.anomalies[0].signal, 'corpse_mixed_into_current');
});

test('identity hash is stable for the same canon', async () => {
  const { identity, policy } = await configs();
  const first = buildOrientationPacket({ identity, policy, goal: 'A' });
  const second = buildOrientationPacket({ identity, policy, goal: 'B' });
  assert.equal(first.presence.identity_hash, second.presence.identity_hash);
});
