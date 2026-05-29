// =================================================================
// Credit ledger: balance + append-only transactions (user_credits,
// credit_transactions). Deduction is enforced only when CREDITS_ENFORCED=1
// (a launch flag), so the gated pre-launch build and tests run ungated.
// =================================================================
import { query } from '@/lib/db';

export function creditsEnforced() { return process.env.CREDITS_ENFORCED === '1'; }

export async function getBalance(userId) {
  const r = await query('SELECT balance FROM user_credits WHERE user_id = ?', [userId]);
  return r[0] ? Number(r[0].balance) : 0;
}

export async function addCredits(userId, amount, reason = 'grant', refType = null, refId = null) {
  if (amount <= 0) return 0;
  await query(
    'INSERT INTO user_credits (user_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
    [userId, amount]
  );
  await query('INSERT INTO credit_transactions (user_id, delta, reason, ref_type, ref_id) VALUES (?,?,?,?,?)', [userId, amount, reason, refType, refId]);
  return amount;
}

// Deduct up to `amount`, never below zero. Returns the amount actually charged.
export async function chargeCredits(userId, amount, reason = 'chat', refType = null, refId = null) {
  if (amount <= 0) return 0;
  const before = await getBalance(userId);
  const charge = Math.min(amount, before);
  if (charge > 0) {
    await query('UPDATE user_credits SET balance = GREATEST(0, balance - ?) WHERE user_id = ?', [charge, userId]);
    await query('INSERT INTO credit_transactions (user_id, delta, reason, ref_type, ref_id) VALUES (?,?,?,?,?)', [userId, -charge, reason, refType, refId]);
  }
  return charge;
}

export async function listPacks() {
  return query('SELECT code, name, price_inr, credits FROM credit_packs WHERE active = 1 ORDER BY sort');
}
