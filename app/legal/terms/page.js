import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "agreement", title: "1. Agreement to terms", body: [
        "These Terms of Service (\"Terms\") govern your use of the CHATWITHPDFAI service (\"Service\"). By creating an account or using the Service, you agree to be bound by these Terms.",
        "If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization, and \"you\" refers to that organization.",
      ]},
      { id: "account", title: "2. Your account", body: [
        "You must be at least 16 years old. You must provide accurate information. You are responsible for keeping your password secure and for all activity under your account.",
        "Tell us at `support@chatwithpdfai.com` immediately if you suspect unauthorized access.",
      ]},
      { id: "credits", title: "3. Credits & billing", body: [
        { h3: "3.1 What credits buy" },
        "One credit lets you upload and chat with one document, however many questions you ask. Credits are consumed on upload, not on each question. Credits never expire.",
        { h3: "3.2 Payment" },
        "You buy credits in packs at the prices shown on our pricing page. Payment is processed by Razorpay. All purchases are in Indian rupees (₹).",
        { h3: "3.3 Refunds" },
        "We refund unused credits within 30 days of purchase, no questions asked. Email `support@chatwithpdfai.com`.",
        { h3: "3.4 Price changes" },
        "We may change prices going forward. We will email you 30 days before any change. Credits you already bought remain valid.",
      ]},
      { id: "use", title: "4. Acceptable use", body: [
        "You may not:",
        { ul: [
          "Upload content you don't have the right to use",
          "Upload illegal content, including CSAM",
          "Attempt to reverse-engineer, scrape, or extract our models",
          "Use the Service to build a competing product",
          "Use the Service to send spam or unsolicited messages",
          "Bypass rate limits or pay-per-document billing",
        ]},
        "We may suspend or terminate accounts that violate this section.",
      ]},
      { id: "content", title: "5. Your content", body: [
        "You own your content. By uploading, you grant us a limited license to store, process, and display it for the sole purpose of providing the Service to you.",
        "We do **not** train AI models on your content. This applies to us and to every third-party model vendor we use.",
        "You can delete your content at any time. Hard-deletion completes within 30 days as described in our Privacy Policy.",
      ]},
      { id: "ai", title: "6. AI output", body: [
        "The Service uses large language models to generate answers. AI output may be incorrect, misleading, or out of date. **You should verify any AI output before relying on it for important decisions**, especially legal, medical, financial, or safety-critical decisions.",
        "We provide paragraph-level citations to help you verify. We do not guarantee that citations are always accurate, so always check important answers against the cited source before relying on them.",
      ]},
      { id: "warranties", title: "7. Warranties & disclaimers", body: [
        "The Service is provided **as is** and **as available**. We disclaim all warranties to the extent permitted by law, including merchantability and fitness for a particular purpose. We do not warrant that the Service will be uninterrupted, error-free, or accurate.",
      ]},
      { id: "liability", title: "8. Limitation of liability", body: [
        "To the maximum extent permitted by law, our total liability arising from or relating to these Terms is limited to the greater of (a) ₹5,000 and (b) the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.",
      ]},
      { id: "indemnity", title: "9. Your indemnity", body: [
        "You agree to defend and indemnify us against claims arising from your content or your violation of these Terms.",
      ]},
      { id: "termination", title: "10. Termination", body: [
        "You may delete your account at any time. We may terminate your account if you materially breach these Terms, with reasonable notice unless the breach is illegal or causes harm to us or others.",
        "Sections that should survive termination (intellectual property, liability, indemnity, dispute resolution) do.",
      ]},
      { id: "law", title: "11. Governing law & disputes", body: [
        "These Terms are governed by the laws of the jurisdiction in which the operator of CHATWITHPDFAI is established. If a dispute arises, please contact us first at `support@chatwithpdfai.com` so we can try to resolve it.",
      ]},
      { id: "changes", title: "12. Changes", body: [
        "We may update these Terms. Material changes will be announced by email 30 days before they take effect. Your continued use after that constitutes acceptance.",
      ]},
      { id: "contact", title: "13. Contact", body: [
        "CHATWITHPDFAI · `support@chatwithpdfai.com`",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/terms' }, title: "Terms of Service \u2014 CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal \u00b7 Terms"} title={"Terms of Service"} lede={"Plain-English terms. Pay per document. We don't train on your files. You own your content."} lastUpdated={"June 5, 2026"} sections={SECTIONS} />;
}
