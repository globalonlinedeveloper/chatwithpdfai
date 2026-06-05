import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "intro", title: "1. Introduction", body: [
        "CHATWITHPDFAI (\"we\", \"us\", \"our\") lets you upload PDF documents to chat with them and to generate question papers using AI. This Privacy Policy explains what data we collect, what we do with it, and the rights you have over it.",
        { quote: "Short version: we collect what we need to run the service, we do not sell your data, we do not train AI models on your files, and you can delete your documents and your account at any time." },
      ]},
      { id: "data", title: "2. Data we collect", body: [
        { h3: "2.1 Account data" },
        "When you create an account, we collect your name, email address, and a securely hashed password. You sign in with your email and password.",
        { h3: "2.2 Document content" },
        "We store the PDFs you upload, the text we extract from them, the chats you have about them, and the question papers you generate. We access this content only to provide the service — for example, extracting text and sending the relevant part to an AI model to answer your question.",
        { h3: "2.3 Usage data" },
        "We log standard server data such as IP address, browser/user agent, request timestamps, and feature usage (for example, how many credits you have spent). We use this to operate the service, prevent abuse, and improve the product.",
        { h3: "2.4 Billing data" },
        "We use **Razorpay** as our payment processor. Razorpay handles your card details directly — we never see or store your full card number. We receive only the limited information needed to manage your credits, such as a payment token and transaction record.",
      ]},
      { id: "use", title: "3. How we use your data", body: [
        "We use your data to:",
        { ul: [
          "Provide the service (process uploads, generate answers and papers, cite sources)",
          "Authenticate you and keep your account secure",
          "Process payments and prevent fraud",
          "Send transactional emails (receipts, verification, password resets)",
          "Operate, debug, and improve the service",
          "Comply with legal obligations",
        ]},
        "We do **not** use your documents or chat content to train AI models, and the AI providers we use do not train on this content under their standard API terms (see Sub-processors).",
      ]},
      { id: "share", title: "4. Who we share it with", body: [
        "We share data only with the service providers that help us run CHATWITHPDFAI. The full list is at `/legal/sub-processors`. In summary:",
        { table: {
          headers: ["Category", "Vendor", "Purpose"],
          rows: [
            ["Hosting, database & email", "Hostinger", "Running the app, storing your data, and sending transactional email"],
            ["AI inference", "OpenAI, Anthropic, Google", "Generating answers and question papers from your content"],
            ["Payments", "Razorpay", "Processing payments"],
          ],
        }},
        "We do not sell your data. We will only disclose data where required by a valid legal process.",
      ]},
      { id: "retention", title: "5. Retention & deletion", body: [
        "We keep your data while your account is active. You can delete a document at any time, which removes it and its extracted text from the app. If you delete your account, the data associated with it is removed; routine backups cycle out over time.",
      ]},
      { id: "rights", title: "6. Your rights", body: [
        "Depending on where you live (for example GDPR in the EU/UK, or CCPA in California), you may have the right to:",
        { ul: [
          "**Access** the data we hold about you",
          "**Correct** anything that is wrong",
          "**Delete** your account and data",
          "**Export** your data",
          "**Object to** or **restrict** certain processing",
          "**Withdraw consent** for optional processing",
        ]},
        "To exercise any of these, email `support@chatwithpdfai.com`.",
      ]},
      { id: "children", title: "7. Children", body: [
        "CHATWITHPDFAI is not directed at children under 16, and we do not knowingly collect their data. If you believe a child has given us data, contact `support@chatwithpdfai.com` and we will delete it.",
      ]},
      { id: "changes", title: "8. Changes to this policy", body: [
        "If we make material changes, we will update this page and adjust the date below. Please check back from time to time.",
      ]},
      { id: "contact", title: "9. Contact", body: [
        "For any privacy question or request, email `support@chatwithpdfai.com`.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/privacy' }, title: "Privacy Policy — CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal · Privacy"} title={"Privacy Policy"} lede={"We collect what we need to run the service. We do not sell your data. We do not train AI models on your files."} lastUpdated={"June 5, 2026"} sections={SECTIONS} />;
}
