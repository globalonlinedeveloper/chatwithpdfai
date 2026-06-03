import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "intro", title: "Current sub-processors", body: [
        "These are the third parties we engage to provide the Service. Each has a written agreement with us containing GDPR-compliant data protection terms. We notify customers at least 30 days before adding a new sub-processor.",
        "Subscribe to changes at `subprocessors@chatwithpdfai.com`.",
        { table: {
          headers: ["Vendor", "Purpose", "Data processed", "Region", "Certifications"],
          rows: [
            ["Amazon Web Services (AWS)", "Cloud hosting, compute, storage", "All Customer Data", "us-east-1 (default), eu-west-1 (EU residency)", "SOC 2 Type II, ISO 27001, HIPAA"],
            ["OpenAI", "AI inference (GPT-class models)", "Document text, chat queries — not retained, not used to train", "US", "SOC 2 Type II"],
            ["Anthropic", "AI inference (Claude models)", "Document text, chat queries — not retained, not used to train", "US", "SOC 2 Type II"],
            ["Razorpay, Inc.", "Payment processing", "Billing email, card token, transaction history", "US, EU", "PCI DSS Level 1, SOC 2"],
            ["Postmark (ActiveCampaign)", "Transactional email delivery", "Email address, message content", "US", "SOC 2"],
            ["Sentry", "Application error tracking", "Stack traces, request metadata (scrubbed)", "US, EU", "SOC 2 Type II"],
            ["PostHog (self-hosted)", "Product analytics", "Anonymized events, no PII, no document content", "Our AWS infrastructure", "Self-hosted under our SOC 2"],
            ["Cloudflare", "CDN, WAF, DDoS protection", "Network traffic metadata", "Global edge", "SOC 2 Type II, ISO 27001"],
            ["Vercel", "Marketing site hosting", "No customer data (marketing site only)", "Global edge", "SOC 2 Type II"],
            ["Linear", "Engineering project management", "No customer data", "US", "SOC 2 Type II"],
            ["Slack", "Internal communication", "No customer data", "US", "SOC 2 Type II"],
            ["1Password", "Internal secret management", "No customer data", "US/CA", "SOC 2 Type II"],
          ],
        }},
        { h3: "How we choose vendors" },
        "Every sub-processor passes our vendor risk review: SOC 2 / ISO 27001 attestation, DPA review, data-flow mapping, and security incident history. We document the assessment in our internal Vendor Register, available for audit by Enterprise customers.",
        { h3: "Changes & objections" },
        "Email `subprocessors@chatwithpdfai.com` to subscribe to change notifications. If you object to a new sub-processor for legitimate data-protection reasons, you may terminate the agreement and receive a pro-rata refund of unused credits.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/sub-processors' }, title: "Sub-processor list \u2014 CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal \u00b7 Sub-processors"} title={"Sub-processor list"} lede={"Every vendor that touches your data, named. Updated within 7 days of any change."} lastUpdated={"May 22, 2026"} sections={SECTIONS} />;
}
