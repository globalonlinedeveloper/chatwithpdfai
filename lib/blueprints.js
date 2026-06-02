// Exam blueprint registry for the question-paper generator.
// Pure data, no React, no I/O. The picker UI in
// app/question-paper-generator/page.js imports CATEGORIES from here.
//
// Shape (must stay in sync with the picker + applyPreset handler):
//   CATEGORIES: Array<{
//     k: string,            // category key used by the category chips
//     label: string,        // category chip label
//     presets: Array<{
//       label: string,        // preset chip label
//       examStyle: string,    // applied to examStyle state
//       topic: string,        // applied to topic state
//       level?: string,       // optional hint; applyPreset currently ignores it
//       sections: Array<{ title: string, type: string, count: number, marks: number }>
//     }>
//   }>
//
// `type` must be one of the generator's supported question types:
//   mcq, multi, tf, fill, match, assertion, numeric, short, long, code.
//
// NOTE: section `count` and `marks` are sensible editable defaults — teachers
// can tune them in the builder before generating. CBSE "case-based" items are
// approximated here as short-answer (`short`) until a dedicated case-study
// question type exists.
export const CATEGORIES = [
  { k: 'exams', label: 'Govt / competitive exams', presets: [
    { label: 'TNPSC Group 4', examStyle: 'TNPSC Group 4', topic: 'TNPSC Group 4 general studies — Indian polity, history, geography, science and current affairs', sections: [{ title: 'Part A — General studies', type: 'mcq', count: 15, marks: 1 }, { title: 'Part B — Assertion & reason', type: 'assertion', count: 5, marks: 2 }] },
    { label: 'UPSC Prelims — GS Paper I', examStyle: 'UPSC Prelims GS Paper I', topic: 'UPSC Civil Services Prelims — General Studies Paper I', sections: [{ title: 'General studies', type: 'mcq', count: 20, marks: 2 }] },
    { label: 'SSC CGL Tier-1', examStyle: 'SSC CGL Tier I', topic: 'SSC CGL Tier 1 — reasoning, general awareness, quantitative aptitude, English', sections: [{ title: 'General intelligence & reasoning', type: 'mcq', count: 10, marks: 2 }, { title: 'General awareness', type: 'mcq', count: 10, marks: 2 }, { title: 'Quantitative aptitude', type: 'mcq', count: 10, marks: 2 }, { title: 'English comprehension', type: 'mcq', count: 10, marks: 2 }] },
  ] },
  { k: 'programming', label: 'Programming & IT', presets: [
    { label: 'Java — OOP & collections', examStyle: 'Java', topic: 'Core Java — OOP, collections, exceptions, generics and streams', sections: [{ title: 'Part A — Concepts', type: 'mcq', count: 8, marks: 1 }, { title: 'Part B — Code output', type: 'code', count: 4, marks: 2 }, { title: 'Part C — Short answer', type: 'short', count: 3, marks: 3 }] },
    { label: 'Python basics', examStyle: 'Python', topic: 'Python fundamentals — data types, control flow, functions, lists and dicts', sections: [{ title: 'Part A — Concepts', type: 'mcq', count: 10, marks: 1 }, { title: 'Part B — Output', type: 'code', count: 5, marks: 2 }] },
    { label: 'AWS Solutions Architect', examStyle: 'AWS Certified Solutions Architect Associate', topic: 'AWS SAA — EC2, S3, VPC, IAM, RDS, autoscaling and the well-architected framework', sections: [{ title: 'Domain questions', type: 'mcq', count: 12, marks: 1 }, { title: 'Multi-response', type: 'multi', count: 3, marks: 2 }] },
    { label: 'SQL', examStyle: 'SQL', topic: 'SQL — joins, group by, subqueries, indexing and normalization', sections: [{ title: 'Concepts', type: 'mcq', count: 8, marks: 1 }, { title: 'Query output', type: 'code', count: 4, marks: 2 }] },
  ] },
  { k: 'school', label: 'School (CBSE / State)', presets: [
    { label: 'CBSE Class 10 — Science', examStyle: 'CBSE Class 10', level: 'School', topic: 'CBSE Class 10 Science — physics, chemistry & biology', sections: [{ title: 'Section A — Multiple choice', type: 'mcq', count: 16, marks: 1 }, { title: 'Section A — Assertion & reason', type: 'assertion', count: 4, marks: 1 }, { title: 'Section B — Short answer', type: 'short', count: 6, marks: 2 }, { title: 'Section C — Short answer', type: 'short', count: 7, marks: 3 }, { title: 'Section D — Long answer', type: 'long', count: 3, marks: 5 }, { title: 'Section E — Case-based', type: 'short', count: 3, marks: 4 }] },
    { label: 'CBSE Class 10 — Mathematics', examStyle: 'CBSE Class 10', level: 'School', topic: 'CBSE Class 10 Mathematics', sections: [{ title: 'Section A — Multiple choice', type: 'mcq', count: 18, marks: 1 }, { title: 'Section A — Assertion & reason', type: 'assertion', count: 2, marks: 1 }, { title: 'Section B — Short answer', type: 'short', count: 5, marks: 2 }, { title: 'Section C — Short answer', type: 'short', count: 6, marks: 3 }, { title: 'Section D — Long answer', type: 'long', count: 4, marks: 5 }, { title: 'Section E — Case-based', type: 'short', count: 3, marks: 4 }] },
    { label: 'CBSE Class 12 — Physics', examStyle: 'CBSE Class 12', level: 'School', topic: 'CBSE Class 12 Physics', sections: [{ title: 'Section A — Multiple choice', type: 'mcq', count: 16, marks: 1 }, { title: 'Section B — Short answer', type: 'short', count: 5, marks: 2 }, { title: 'Section C — Short answer', type: 'short', count: 7, marks: 3 }, { title: 'Section D — Long answer', type: 'long', count: 3, marks: 5 }, { title: 'Section E — Case-based', type: 'short', count: 2, marks: 4 }] },
  ] },
  { k: 'medical', label: 'Medical & nursing', presets: [
    { label: 'NEET — Biology', examStyle: 'NEET', topic: 'NEET Biology — botany & zoology', sections: [{ title: 'Botany', type: 'mcq', count: 25, marks: 4 }, { title: 'Zoology', type: 'mcq', count: 25, marks: 4 }] },
  ] },
  { k: 'engineering', label: 'Engineering / entrance', presets: [
    { label: 'JEE Main', examStyle: 'JEE Main', topic: 'JEE Main — physics, chemistry & mathematics', sections: [{ title: 'Physics', type: 'mcq', count: 15, marks: 4 }, { title: 'Chemistry', type: 'mcq', count: 15, marks: 4 }, { title: 'Mathematics', type: 'mcq', count: 15, marks: 4 }] },
  ] },
  { k: 'languages', label: 'Languages', presets: [
    { label: 'English grammar', examStyle: 'English', topic: 'English grammar — tenses, prepositions, articles and sentence correction', sections: [{ title: 'Grammar MCQ', type: 'mcq', count: 10, marks: 1 }, { title: 'Fill the blanks', type: 'fill', count: 5, marks: 1 }] },
  ] },
  { k: 'custom', label: 'Custom', presets: [] },
];
