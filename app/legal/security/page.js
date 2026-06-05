import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "overview", title: "Overview", body: [
        "Documents you upload to CHATWITHPDFAI can be sensitive — contracts, study material, financial filings, personal records. This page explains, in plain terms, how we handle your data.",
        "We are an independent product, not a large enterprise vendor. We do not currently hold formal certifications such as SOC 2, ISO 27001, or HIPAA, and we do not offer Business Associate Agreements (BAAs). We would rather say that plainly than imply otherwise. If your organisation requires those before processing regulated data, please contact us first at `support@chatwithpdfai.com`.",
      ]},
      { id: "connection", title: "Connection security", body: [
        "The site and every upload are served over HTTPS (TLS), so your data is encrypted in transit between your browser and our servers.",
      ]},
      { id: "ai", title: "How your documents are used with AI", body: [
        "We generate answers and question papers using AI from providers such as OpenAI, Anthropic, and Google, accessed through their APIs.",
        "Under those providers' standard API terms, the content we send is not used to train their models. We do not train any models on your files either.",
        "We send the model only the text needed to answer your current question or build your paper — we do not bulk-upload your library to any model vendor.",
      ]},
      { id: "data", title: "Your data and deletion", body: [
        "Your documents, chats, papers, and credits are tied to your account. You can delete a document from your workspace at any time, which removes it and its extracted text from the app.",
        "If you would like your account and the data associated with it removed, email `support@chatwithpdfai.com`.",
      ]},
      { id: "providers", title: "Service providers", body: [
        "We rely on a small number of third parties to run the service — hosting, the database, payment processing, and the AI providers above. The vendors that process data on our behalf are listed on our sub-processors page.",
      ]},
      { id: "reporting", title: "Reporting a security issue", body: [
        "If you find a security problem, please email `support@chatwithpdfai.com` with a description and steps to reproduce. We will look into it and respond as soon as we can.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/security' }, title: "Security — CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal · Security"} title={"Security"} lede={"How we handle and protect the documents you upload."} lastUpdated={"June 5, 2026"} sections={SECTIONS} />;
}
