// =================================================================
// Tool registry — single source of truth for every product tool.
// Drives: /dashboard tiles, app nav, marketing masthead, /tools directory,
// per-tool /tools/[slug] SEO pages, and the sitemap.
// To add a tool: add an entry here (+ build its appHref page).
// status: 'live' | 'beta' | 'coming-soon'
// =================================================================
export const CATEGORIES = ['Read & understand', 'Create'];

export const TOOLS = [
  {
    slug: 'chat-with-pdf',
    name: 'Chat with PDF',
    navKey: 'chat',
    icon: 'doc',
    category: 'Read & understand',
    status: 'live',
    appHref: '/chat-with-pdf',
    tagline: 'Upload a document and ask questions — every answer cites the exact page.',
    seoTitle: 'Chat with PDF — ask questions, get cited answers',
    seoDesc: 'Upload a PDF and chat with it. Ask anything in plain English and get answers that cite the exact page. Pay per document, no subscription.',
    how: [
      { h: 'Upload your PDF', p: 'Drop in a file up to 50 MB and 500 pages. We extract and index the text in seconds.' },
      { h: 'Ask in plain English', p: 'Summaries, definitions, specific facts, comparisons across pages — just type your question.' },
      { h: 'Get cited answers', p: 'Every answer links to the exact page it came from, so you can verify the source.' },
    ],
    faqs: [
      { q: 'What files are supported?', a: 'PDF files up to 50 MB and 500 pages. Text-based PDFs work best.' },
      { q: 'How is it priced?', a: 'You pay per use with credits — no subscription. A question typically costs one credit.' },
      { q: 'Can I chat across multiple PDFs?', a: 'Yes — you can ask questions across several documents at once.' },
      { q: 'Are my documents private?', a: 'Your files are tied to your account and are never used to train models.' },
    ],
  },
  {
    slug: 'question-paper-generator',
    name: 'Question paper generator',
    navKey: 'papers',
    icon: 'paper',
    category: 'Create',
    status: 'live',
    appHref: '/question-paper-generator',
    tagline: 'Generate exam papers with answer keys — practice, print, or share as an online test.',
    seoTitle: 'AI Question Paper Generator — exams with answer keys',
    seoDesc: 'Create exam-style question papers in seconds: multiple sections, marks, and a verified answer key. Practice online, print, or share as an auto-graded test.',
    how: [
      { h: 'Describe your paper', p: 'Enter a topic or syllabus and choose sections, question types, counts and marks.' },
      { h: 'Generate', p: 'Get a structured paper with an answer key — a second AI pass re-checks the answers.' },
      { h: 'Practice, print or share', p: 'Take it interactively, export to PDF, or share a link as an auto-graded online test.' },
    ],
    faqs: [
      { q: 'What question types are supported?', a: 'Multiple choice, fill-in-the-blank, short and long answer, true/false and more, grouped into sections with marks.' },
      { q: 'Are the answers reliable?', a: 'A second AI pass re-checks the answer key. We still recommend a quick spot-check before a real exam.' },
      { q: 'Can students take it online?', a: 'Yes — share a link and answers are auto-graded, with attempts and averages tracked.' },
      { q: 'How is it priced?', a: 'Pay per generation with credits — no subscription.' },
    ],
  },
];

export const liveTools = () => TOOLS.filter((t) => t.status === 'live');
export const toolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);
