import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "scope", title: "1. Scope & roles", body: [
        "This Data Processing Addendum (DPA) supplements our Terms of Service and applies where we process Personal Data on your behalf in connection with the Service.",
        "For the purposes of the GDPR and equivalent laws: **you are the Controller**, and **we are the Processor**.",
        "We are an independent product. We do not currently hold formal certifications (such as SOC 2 or ISO 27001) and do not offer Business Associate Agreements. If your organisation requires those, please do not upload regulated data and contact us first.",
      ]},
      { id: "details", title: "2. Processing details", body: [
        { table: { headers: ["Element", "Value"], rows: [
          ["Subject matter", "Provision of the Service: storing PDFs, generating answers and question papers, returning citations"],
          ["Duration", "The term of your use of the Service, plus the retention described in our Privacy Policy"],
          ["Nature & purpose", "Storage, text extraction, AI inference, search, and export"],
          ["Categories of data subjects", "Anyone whose Personal Data appears in the documents you upload"],
          ["Categories of Personal Data", "Whatever is present in your documents — we do not control this"],
          ["Special-category data", "Only if you choose to upload it. We do not offer BAAs, so please do not upload data that legally requires one"],
        ]} },
      ]},
      { id: "obligations", title: "3. Processor obligations", body: [
        "We will:",
        { ul: [
          "Process Personal Data only to provide the Service and on your instructions",
          "Keep the data confidential",
          "Apply reasonable technical and organisational security measures appropriate to our size (see section 4)",
          "Use only the sub-processors listed at `/legal/sub-processors`",
          "Help you respond to data-subject requests where we reasonably can",
          "Delete the data when you delete it or close your account",
        ]},
      ]},
      { id: "security", title: "4. Security measures", body: [
        { ul: [
          "Data is encrypted in transit over HTTPS (TLS)",
          "Access to your documents and chats is scoped to your account",
          "You can delete a document at any time, which removes it from the app",
          "We send AI providers only the text needed to answer your request, and they do not train on it under their standard API terms",
        ]},
      ]},
      { id: "subprocessors", title: "5. Sub-processors", body: [
        "Our current sub-processors are listed at `/legal/sub-processors`. If we make a material change, we will update that page.",
      ]},
      { id: "transfers", title: "6. International transfers", body: [
        "Some of our providers (for example the AI and payment providers) are based outside your country. Where they process Personal Data, they do so under their own terms and safeguards.",
      ]},
      { id: "breach", title: "7. Personal data breach", body: [
        "If we become aware of a Personal Data breach affecting your data, we will notify you without undue delay with the information we have.",
      ]},
      { id: "termination", title: "8. Termination & data return", body: [
        "When you close your account or ask us to, we will delete the associated Personal Data, except where we are required to keep it by law.",
      ]},
      { id: "contact", title: "9. Contact", body: [
        "Questions about this DPA: `support@chatwithpdfai.com`.",
      ]},
    ];
export const metadata = {
  alternates: { canonical: '/legal/dpa' }, title: "Data Processing Addendum — CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={"Legal · DPA"} title={"Data Processing Addendum"} lede={"How we handle Personal Data that you process through CHATWITHPDFAI."} lastUpdated={"June 5, 2026"} sections={SECTIONS} />;
}
