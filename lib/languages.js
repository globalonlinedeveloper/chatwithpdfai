// Shared language config for the question-paper generator — the single source of
// truth for BOTH the backend prompt instruction (buildSystem) and the UI selector.
// Add a language by adding one entry here (code, label, instr). Downstream code
// (grading, sets, exporters) is language-agnostic, so no other change is needed.
// English-only for now. The regional languages are kept (commented) below so
// re-enabling is a one-line uncomment each — the UI picker auto-reappears when
// LANGUAGES has more than one entry. Bring them back together with the
// language-fidelity guardrail + language-aware routing for better quality.
export const LANGUAGES = [
  { code: 'en', label: 'English', instr: 'Write everything in clear English.' },
  // { code: 'hi', label: 'हिन्दी (Hindi)', instr: 'Write every question, every option and every explanation in clear, standard Hindi using Devanagari script. Use correct academic terminology; keep widely-used technical terms in English only where that is conventional.' },
  // { code: 'ta', label: 'தமிழ் (Tamil)', instr: 'Write every question, every option and every explanation in clear, standard Tamil. Use correct academic terminology; keep widely-used technical terms in English only where that is conventional.' },
  // { code: 'hi-en', label: 'Hindi + English', instr: 'Write each question and each option in Hindi (Devanagari) first, then its English translation on the next line in parentheses. Keep explanations in English.' },
  // { code: 'ta-en', label: 'Tamil + English', instr: 'Write each question and each option in Tamil first, then its English translation on the next line in parentheses. Keep explanations in English.' },
];
const _byCode = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));
export function langInstr(code) { return (_byCode[code] || _byCode.en).instr; }
export function isLang(code) { return Object.prototype.hasOwnProperty.call(_byCode, code); }
