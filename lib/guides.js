// =================================================================
// SEO landing pages ("guides") — keyword-targeted content pages that
// rank for high-intent searches and funnel to the matching tool.
// Drives /guides, /guides/[slug] and the sitemap. Add an entry to ship
// a new page — no new code needed.
// =================================================================
export const GUIDES = [
  {
    slug: 'summarize-pdf',
    tool: 'chat-with-pdf',
    eyebrow: 'Chat with PDF',
    h1: 'Summarize any PDF with AI',
    lede: 'Drop in a report, contract, research paper or textbook and get a clear summary in seconds — with a citation to the exact page, so you can trust every line.',
    seoTitle: 'How to Summarize Any PDF with AI',
    seoDesc: 'Summarize long PDFs in seconds with AI — key points, section summaries, and answers that cite the exact page. Pay per document, no subscription.',
    sections: [
      { h: 'Upload and ask for a summary', p: 'Drop in any PDF up to 50 MB. Ask “summarize this” or “give me the key points of section 3” and get a concise answer in seconds — no need to read the whole file.' },
      { h: 'Summaries you can trust', p: 'Every answer cites the exact page it came from, so you can click through and verify. That matters for contracts, research and anything high-stakes.' },
      { h: 'Built for long, dense documents', p: 'Research papers, legal agreements, financial reports, manuals and textbooks — the longer and denser the document, the more time an AI summary saves you.' },
      { h: 'Pay only for what you use', p: 'No subscription. You spend credits per question, so a quick summary costs very little and you are never locked into a monthly plan.' },
    ],
    faqs: [
      { q: 'Is there a length limit?', a: 'PDFs up to 50 MB and 500 pages are supported. Text-based PDFs summarize best.' },
      { q: 'Can I get section-by-section summaries?', a: 'Yes — ask for the whole document, or a specific section, chapter or page range.' },
      { q: 'Are my files private?', a: 'Documents are tied to your account and are never used to train AI models.' },
    ],
  },
  {
    slug: 'ask-questions-about-pdf',
    tool: 'chat-with-pdf',
    eyebrow: 'Chat with PDF',
    h1: 'Ask questions about any PDF',
    lede: 'Stop scrolling and Ctrl-F-ing through long documents. Ask in plain English and get the answer — with the exact page it came from.',
    seoTitle: 'Ask Questions About a PDF — Get Cited Answers',
    seoDesc: 'Upload a PDF and ask anything in plain English. Get accurate answers that cite the exact page, across one document or several at once.',
    sections: [
      { h: 'Ask in plain English', p: 'Type a question the way you would ask a colleague — definitions, specific clauses, figures, comparisons. No special syntax, no keywords to guess.' },
      { h: 'Answers cite the source', p: 'Each answer links to the exact page, so you can confirm it instead of trusting a black box. Ideal for legal, academic and financial work.' },
      { h: 'Across one PDF or many', p: 'Ask questions within a single document, or compare and pull facts across several documents at once.' },
      { h: 'For students, researchers and professionals', p: 'Understand a textbook chapter, interrogate a paper, or find the one clause that matters in a 200-page contract.' },
    ],
    faqs: [
      { q: 'How accurate are the answers?', a: 'Answers are grounded in your document and cite the page, so you can verify. We recommend checking citations for high-stakes use.' },
      { q: 'Can I chat across multiple PDFs?', a: 'Yes — ask questions across several documents in one place.' },
      { q: 'How is it priced?', a: 'Pay per use with credits — no subscription. A question typically costs one credit.' },
    ],
  },
  {
    slug: 'mcq-generator-from-pdf',
    tool: 'question-paper-generator',
    eyebrow: 'Question paper generator',
    h1: 'Generate MCQs from a PDF',
    lede: 'Turn a chapter, syllabus or set of notes into multiple-choice questions with a verified answer key — ready to practice, print or assign online.',
    seoTitle: 'MCQ Generator from PDF — Questions with Answer Keys',
    seoDesc: 'Generate multiple-choice questions from a PDF or topic in seconds, with a verified answer key. Practice online, print, or share as an auto-graded test.',
    sections: [
      { h: 'From your source material', p: 'Start from a topic or syllabus and choose how many MCQs you want. Each comes with the correct option marked in the answer key.' },
      { h: 'More than multiple choice', p: 'Mix in fill-in-the-blank, true/false, short and long answers — grouped into sections with marks, like a real paper.' },
      { h: 'A verified answer key', p: 'A second AI pass re-checks the answer key to catch mistakes before you use it. A quick spot-check is still wise before a real exam.' },
      { h: 'Practice, print or assign', p: 'Take the set interactively, export to PDF, or share a link as an auto-graded online test with attempts tracked.' },
    ],
    faqs: [
      { q: 'How many MCQs can I generate?', a: 'Set the count per section — generate a short quiz or a full paper with dozens of questions.' },
      { q: 'Are the answers reliable?', a: 'A second AI pass re-checks the key. We still recommend a quick review before a graded exam.' },
      { q: 'Can students take it online?', a: 'Yes — share a link and answers are auto-graded, with attempts and averages tracked.' },
    ],
  },
  {
    slug: 'question-paper-generator-for-teachers',
    tool: 'question-paper-generator',
    eyebrow: 'Question paper generator',
    h1: 'Question paper generator for teachers',
    lede: 'Build a full exam paper — sections, marks, mixed question types and an answer key — in the time it takes to make a coffee.',
    seoTitle: 'AI Question Paper Generator for Teachers',
    seoDesc: 'Create exam papers with sections, marks, mixed question types and a verified answer key in seconds. Print, practice, or assign as an auto-graded online test.',
    sections: [
      { h: 'A real paper, not a flat list', p: 'Define sections, marks per question and the mix of question types. You get a structured paper that looks like the ones you already set.' },
      { h: 'Answer key included and checked', p: 'Every paper comes with an answer key, re-checked by a second AI pass so you spend less time correcting it.' },
      { h: 'Assign online and auto-grade', p: 'Share a link and let students take it online — responses are graded automatically with attempts and class averages.' },
      { h: 'Print-ready and shareable', p: 'Export a clean PDF for the printer, or hand out a practice version. Layout templates keep it neat.' },
    ],
    faqs: [
      { q: 'What question types are supported?', a: 'Multiple choice, fill-in-the-blank, true/false, short and long answer and more — grouped into sections with marks.' },
      { q: 'Can I print it?', a: 'Yes — export a clean, print-ready PDF, with separate student and teacher (answer key) copies.' },
      { q: 'How is it priced?', a: 'Pay per generation with credits — no subscription.' },
    ],
  },
  {
    slug: 'cbse-ncert-question-paper-generator',
    tool: 'question-paper-generator',
    eyebrow: 'Question paper generator',
    h1: 'CBSE & NCERT question paper generator',
    lede: 'Generate practice papers and tests around CBSE / NCERT syllabus topics — with answer keys, online practice and print-ready export.',
    seoTitle: 'CBSE & NCERT Question Paper Generator (AI)',
    seoDesc: 'Create CBSE and NCERT-style question papers around any syllabus topic in seconds — sections, marks, answer keys, online practice and PDF export.',
    sections: [
      { h: 'Around your syllabus topics', p: 'Enter the chapter or topic and the question mix you want. Generate fresh practice papers as often as you need, with no repeats.' },
      { h: 'Exam-style structure', p: 'Sections, marks and a range of question types so the paper resembles the pattern your students will sit.' },
      { h: 'Answer keys and online practice', p: 'Each paper includes a verified answer key, and you can share it as an auto-graded online test for revision.' },
      { h: 'Print-ready for class', p: 'Export a clean PDF for printing, with separate student and teacher copies.' },
    ],
    faqs: [
      { q: 'Is it tied to a specific board?', a: 'You drive the content by topic and question pattern, so it works for CBSE, NCERT-based and state-board style practice.' },
      { q: 'Will questions repeat?', a: 'The generator avoids repeating questions across your previous papers, so each practice set is fresh.' },
      { q: 'Can students practise online?', a: 'Yes — share a link for auto-graded practice, with attempts and averages tracked.' },
    ],
  },
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
