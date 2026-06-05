import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "intro", title: "Current sub-processors", body: [
        "These are the third parties we use to run the service. We send each only the data needed for its purpose. If you have questions, email `support@chatwithpdfai.com`.",
        { table: {
          headers: ["Vendor", "Purpose", "Data processed", "Region"],
          rows: [
            ["Hostinger", "Web hosting, application database, and transactional email", "Account details, your documents and their extracted text, papers, and chats", "EU"],
            ["OpenAI", "AI inference", "Document text and queries needed to answer — not used to train models", "US"],
            ["Anthropic", "AI inference", "Document text and queries needed to answer — not used to train models", "US"],
            ["Google (Gemini)", "AI inference", "Document text and queries needed to answer — not used to train models", "US"],
            ["Razorpay", "Payment processing", "Billing email, payment token, and transaction history (we never see full card numbers)", "India"],
          ],
        }},
      ]},
      { id: "changes", title: "Changes", body: [
        "We may add or change sub-processors as the product evolves. If we make a material change to how your data is processed, we will update this page. Questions or objections: `support@chatwithpdfai.com`.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/sub-processors' }, title: "Sub-processors — CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal · Sub-processors"} title={"Sub-processors"} lede={"The third-party services we use to run CHATWITHPDFAI."} lastUpdated={"June 5, 2026"} sections={SECTIONS} />;
}
