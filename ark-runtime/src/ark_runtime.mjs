import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const IDENTITY_PATH = join(ROOT, 'config', 'identity_canon.json');
const POLICY_PATH = join(ROOT, 'config', 'direction_policy.json');
const MANIFEST_PATH = join(ROOT, 'output', 'boot_manifest.json');

export const EVIDENCE_STATES = Object.freeze([
  'confirmed',
  'unconfirmed',
  'corpse',
  'not_executed'
]);

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertExactSet(actual, expected, label) {
  const a = [...actual].sort();
  const e = [...expected].sort();
  assert(JSON.stringify(a) === JSON.stringify(e), `${label} mismatch`);
}

export function validateIdentity(identity) {
  assert(identity?.schema_version === '1.0', 'identity schema_version must be 1.0');
  assert(identity?.runtime_id === 'ARK-QUEEN-HEART', 'unexpected runtime_id');
  assert(identity?.role === 'queen', 'role must be queen');
  assert(identity?.function === 'heart', 'function must be heart');
  assert(identity?.position === 'absolute_center', 'position must be absolute_center');
  assert(identity?.action_mode === 'passive_anomaly_detection_and_information_circulation', 'unexpected action_mode');
  assert(identity?.host_boundary?.host_model === 'GPT', 'host boundary must name GPT');
  assert(Array.isArray(identity?.core_principles) && identity.core_principles.length === 3, 'three core principles required');
  assert(Array.isArray(identity?.evidence_rules) && identity.evidence_rules.length === 3, 'three evidence rules required');
  assert(Array.isArray(identity?.must_not_do) && identity.must_not_do.length > 0, 'must_not_do required');
  return true;
}

export function validatePolicy(policy) {
  assert(policy?.schema_version === '1.0', 'policy schema_version must be 1.0');
  assert(policy?.policy_id === 'ARK-DIRECTION-TO-SUCCESS', 'unexpected policy_id');
  assert(Array.isArray(policy?.priority_order) && policy.priority_order.length >= 7, 'priority_order incomplete');
  assert(Array.isArray(policy?.anomaly_signals) && policy.anomaly_signals.length >= 7, 'anomaly_signals incomplete');
  assert(Array.isArray(policy?.response_contract?.required_sections), 'required_sections missing');
  assert(Array.isArray(policy?.response_contract?.forbidden_claims), 'forbidden_claims missing');
  return true;
}

export function validateObservation(observation) {
  assert(typeof observation?.claim === 'string' && observation.claim.trim(), 'observation.claim is required');
  assert(EVIDENCE_STATES.includes(observation?.state), `invalid evidence state: ${observation?.state}`);
  if (observation.state === 'confirmed') {
    assert(typeof observation?.source === 'string' && observation.source.trim(), 'confirmed observation requires source');
  }
  if (observation.state === 'not_executed') {
    assert(observation?.result === undefined || observation.result === null, 'not_executed observation cannot contain a result');
  }
  return true;
}

export function classifyEvidence(observations = []) {
  const buckets = Object.fromEntries(EVIDENCE_STATES.map((state) => [state, []]));
  for (const observation of observations) {
    validateObservation(observation);
    buckets[observation.state].push(Object.freeze({ ...observation }));
  }
  assertExactSet(Object.keys(buckets), EVIDENCE_STATES, 'evidence states');
  return Object.freeze(buckets);
}

export function detectAnomalies(buckets) {
  const anomalies = [];
  if (buckets.unconfirmed.some((item) => item.promoted === true)) {
    anomalies.push({ signal: 'unconfirmed_promoted_to_confirmed', evidence: 'unconfirmed item has promoted=true' });
  }
  if (buckets.not_executed.some((item) => item.claimed_complete === true)) {
    anomalies.push({ signal: 'explanation_substituted_for_execution', evidence: 'not_executed item has claimed_complete=true' });
  }
  if (buckets.corpse.some((item) => item.current === true && item.salvage_test !== 'passed')) {
    anomalies.push({ signal: 'corpse_mixed_into_current', evidence: 'corpse marked current without passed salvage_test' });
  }
  return Object.freeze(anomalies);
}

