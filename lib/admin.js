// Owner allowlist for the private analytics dashboard. Set ADMIN_EMAILS
// (comma-separated) in the environment to override; falls back to the owner.
export function adminEmails() {
  const raw = process.env.ADMIN_EMAILS || 'rajasekarjavaee@gmail.com';
  return raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}
export function isAdmin(email) {
  return !!email && adminEmails().includes(String(email).toLowerCase());
}
