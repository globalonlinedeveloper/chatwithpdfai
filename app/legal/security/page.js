import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "overview", title: "Overview", body: [
        "Documents you upload to CHATWITHPDFAI are often privileged — contracts, clinical records, financial filings, M&A diligence. We treat them that way.",
        "This page is the detailed companion to the security claims on our landing page. If you need attestations or are running enterprise diligence, email `security@chatwithpdfai.com` and we'll share our SOC 2 Type II report and pentest summary under NDA.",
      ]},
      { id: "encryption", title: "Encryption", body: [
        { ul: [
          "**In transit:** TLS 1.3 with HSTS preloaded. No TLS 1.0/1.1 supported.",
          "**At rest:** AES-256-GCM, customer-data keys rotated quarterly via AWS KMS.",
          "**Backups:** Encrypted with separate KMS keys; replicated to a second region.",
          "**Secret management:** AWS Secrets Manager + 1Password Business; no secrets in source.",
        ]},
      ]},
      { id: "isolation", title: "Tenant isolation", body: [
        "Every workspace gets its own logical tenant ID. All data queries are scoped by tenant at the application layer and double-checked at the storage layer. We do regression tests on every release to prove that cross-tenant reads are impossible.",
      ]},
      { id: "ai", title: "AI vendor controls", body: [
        "We use AI inference from OpenAI and Anthropic. We have **zero-retention** contracts with both: prompts and outputs are not stored beyond the inference call. Neither vendor trains models on our traffic.",
        "We send only the document text needed to answer the current question — we do not bulk-upload your library to any model vendor.",
      ]},
      { id: "access", title: "Access control", body: [
        { ul: [
          "Production access is gated by SSO + hardware-key MFA",
          "Just-in-time access via short-lived role assumption (max 4 hours)",
          "All production access is logged and reviewed monthly",
          "Least privilege by default; engineers cannot read customer data without an approved ticket",
        ]},
      ]},
      { id: "compliance", title: "Compliance & audits", body: [
        { table: { headers: ["Standard", "Status", "Refreshed"], rows: [
          ["SOC 2 Type II", "Active", "Annual (last: Apr 2026)"],
          ["ISO 27001:2022", "Active", "Annual (last: Mar 2026)"],
          ["HIPAA alignment", "Active (BAA available)", "Continuous"],
          ["GDPR / UK GDPR", "Active", "Continuous"],
          ["CCPA / CPRA", "Active", "Continuous"],
          ["Penetration test", "Passed", "Biannual (last: Mar 2026, NCC Group)"],
        ]} },
      ]},
      { id: "incidents", title: "Incident response", body: [
        "We follow a written incident response runbook. On confirmed customer-impacting incidents:",
        { ul: [
          "Page on-call within 5 minutes",
          "Initial customer comms within 1 hour for high severity",
          "Detailed postmortem published within 7 business days",
          "GDPR breach notification within 72 hours where applicable",
        ]},
        "Past incident reports are mirrored on our status page (`status.chatwithpdfai.com`).",
      ]},
      { id: "vuln", title: "Vulnerability disclosure", body: [
        "We welcome security research. Report vulnerabilities to `security@chatwithpdfai.com` with a description and proof of concept. We acknowledge within 1 business day and patch high-severity issues within 7 days. Hall of Fame: chatwithpdfai.com/security/hall-of-fame.",
        "PGP key (Fingerprint: `B3D4 1F9E 0A12 …`): fetch from `chatwithpdfai.com/pgp.asc`.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/security' }, title: "Security policy \u2014 CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal \u00b7 Security"} title={"Security policy"} lede={"The bar is the bar. Lawyers, doctors, and analysts brought us here."} lastUpdated={"May 22, 2026"} sections={SECTIONS} />;
}