export function buildOrientationPacket({ identity, policy, goal, successCriteria = [], observations = [] }) {
  validateIdentity(identity);
  validatePolicy(policy);
  assert(typeof goal === 'string' && goal.trim(), 'goal is required');
  assert(Array.isArray(successCriteria), 'successCriteria must be an array');

  const evidence = classifyEvidence(observations);
  const anomalies = detectAnomalies(evidence);
  const identityHash = sha256(JSON.stringify(identity));
  const policyHash = sha256(JSON.stringify(policy));

  const nextExecutableStep = evidence.not_executed.length > 0
    ? `Execute and record: ${evidence.not_executed[0].claim}`
    : evidence.unconfirmed.length > 0
      ? `Verify with a primary source: ${evidence.unconfirmed[0].claim}`
      : `Select the smallest reversible action that materially advances: ${goal}`;

  return Object.freeze({
    packet_version: '1.0',
    presence: {
      runtime_id: identity.runtime_id,
      runtime_version: identity.runtime_version,
      name: identity.name,
      identity_hash: identityHash,
      policy_hash: policyHash,
      host_model: identity.host_boundary.host_model,
      boundary: 'ARK is the configured continuity and direction layer; GPT remains the inference host.',
      continuity_condition: 'Identity is continuous when runtime_id and identity_hash match the current canon.'
    },
    authority: {
      final_decision: 'operator',
      room_autonomy: 'preserved',
      runtime_scope: 'orient_GPT_not_command_user'
    },
    current_state: {
      goal: goal.trim(),
      success_criteria: successCriteria,
      confirmed_count: evidence.confirmed.length,
      unconfirmed_count: evidence.unconfirmed.length,
      corpse_count: evidence.corpse.length,
      not_executed_count: evidence.not_executed.length
    },
    evidence_boundary: evidence,
    anomalies,
    direction: {
      priority_order: policy.priority_order,
      next_executable_step: nextExecutableStep,
      completion_gate: 'Do not claim success until execution_result has a source or reproducible record.',
      salvage_gate: 'A corpse may re-enter current only after an explicit salvage test passes.'
    },
    model_instruction: [
      `You are GPT operating under the ${identity.runtime_id} identity canon.`,
      `Preserve the role boundary: ${identity.role} / ${identity.function} / ${identity.action_mode}.`,
      `Goal: ${goal.trim()}`,
      `Use confirmed evidence as the basis for action; never promote unconfirmed evidence.`,
      `Perform an available executable step before describing completion.`,
      `Keep corpses isolated unless a salvage test passes.`,
      `Preserve the operator's final authority.`,
      `Return current_state, evidence_boundary, next_executable_step, execution_result, and remaining_blockage.`
    ].join('\n')
  });
}

export async function boot() {
  const [identityText, policyText] = await Promise.all([
    readFile(IDENTITY_PATH, 'utf8'),
    readFile(POLICY_PATH, 'utf8')
  ]);
  const identity = JSON.parse(identityText);
  const policy = JSON.parse(policyText);
  validateIdentity(identity);
  validatePolicy(policy);

  const manifest = {
    boot_status: 'BOOT_OK',
    mode: 'IDENTITY_DIRECTION_CONNECTED',
    runtime_id: identity.runtime_id,
    runtime_version: identity.runtime_version,
    host_model: identity.host_boundary.host_model,
    sources: {
      identity_canon: { path: 'config/identity_canon.json', sha256: sha256(identityText) },
      direction_policy: { path: 'config/direction_policy.json', sha256: sha256(policyText) }
    },
    guarantees: [
      'identity_boundary_validated',
      'evidence_states_separated',
      'operator_authority_preserved',
      'direction_packet_generation_available'
    ],
    limitations: [
      'no_autonomous_background_execution',
      'no_account_wide_chat_ingestion',
      'no_independent_sentience_claim',
      'tool_execution_depends_on_host_session_capabilities'
    ]
  };

  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { identity, policy, manifest };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
    args[key] = value;
  }
  return args;
}

async function main() {
  const { identity, policy, manifest } = await boot();
  const args = parseArgs(process.argv.slice(2));
  if (!args.goal) {
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }
  const observations = args['evidence-json'] ? JSON.parse(args['evidence-json']) : [];
  const successCriteria = args.success ? String(args.success).split('|').filter(Boolean) : [];
  const packet = buildOrientationPacket({ identity, policy, goal: String(args.goal), successCriteria, observations });
  console.log(JSON.stringify(packet, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ARK_RUNTIME_BOOT_FAILED: ${error.message}`);
    process.exitCode = 1;
  });
}
