import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "scope", title: "1. Scope & roles", body: [
        "This Data Processing Agreement (DPA) supplements the Terms of Service between CHATWITHPDFAI, Inc. (\"Processor\") and you (\"Controller\"). It applies whenever we process Personal Data on your behalf in connection with the Service.",
        "For the purposes of the GDPR and equivalent laws: **you are the Controller**, **we are the Processor**.",
      ]},
      { id: "details", title: "2. Processing details", body: [
        { table: { headers: ["Element", "Value"], rows: [
          ["Subject matter", "Provision of the Service: storing PDFs, generating chat answers, returning citations"],
          ["Duration", "Term of the underlying Service agreement, plus the retention windows in our Privacy Policy"],
          ["Nature & purpose", "Storage, indexing, AI inference, search, export"],
          ["Categories of data subjects", "Your employees, contractors, customers — anyone whose Personal Data appears in documents you upload"],
          ["Categories of Personal Data", "Names, contact info, identifiers, professional/financial info, any other categories present in your documents"],
          ["Special-category data", "Only if you upload documents containing it; the Service is HIPAA-aligned and a BAA is available on Practice and above"],
        ]} },
      ]},
      { id: "obligations", title: "3. Processor obligations", body: [
        "We will:",
        { ul: [
          "Process Personal Data only on your documented instructions",
          "Ensure persons authorized to process the data are bound by confidentiality",
          "Implement appropriate technical and organizational measures (see Annex II below)",
          "Engage sub-processors only with prior general authorization (see Annex III)",
          "Assist you in responding to data subject requests",
          "Assist you with DPIAs and consultations with supervisory authorities",
          "Delete or return Personal Data at end of service",
          "Make available all information necessary to demonstrate compliance",
        ]},
      ]},
      { id: "security", title: "4. Security measures (Annex II)", body: [
        { h3: "Technical measures" },
        { ul: [
          "Encryption in transit (TLS 1.3) and at rest (AES-256)",
          "Network isolation; production access via bastion + 2FA",
          "Application-level access controls and per-tenant data isolation",
          "Continuous vulnerability scanning, weekly dependency review",
          "Audit logs retained for 12 months",
          "Annual SOC 2 Type II audit",
        ]},
        { h3: "Organizational measures" },
        { ul: [
          "Background checks for all engineering personnel",
          "Mandatory security training on onboarding and annually",
          "Documented incident response runbook with 24-hour breach notification SLA",
          "Vendor risk reviews before adding any sub-processor",
        ]},
      ]},
      { id: "subprocessors", title: "5. Sub-processors (Annex III)", body: [
        "Current sub-processors are listed at `/legal/sub-processors`. We will give you 30 days notice before adding a new sub-processor; you may object in writing, and we will use commercially reasonable efforts to provide an alternative.",
      ]},
      { id: "transfers", title: "6. International transfers", body: [
        "Where Personal Data is transferred outside the EEA / UK / Switzerland to a country without an adequacy decision, we rely on the EU Standard Contractual Clauses (Module 2: Controller-to-Processor) incorporated by reference, along with the UK Addendum and the Swiss DPA addendum.",
        "Enterprise customers may elect EU data residency.",
      ]},
      { id: "breach", title: "7. Personal data breach", body: [
        "We will notify you without undue delay (target: 24 hours) of any confirmed Personal Data breach affecting your data, with all available facts and our remediation plan.",
      ]},
      { id: "audits", title: "8. Audits", body: [
        "Once per year, you may audit our security controls via (a) review of our latest SOC 2 Type II report and penetration test summaries, or (b) on-site audit with 30 days notice during business hours, paid by you and at reasonable cost.",
      ]},
      { id: "termination", title: "9. Termination & data return", body: [
        "On termination, we will, at your choice, delete or return all Personal Data within 30 days, except where retention is required by law. Hard-deletion is confirmed by email receipt.",
      ]},
      { id: "signing", title: "10. Signing this DPA", body: [
        "If you need a counter-signed copy, email `dpo@chatwithpdfai.com` from your billing email. We will return a signed PDF within 2 business days. Enterprise customers can request our pre-signed DPA from sales.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/dpa' }, title: "Data Processing Agreement \u2014 CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal \u00b7 DPA"} title={"Data Processing Agreement"} lede={"GDPR Article 28 DPA with standard contractual clauses. Sign-ready for Enterprise customers."} lastUpdated={"May 22, 2026"} sections={SECTIONS} />;
}
