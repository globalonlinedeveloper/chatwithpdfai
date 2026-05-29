// Branded transactional email HTML (inline-styled for email-client compatibility).
const SITE = process.env.SITE_URL || 'https://chatwithpdfai.com';
function esc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); }
function shell(body) {
  return `<!doctype html><html><body style="margin:0;background:#05060f;font-family:Inter,Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05060f"><tr><td align="center" style="padding:34px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0d0f24;border:1px solid #23263f;border-radius:16px">
      <tr><td style="padding:26px 32px 0;font-size:16px;font-weight:700;color:#fff">&#9671; chatwithpdfai<span style="color:#8b90b5">.com</span></td></tr>
      <tr><td style="padding:16px 32px 30px">${body}</td></tr>
    </table>
    <p style="max-width:480px;color:#6b7099;font-size:12px;margin:18px auto 0;line-height:1.5">CHATWITHPDFAI &middot; Pay-per-document AI for your PDFs &middot; <a href="${SITE}" style="color:#8b8bff;text-decoration:none">chatwithpdfai.com</a></p>
  </td></tr></table></body></html>`;
}
function btn(href, label) { return `<a href="${esc(href)}" style="display:inline-block;background:#7c5cff;color:#fff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:10px;font-size:15px">${label}</a>`; }
export function verifyEmailHtml({ link, name }) {
  return shell(`
    <h1 style="font-size:22px;margin:0 0 10px;color:#fff">Verify your email</h1>
    <p style="font-size:14px;line-height:1.6;color:#b9bcd8;margin:0 0 22px">${name ? 'Hi ' + esc(name) + ', ' : ''}thanks for creating a CHATWITHPDFAI account. Confirm your email to start uploading PDFs and asking questions with cited answers.</p>
    ${btn(link, 'Verify my email &rarr;')}
    <p style="font-size:12px;color:#6b7099;margin:22px 0 0">Or paste this link:<br><span style="color:#8b8bff;word-break:break-all">${esc(link)}</span></p>
    <p style="font-size:12px;color:#6b7099;margin:14px 0 0">If you didn't sign up, you can ignore this email.</p>`);
}
export function resetEmailHtml({ link }) {
  return shell(`
    <h1 style="font-size:22px;margin:0 0 10px;color:#fff">Reset your password</h1>
    <p style="font-size:14px;line-height:1.6;color:#b9bcd8;margin:0 0 22px">We received a request to reset your CHATWITHPDFAI password. This link expires in 1 hour.</p>
    ${btn(link, 'Set a new password &rarr;')}
    <p style="font-size:12px;color:#6b7099;margin:22px 0 0">Or paste this link:<br><span style="color:#8b8bff;word-break:break-all">${esc(link)}</span></p>
    <p style="font-size:12px;color:#6b7099;margin:14px 0 0">If you didn't request this, ignore this email &mdash; your password won't change.</p>`);
}
