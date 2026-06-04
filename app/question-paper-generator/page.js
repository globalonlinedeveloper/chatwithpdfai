'use client';
import AppNav from '../_components/AppNav';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toGIFT, toMoodleXML, toCSV, toAiken, toQTIZip, downloadBlob, downloadText, slug } from './exporters';
import { grade, correctText, flatQs, studentAnswerText } from './grade.js';
import { deriveSets } from './sets.js';
import { CATEGORIES } from '@/lib/blueprints';
import { LANGUAGES } from '@/lib/languages';
import { TYPE_LABELS, ALL_TYPES, LANG_NAME, isAuto, clampInt, clampHalf, PaperView, PromptStem, PracticeInput, Feedback, EditAnswerControl, OMRSheet } from './paper-render';

export default function PapersPage() {
  const [bpKey, setBpKey] = useState('custom'); // selected exam-blueprint dropdown value ('custom' = define your own sections)
  const [asideOpen, setAsideOpen] = useState(true); // left papers panel collapse toggle
  const [fullSize, setFullSize] = useState(false); // "Full real-size exam" toggle (batched generation)
  const [fullConfirm, setFullConfirm] = useState(false); // showing the full-size confirm panel
  const [fullProg, setFullProg] = useState(''); // batch progress text during full generation
  const [uploading, setUploading] = useState(false); // direct PDF upload in progress
  const [uploadMsg, setUploadMsg] = useState(''); // upload status message
  const [srcOpen, setSrcOpen] = useState(false); // content-source picker open
  const [srcQuery, setSrcQuery] = useState(''); // source search text
  const [srcLoading, setSrcLoading] = useState(false); // source search in flight
  const [selectedDoc, setSelectedDoc] = useState(null); // chosen source doc (for the chip)
  const [bpTopic, setBpTopic] = useState(''); // blueprint's built-in syllabus (drives generation; kept out of the user Scope field)
  const [srcActive, setSrcActive] = useState(0); // keyboard-highlighted row in the source picker (0 = From scratch)
  const [printAll, setPrintAll] = useState(false); // render all shuffled sets for one print job
  const [omr, setOmr] = useState(false); // show/print a bubble OMR answer sheet
  const [examStyle, setExamStyle] = useState('');
  const [topic, setTopic] = useState('');
  const [institution, setInstitution] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sections, setSections] = useState([{ title: 'Section A', type: 'mcq', count: 10, marks: 1 }]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('en');
  const [includeKey, setIncludeKey] = useState(true);
  const [verify, setVerify] = useState(true);
  const [prevStems, setPrevStems] = useState([]);
  const [docs, setDocs] = useState([]);
  const [sourceDocId, setSourceDocId] = useState(0);
  const [library, setLibrary] = useState([]);
  const [savedMsg, setSavedMsg] = useState('');
  const [shares, setShares] = useState([]);
  const [shareMsg, setShareMsg] = useState('');
  const [attemptsFor, setAttemptsFor] = useState(null);
  const [attemptList, setAttemptList] = useState([]);
  const [statsFor, setStatsFor] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviewFor, setReviewFor] = useState(null);
  const [review, setReview] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState(null);
  const [used, setUsed] = useState(null);
  const [credits, setCredits] = useState(null);
  const [note, setNote] = useState('');
  const [view, setView] = useState('paper');
  const [layout, setLayout] = useState('official');
  const [sets, setSets] = useState(1); // number of shuffled sets to produce (1 = off)
  const [curSet, setCurSet] = useState(0); // index of the set currently shown/printed
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [editAns, setEditAns] = useState(false);
  const [regenGi, setRegenGi] = useState(null);
  const [hist, setHist] = useState([]);
  const [future, setFuture] = useState([]);
  const [pristine, setPristine] = useState(null);
  const [bank, setBank] = useState([]);
  const [bankShareOpen, setBankShareOpen] = useState(false);
  const [grantees, setGrantees] = useState([]);
  const [grantEmail, setGrantEmail] = useState('');
  const [bankQ, setBankQ] = useState('');
  const editSnapRef = useRef(0);
  const [cognitive, setCognitive] = useState('');
  const [logo, setLogo] = useState('');
  const [elapsed, setElapsed] = useState(0); // seconds since generation started (progress feedback)
  const [shortWarn, setShortWarn] = useState(''); // set when fewer questions came back than requested
  const abortRef = useRef(null); // in-flight AbortController so Cancel can abort
  const timerRef = useRef(null); // setInterval id for the elapsed counter
  const headingRef = useRef(null); // result heading, focused when a paper first appears
  const fileRef = useRef(null); // hidden file input for direct PDF upload
  const srcBoxRef = useRef(null); // source picker container (click-outside)

  useEffect(() => { try { const d = Number(new URLSearchParams(window.location.search).get('doc')) || 0; if (d) { setSourceDocId(d); fetch('/api/documents/' + d).then((r) => r.ok ? r.json() : null).then((j) => { if (j && j.document) setSelectedDoc({ id: j.document.id, filename: j.document.filename, pageCount: j.document.pageCount, sizeBytes: j.document.sizeBytes }); }).catch(() => {}); } } catch (e) {} }, []);
  useEffect(() => { fetch('/api/credits').then((r) => { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return null; } return r.json(); }).then((j) => { if (j && typeof j.balance === 'number') setCredits(j.balance); }).catch(() => {});
    loadLibrary(); loadShares(); try { const pid = Number(new URLSearchParams(window.location.search).get('paper')) || 0; if (pid) openPaper(pid); } catch (e) {} }, []);
  useEffect(() => { const t = setTimeout(loadBank, 250); return () => clearTimeout(t); }, [bankQ]);
  useEffect(() => { try { const u = new URLSearchParams(window.location.search); if (u.get('paper') || u.get('doc')) return; const d = JSON.parse(localStorage.getItem('cwpai_qpg_draft') || 'null'); if (d && Array.isArray(d.sections) && d.sections.length) { if (typeof d.topic === 'string') setTopic(d.topic); setSections(d.sections); if (d.institution) setInstitution(d.institution); if (d.instructions) setInstructions(d.instructions); if (d.difficulty) setDifficulty(d.difficulty); if (d.sets) setSets(d.sets); if (d.examStyle) setExamStyle(d.examStyle); if (typeof d.logo === 'string') setLogo(d.logo); } } catch (e) {} }, []);
  useEffect(() => { try { localStorage.setItem('cwpai_qpg_draft', JSON.stringify({ topic, sections, institution, instructions, difficulty, sets, examStyle, logo })); } catch (e) {} }, [topic, sections, institution, instructions, difficulty, sets, examStyle, logo]);
  useEffect(() => { setPaper((pp) => pp ? { ...pp, logo } : pp); }, [logo]);
  useEffect(() => {
    if (!srcOpen) return; let live = true; setSrcLoading(true);
    const t = setTimeout(() => { const q = srcQuery.trim(); fetch('/api/documents?limit=30' + (q ? '&q=' + encodeURIComponent(q) : '')).then((r) => r.ok ? r.json() : null).then((j) => { if (!live) return; const list = (j && Array.isArray(j.documents)) ? j.documents : []; const seen = new Set(); const uniq = list.filter((d) => d.status === 'ready').filter((d) => { const k = (d.filename || '') + '|' + (d.sizeBytes || 0); if (seen.has(k)) return false; seen.add(k); return true; }); setDocs(uniq); setSrcActive(0); setSrcLoading(false); }).catch(() => { if (live) { setDocs([]); setSrcLoading(false); } }); }, 220);
    return () => { live = false; clearTimeout(t); };
  }, [srcQuery, srcOpen]);
  useEffect(() => { if (!srcOpen) return; function onDown(e) { if (srcBoxRef.current && !srcBoxRef.current.contains(e.target)) setSrcOpen(false); } document.addEventListener('mousedown', onDown); return () => document.removeEventListener('mousedown', onDown); }, [srcOpen]);

  function applyPreset(p) { setExamStyle(p.examStyle); setBpTopic(p.topic); setSections(p.sections.map((s) => ({ ...s }))); }
  function chooseBlueprint(v) { setBpKey(v); setTopic(''); setFullSize(false); setFullConfirm(false); if (!v || v === 'custom') { setExamStyle(''); setBpTopic(''); setSections([{ title: 'Section A', type: 'mcq', count: 10, marks: 1 }]); return; } const ck = v.split('||')[0]; const lbl = v.slice(ck.length + 2); const c = CATEGORIES.find((x) => x.k === ck); const p = c && c.presets.find((x) => x.label === lbl); if (p) { applyPreset(p); } }
  function selectSource(doc) { if (!doc) { setSelectedDoc(null); setSourceDocId(0); } else { setSelectedDoc({ id: doc.id, filename: doc.filename, pageCount: doc.pageCount, sizeBytes: doc.sizeBytes }); setSourceDocId(Number(doc.id)); } setSrcOpen(false); setSrcQuery(''); }
  async function delDoc(d) { if (!d || (typeof window !== 'undefined' && !window.confirm('Delete "' + (d.filename || 'this PDF') + '"? This permanently removes the PDF and its extracted data.'))) return; try { const r = await fetch('/api/documents/' + d.id, { method: 'DELETE' }); if (!r.ok) { const j = await r.json().catch(() => ({})); setNote(j.error || 'Could not delete the PDF.'); return; } setDocs((arr) => (arr || []).filter((x) => x.id !== d.id)); if (Number(sourceDocId) === Number(d.id)) selectSource(null); } catch (e) { setNote('Could not delete the PDF.'); } }
  function srcKey(e) { const max = docs.length; if (e.key === 'Escape') { setSrcOpen(false); } else if (e.key === 'ArrowDown') { e.preventDefault(); setSrcActive((a) => Math.min(a + 1, max)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setSrcActive((a) => Math.max(a - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); if (srcActive === 0) selectSource(null); else if (docs[srcActive - 1]) selectSource(docs[srcActive - 1]); } }
  function printAllSets() { if (setsArr.length <= 1) { window.print(); return; } setPrintAll(true); setTimeout(() => { window.print(); setTimeout(() => setPrintAll(false), 250); }, 150); }
  async function uploadSource(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setUploadMsg('Please choose a PDF file.'); return; }
    if (file.size > 50 * 1024 * 1024) { setUploadMsg('That PDF is over the 50 MB limit.'); return; }
    setUploading(true); setUploadMsg('Uploading & reading \u201c' + file.name + '\u201d \u2014 this can take a moment\u2026');
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/documents/upload', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
      if (r.status === 409 && j.duplicate && j.existingId) { selectSource({ id: j.existingId, filename: j.filename || file.name }); setUploadMsg('Already in your library \u2014 selected it as the source.'); setUploading(false); return; }
      if (!r.ok) { setUploadMsg(r.status === 403 ? 'Please verify your email before uploading.' : (j.error || 'Upload failed.')); setUploading(false); return; }
      const id = j.document && j.document.id;
      selectSource(j.document || { id, filename: file.name });
      setUploadMsg('Added \u201c' + ((j.document && j.document.filename) || file.name) + '\u201d \u2014 now grounding from it.');
      setUploading(false);
    } catch (e) { setUploadMsg('Upload failed: ' + (e.message || 'error')); setUploading(false); }
  }
  function setSec(i, patch) { setSections((cur) => cur.map((s, j) => j === i ? { ...s, ...patch } : s)); }
  function addSec() { setSections((cur) => [...cur, { title: 'Section ' + String.fromCharCode(65 + cur.length), type: 'mcq', count: 5, marks: 1 }]); }
  function delSec(i) { setSections((cur) => cur.length > 1 ? cur.filter((_, j) => j !== i) : cur); }
  function loadLibrary() { fetch('/api/papers/library').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.papers)) setLibrary(j.papers); }).catch(() => {}); }
  async function savePaper() { if (!paper) return; setSavedMsg('Saving\u2026'); try { const r = await fetch('/api/papers/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setSavedMsg('Saved to library'); loadLibrary(); setTimeout(() => setSavedMsg(''), 2200); } else setSavedMsg(j.error || 'Save failed'); } catch (e) { setSavedMsg(e.message); } }
  async function openPaper(id) { try { const r = await fetch('/api/papers/library?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && j.paper) { setPaper(j.paper); setLogo(j.paper.logo || ''); freshHistory(j.paper); setCurSet(0); setLayout(j.paper.layout || 'official'); setView('paper'); setChecked(false); setAnswers({}); setUsed(null); setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); } } catch (e) {} }
  async function delPaper(id) { try { await fetch('/api/papers/library?id=' + id, { method: 'DELETE' }); loadLibrary(); } catch (e) {} }
  function loadShares() { fetch('/api/papers/assignments').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.assignments)) setShares(j.assignments); }).catch(() => {}); }
  function loadBank() { fetch('/api/papers/bank' + (bankQ ? '?q=' + encodeURIComponent(bankQ) : '')).then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.items)) setBank(j.items); }).catch(() => {}); }
  function loadGrants() { fetch('/api/papers/bank/share').then((r) => r.ok ? r.json() : null).then((j) => { if (j && Array.isArray(j.grantees)) setGrantees(j.grantees); }).catch(() => {}); }
  async function grantBank() { const email = grantEmail.trim(); if (!email) return; try { const r = await fetch('/api/papers/bank/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const j = await r.json().catch(() => ({})); if (r.ok) { setGrantEmail(''); loadGrants(); } else setNote(j.error || 'Could not share'); } catch (e) {} }
  async function revokeBank(email) { setGrantees((arr) => (arr || []).filter((g) => g.email !== email)); try { await fetch('/api/papers/bank/share?email=' + encodeURIComponent(email), { method: 'DELETE' }); } catch (e) {} }
  function saveToBank(gi) { if (!paper) return; let n = -1, q = null; paper.sections.forEach((s) => s.questions.forEach((qq) => { n += 1; if (n === gi) q = qq; })); if (!q) return; fetch('/api/papers/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, topic: (topic.trim() || paper.examStyle || paper.title || '') }) }).then((r) => r.json().catch(() => ({}))).then((j) => { if (j && j.ok) { setSavedMsg('Saved to bank'); loadBank(); setTimeout(() => setSavedMsg(''), 1800); } else setSavedMsg((j && j.error) || 'Could not save to bank'); }).catch(() => {}); }
  async function insertFromBank(id) { if (!paper) { setNote('Generate or open a paper first, then insert from the bank.'); return; } try { const r = await fetch('/api/papers/bank?id=' + id); const j = await r.json().catch(() => ({})); if (!r.ok || !j.question) { setNote('Could not load that question.'); return; } pushHist(); setPaper((pp) => { if (!pp || !pp.sections.length) return pp; const sections = pp.sections.map((sec, i) => i === pp.sections.length - 1 ? { ...sec, questions: [...sec.questions, j.question] } : sec); const totalMarks = sections.reduce((t, sec) => t + sec.questions.length * (Number(sec.marks) || 1), 0); return { ...pp, sections, totalMarks }; }); } catch (e) { setNote('Insert failed.'); } }
  async function delBankQ(id) { setBank((arr) => (arr || []).filter((x) => x.id !== id)); try { await fetch('/api/papers/bank?id=' + id, { method: 'DELETE' }); } catch (e) {} }
  async function shareTest() { if (!paper) return; setShareMsg('Creating link\u2026'); try { const r = await fetch('/api/papers/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper }) }); const j = await r.json().catch(() => ({})); if (r.ok && j.token) { const url = window.location.origin + '/t/' + j.token; try { await navigator.clipboard.writeText(url); setShareMsg('Link copied \u2014 ' + url); } catch (e2) { setShareMsg('Share link: ' + url); } loadShares(); } else setShareMsg(j.error || 'Could not create link'); } catch (e) { setShareMsg(e.message); } }
  async function delShare(id) { try { await fetch('/api/papers/assignments?id=' + id, { method: 'DELETE' }); loadShares(); } catch (e) {} }
  async function viewAttempts(id) { if (attemptsFor === id) { setAttemptsFor(null); return; } try { const r = await fetch('/api/papers/assignments?id=' + id); const j = await r.json().catch(() => ({})); if (r.ok && Array.isArray(j.attempts)) { setAttemptList(j.attempts); setAttemptsFor(id); } } catch (e) {} }
  async function viewStats(id) { if (statsFor === id) { setStatsFor(null); return; } try { const r = await fetch('/api/papers/assignments?id=' + id + '&stats=1'); const j = await r.json().catch(() => ({})); if (r.ok && j.stats) { setStats(j.stats); setStatsFor(id); } } catch (e) {} }
  function exportScores(title) { const rows = [['Student', 'Score', 'Total', 'Percent', 'Submitted']]; (attemptList || []).forEach((a) => rows.push([a.name || 'Anonymous', a.score, a.total, a.total ? Math.round(100 * a.score / a.total) + '%' : '', a.createdAt ? new Date(a.createdAt).toLocaleString() : ''])); const csv = rows.map((r) => r.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\r\n'); downloadText(slug(title || 'scores') + '-scores.csv', csv, 'text/csv'); }
  async function overrideScore(attemptId, score, assignmentId) { try { const r = await fetch('/api/papers/assignments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: assignmentId, attemptId, score: Number(score) }) }); if (r.ok) { setAttemptList((arr) => (arr || []).map((a) => a.id === attemptId ? { ...a, score: Math.max(0, Math.min(Number(a.total) || 0, Math.round(Number(score)) || 0)) } : a)); loadShares(); } } catch (e) {} }
  async function reviewAttempt(assignmentId, attemptId) { if (reviewFor === attemptId) { setReviewFor(null); setReview(null); return; } try { const r = await fetch('/api/papers/assignments?id=' + assignmentId + '&attemptId=' + attemptId); const j = await r.json().catch(() => ({})); if (r.ok && j.paper) { setReview({ paper: j.paper, answers: j.answers || {} }); setReviewFor(attemptId); } else { setReviewFor(null); } } catch (e) {} }
  function startRename(kind, id, cur) { setRenaming(kind + ':' + id); setRenameVal(String(cur || '')); }
  async function saveRename() { const cur = renaming; if (!cur) return; const ci = cur.indexOf(':'); const kind = cur.slice(0, ci); const id = Number(cur.slice(ci + 1)); const val = renameVal.trim(); setRenaming(null); if (!val) return; const url = kind === 'lib' ? '/api/papers/library' : kind === 'share' ? '/api/papers/assignments' : '/api/papers/bank'; const body = kind === 'bank' ? { id, stem: val } : { id, title: val }; try { await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); } catch (e) {} if (kind === 'lib') loadLibrary(); else if (kind === 'share') loadShares(); else loadBank(); }
  function delQuestion(gi) { if (!paper) return; pushHist(); setPaper((pp) => { if (!pp) return pp; let n = -1; const sections = pp.sections.map((sec) => ({ ...sec, questions: (sec.questions || []).filter(() => { n += 1; return n !== gi; }) })); const totalMarks = sections.reduce((t, sec) => t + sec.questions.length * (Number(sec.marks) || 1), 0); return { ...pp, sections, totalMarks }; }); }
  async function clonePaper(id) { await openPaper(id); setPaper((pp) => pp ? { ...pp, title: 'Copy of ' + (pp.title || 'paper') } : pp); setSavedMsg(''); }
  function onLogoFile(file) { if (!file) return; const reader = new FileReader(); reader.onload = () => { const img = new Image(); img.onload = () => { try { const max = 220; const sc = Math.min(1, max / (img.width || 1)); const w = Math.max(1, Math.round((img.width || 1) * sc)); const h = Math.max(1, Math.round((img.height || 1) * sc)); const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); setLogo(cv.toDataURL('image/png')); } catch (e) { setNote('Could not process that image.'); } }; img.onerror = () => setNote('Could not read that image.'); img.src = String(reader.result); }; reader.readAsDataURL(file); }
  function patchQ(gi, patch) { setPaper((pp) => { if (!pp) return pp; let n = -1; return { ...pp, sections: pp.sections.map((s) => ({ ...s, questions: s.questions.map((q) => { n += 1; return n === gi ? { ...q, ...patch } : q; }) })) }; }); }
  function _clone(x) { try { return JSON.parse(JSON.stringify(x)); } catch (e) { return x; } }
  function pushHist() { if (paper) { setHist((h) => [...h.slice(-39), _clone(paper)]); setFuture([]); } }
  function freshHistory(p) { setHist([]); setFuture([]); setPristine(_clone(p)); editSnapRef.current = 0; }
  function editPatch(gi, patch) { const now = Date.now(); if (now - editSnapRef.current > 700) pushHist(); editSnapRef.current = now; patchQ(gi, patch); }
  function undoEdit() { if (!hist.length) return; const prev = hist[hist.length - 1]; setFuture((ff) => [...ff.slice(-39), _clone(paper)]); setHist((h) => h.slice(0, -1)); setPaper(prev); editSnapRef.current = 0; }
  function redoEdit() { if (!future.length) return; const nx = future[future.length - 1]; setHist((h) => [...h.slice(-39), _clone(paper)]); setFuture((ff) => ff.slice(0, -1)); setPaper(nx); editSnapRef.current = 0; }
  function revertAll() { if (!pristine) return; pushHist(); setPaper(_clone(pristine)); editSnapRef.current = 0; }
  function replaceQ(gi, nq) { setPaper((pp) => { if (!pp) return pp; let n = -1; return { ...pp, sections: pp.sections.map((s) => ({ ...s, questions: s.questions.map((qq) => { n += 1; return n === gi ? nq : qq; }) })) }; }); }
  async function regenQ(gi) {
    if (!paper || regenGi != null) return;
    let si = -1, tgt = null, n = -1;
    paper.sections.forEach((s, a) => s.questions.forEach((qq) => { n += 1; if (n === gi) { si = a; tgt = qq; } }));
    if (!tgt) return;
    const sec = paper.sections[si];
    const exclude = paper.sections.flatMap((s) => s.questions.map((x) => String((x && (x.q || x.assertion)) || '').slice(0, 140))).filter(Boolean);
    pushHist(); setRegenGi(gi); setNote('');
    try {
      const body = { topic: (topic.trim() || paper.title || ''), examStyle, level, difficulty, language, institution, instructions, sections: [{ title: sec.title || '', types: [tgt.type], count: 1, marks: Number(sec.marks || 1) }], nonce: Math.random().toString(36).slice(2), exclude: exclude.slice(-80), verify: false, documentId: sourceDocId };
      const r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname); return; } setNote(j.error || 'Could not regenerate that question.'); return; }
      const nq = (j.paper && Array.isArray(j.paper.sections) && j.paper.sections[0] && Array.isArray(j.paper.sections[0].questions)) ? j.paper.sections[0].questions[0] : null;
      if (!nq) { setNote('No replacement came back — try again.'); return; }
      setPaper((pp) => { if (!pp) return pp; let m = -1; return { ...pp, sections: pp.sections.map((s) => ({ ...s, questions: s.questions.map((qq) => { m += 1; return m === gi ? nq : qq; }) })) }; });
      if (typeof j.credits === 'number') setUsed((u) => (Number(u) || 0) + j.credits);
      if (typeof j.balance === 'number') setCredits(j.balance);
    } catch (e) { setNote('Regenerate failed — try again.'); }
    finally { setRegenGi(null); }
  }

  async function regenSection(si) {
    if (!paper || regenGi != null || busy) return;
    const sec = paper.sections[si]; if (!sec) return;
    const exclude = paper.sections.flatMap((s) => s.questions.map((x) => String((x && (x.q || x.assertion)) || '').slice(0, 140))).filter(Boolean);
    pushHist(); setRegenGi('s' + si); setNote('');
    try {
      const body = { topic: (topic.trim() || paper.title || ''), examStyle, level, difficulty, language, institution, instructions, sections: [{ title: sec.title || '', types: (sec.types && sec.types.length ? sec.types : ['mcq']), count: sec.questions.length || 5, marks: Number(sec.marks || 1) }], nonce: Math.random().toString(36).slice(2), exclude: exclude.slice(-80), verify: false, documentId: sourceDocId };
      const r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname); return; } setNote(j.error || 'Could not regenerate that section.'); return; }
      const ns = (j.paper && Array.isArray(j.paper.sections) && j.paper.sections[0] && Array.isArray(j.paper.sections[0].questions)) ? j.paper.sections[0].questions : null;
      if (!ns || !ns.length) { setNote('No replacement section came back — try again.'); return; }
      setPaper((pp) => { if (!pp) return pp; return { ...pp, sections: pp.sections.map((s, i) => i === si ? { ...s, questions: ns } : s) }; });
      if (typeof j.credits === 'number') setUsed((u) => (Number(u) || 0) + j.credits);
      if (typeof j.balance === 'number') setCredits(j.balance);
    } catch (e) { setNote('Regenerate section failed — try again.'); }
    finally { setRegenGi(null); }
  }
  const totalQ = sections.reduce((n, s) => n + Number(s.count || 0), 0);
  const totalMarks = sections.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0);
  const flat = paper ? paper.sections.flatMap((s) => s.questions) : [];
  const autoTotal = flat.reduce((n, q) => n + (q.type === 'case' ? (Array.isArray(q.sub) ? q.sub.length : 0) : (isAuto(q) ? 1 : 0)), 0);
  const correctN = checked ? flat.reduce((n, q, gi) => { if (q.type === 'case') { const ua = answers[gi] || {}; return n + (q.sub || []).reduce((m, sq, si) => m + (ua[si] === sq.answer ? 1 : 0), 0); } return n + ((isAuto(q) && grade(q, answers[gi]) === true) ? 1 : 0); }, 0) : 0;
  const writtenN = flat.filter((q) => !isAuto(q) && q.type !== 'case').length;

  function stopTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  function cancelGenerate() {
    if (abortRef.current) { try { abortRef.current.abort(); } catch (e) {} }
  }
  async function generate() {
    const eff = (topic.trim() || bpTopic || '').trim();
    if (eff.length < 3 && !sourceDocId) { setNote('Describe a topic, pick a blueprint, or attach a PDF.'); return; }
    if (typeof credits === 'number' && credits < 1) { setNote("You're out of credits — buy a pack to generate."); return; }
    const requested = sections.reduce((nn, s) => nn + Number(s.count || 0), 0);
    // A single AI call is capped at ~40 questions server-side; bigger papers (custom or blueprint) go through the batched generator.
    if (requested > 40) { setFullConfirm(false); return runBatched(sections.map((s) => ({ title: s.title, type: s.type, count: Number(s.count), marks: Number(s.marks) })), examStyle || 'Custom paper', verify, eff); }
    cancelGenerate();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => { try { controller.abort(); } catch (e) {} }, 90000);
    stopTimer(); setElapsed(0); timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    setBusy(true); setNote(''); setShortWarn(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper');
    try {
      const r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ topic: eff, examStyle, level, difficulty, cognitive, language, institution, instructions, sections: sections.map((s) => ({ title: s.title, types: [s.type], count: Number(s.count), marks: Number(s.marks) })), nonce: Math.random().toString(36).slice(2), exclude: prevStems, verify, documentId: sourceDocId }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
        if (r.status === 403) setNote('Please verify your email (check your inbox) before generating.');
        else if (r.status === 402) setNote('You are out of credits.');
        else setNote(j.error || 'Generation failed');
        setBusy(false); return;
      }
      const master = { ...j.paper, layout };
      setPaper({ ...master, logo }); setUsed(j.credits); setCurSet(0); freshHistory({ ...master, logo });
      // Short-paper warning: the model sometimes returns fewer questions than requested.
      const got = ((j.paper && Array.isArray(j.paper.sections)) ? j.paper.sections : []).reduce((nn, s) => nn + ((s && Array.isArray(s.questions)) ? s.questions.length : 0), 0);
      if (requested && got < requested) setShortWarn('Generated ' + got + ' of ' + requested + ' questions — the model returned fewer for some sections. Try Regenerate or simpler sections.');
      if (Array.isArray(j.stems)) setPrevStems((prev) => [...prev, ...j.stems].slice(-80));
      if (typeof j.balance === 'number') setCredits(j.balance);
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (headingRef.current) { try { headingRef.current.focus(); } catch (e) {} } }, 60);
    } catch (e) {
      if (e && e.name === 'AbortError') setNote('Generation cancelled.');
      else setNote(e.message);
      setBusy(false);
    } finally {
      clearTimeout(timeout);
      stopTimer();
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  const ctrl = { padding: '7px 10px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit' };
  const isBP = Boolean(bpKey && bpKey !== 'custom');
  const bpLabel = isBP ? bpKey.slice(bpKey.split('||')[0].length + 2) : '';
  const _bpPreset = isBP ? (CATEGORIES.find((x) => x.k === bpKey.split('||')[0]) || { presets: [] }).presets.find((p) => (bpKey.split('||')[0] + '||' + p.label) === bpKey) : null;
  const bpReal = (_bpPreset && _bpPreset.real) ? _bpPreset.real : '';
  const bpFull = (_bpPreset && Array.isArray(_bpPreset.full)) ? _bpPreset.full : null;
  const fullTotalQ = bpFull ? bpFull.reduce((a, s) => a + Number(s.count || 0), 0) : 0;
  const fullBatches = bpFull ? bpFull.reduce((a, s) => a + Math.ceil(Number(s.count || 0) / 30), 0) : 0;
  const isFullRO = Boolean(fullSize && bpFull);
  const dispTotalMarks = isFullRO ? bpFull.reduce((m, s) => m + Number(s.count || 0) * Number(s.marks || 1), 0) : totalMarks;
  const hasScope = topic.trim().length > 0;
  const fromPDF = Number(sourceDocId) > 0;
  const canGen = Boolean(isBP || fromPDF || hasScope);
  const _sc = topic.trim();
  const _scShort = _sc.length > 44 ? _sc.slice(0, 44) + '…' : _sc;
  const genExplain = !canGen
    ? 'Pick an exam blueprint, attach a PDF, or describe a topic in Scope to begin.'
    : isBP
      ? ('Will build a ' + bpLabel + ' paper' + (fromPDF ? ', grounded in your PDF (answers cite the page)' : '') + '.')
      : (fromPDF
        ? ('Will build your sections, grounded in your PDF' + (hasScope ? ' on “' + _scShort + '”' : '') + '.')
        : ('Will build your sections on “' + _scShort + '”.'));
  // The set shown in the preview/print + driving the exporters. Falls back to the master.
  const setsArr = useMemo(() => (paper ? (sets > 1 ? deriveSets(paper, sets) : [paper]) : []), [paper, sets]);
  const activePaper = setsArr[curSet] || paper;
  async function runBatched(sectionList, label, verifyFlag, effTopic) {
    const MAXCHUNK = 30;
    const plan = [];
    sectionList.forEach((s, si) => { let rem = Number(s.count || 0); const type = (Array.isArray(s.types) ? s.types[0] : s.type) || 'mcq'; while (rem > 0) { const n = Math.min(MAXCHUNK, rem); plan.push({ si, title: s.title, type, marks: Number(s.marks || 1), count: n }); rem -= n; } });
    const wantTotal = sectionList.reduce((a, s) => a + Number(s.count || 0), 0);
    if (typeof credits === 'number' && credits < 1) { setNote("You're out of credits — buy a pack to generate."); return; }
    cancelGenerate();
    const controller = new AbortController(); abortRef.current = controller;
    stopTimer(); setElapsed(0); timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    setBusy(true); setNote(''); setShortWarn(''); setPaper(null); setUsed(null); setAnswers({}); setChecked(false); setView('paper'); setCurSet(0);
    const acc = sectionList.map(() => []); const seen = [...prevStems]; let used = 0; let bal = null; let failed = 0; let stopped = false; let allVerified = !!verifyFlag; const deadline = Date.now() + 8 * 60 * 1000;
    try {
      for (let b = 0; b < plan.length; b++) {
        if (controller.signal.aborted) { stopped = true; break; }
        if (Date.now() > deadline) { stopped = true; setNote('Stopped after 8 minutes to avoid a runaway generation — Regenerate to fill the rest.'); break; }
        const pp = plan[b];
        setFullProg('Batch ' + (b + 1) + ' of ' + plan.length + ' \u2014 ' + pp.title);
        const body = { topic: effTopic, examStyle, level, difficulty, language, institution, instructions, sections: [{ title: pp.title, types: [pp.type], count: pp.count, marks: pp.marks }], nonce: Math.random().toString(36).slice(2), exclude: seen.slice(-80), verify: !!verifyFlag, documentId: sourceDocId };
        let r, j;
        try { r = await fetch('/api/papers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify(body) }); }
        catch (e) { if (e && e.name === 'AbortError') { stopped = true; break; } failed++; continue; }
        j = await r.json().catch(() => ({}));
        if (!r.ok) { if (r.status === 401) { window.location.href = '/signin?next=' + encodeURIComponent(window.location.pathname + window.location.search); return; } if (r.status === 402) { setNote('Ran out of credits after ' + b + ' of ' + plan.length + ' batches.'); break; } failed++; continue; }
        const qs = (j.paper && Array.isArray(j.paper.sections) && j.paper.sections[0] && Array.isArray(j.paper.sections[0].questions)) ? j.paper.sections[0].questions : [];
        acc[pp.si] = acc[pp.si].concat(qs);
        qs.forEach((q) => seen.push(String((q && (q.q || q.assertion)) || '').slice(0, 140)));
        if (typeof j.credits === 'number') used += j.credits;
        if (typeof j.balance === 'number') bal = j.balance;
        if (verifyFlag && !(j.paper && j.paper.verified)) allVerified = false;
      }
      const finalSections = sectionList.map((s, i) => ({ title: s.title, marks: Number(s.marks || 1), questions: acc[i] }));
      const got = finalSections.reduce((a, s) => a + s.questions.length, 0);
      if (got === 0) { setNote(stopped ? 'Generation cancelled.' : 'Could not generate the paper — please try again.'); setBusy(false); stopTimer(); setFullProg(''); if (abortRef.current === controller) abortRef.current = null; return; }
      const tMarks = finalSections.reduce((m, s) => m + s.questions.length * Number(s.marks || 1), 0);
      const paperObj = { title: ((label || 'Full') + ' \u2014 full paper'), examStyle, language, difficulty, institution, instructions, totalMarks: tMarks, durationMin: Math.max(15, Math.round(got * 1.5)), sections: finalSections, verified: (verifyFlag && allVerified), grounded: Number(sourceDocId) > 0, sourceName: (selectedDoc && selectedDoc.filename) || '', layout, logo };
      setPaper(paperObj); setUsed(used); if (bal != null) setCredits(bal); freshHistory(paperObj);
      setPrevStems(seen.slice(-80));
      if (got < wantTotal) setShortWarn('Built ' + got + ' of ' + wantTotal + ' questions' + (failed ? ' (' + failed + ' batch(es) failed)' : (stopped ? ' (stopped)' : '')) + '. Regenerate to fill the gaps.');
      setBusy(false);
      setTimeout(() => { const el = document.getElementById('result-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    } catch (e) { setNote(e.message); setBusy(false); }
    finally { stopTimer(); setFullProg(''); if (abortRef.current === controller) abortRef.current = null; }
  }
  function generateFull() { if (!bpFull) { generate(); return; } return runBatched(bpFull, bpLabel, verify, (topic.trim() || bpTopic)); }

  return (
    <div id="papers-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav active="papers" credits={credits} />

      <div className="papers-body" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside className="no-print papers-aside" style={{ width: 248, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', background: 'rgba(5,6,20,0.6)', backdropFilter: 'blur(20px) saturate(180%)', display: asideOpen ? 'flex' : 'none', flexDirection: 'column', overflowY: 'auto', padding: '14px 12px' }}>
          <button type="button" onClick={() => setAsideOpen(false)} aria-label="Hide papers panel" title="Hide panel" data-testid="aside-hide" className="btn btn-glass btn-sm" style={{ alignSelf: 'flex-end', padding: '2px 9px', marginBottom: 8 }}>«</button>
          <button type="button" onClick={() => { setPaper(null); setUsed(null); setNote(''); setView('paper'); setEditAns(false); setCurSet(0); }} className="btn btn-iris btn-sm" data-testid="new-paper" style={{ width: '100%', marginBottom: 16 }}>+ New paper</button>
          <div className="eyebrow" style={{ marginBottom: 8 }}>My library{library.length ? ' (' + library.length + ')' : ''}</div>
          {library.length === 0 ? <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 18 }}>Saved papers appear here.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {library.map((lp) => (
                <div key={lp.id} className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-testid="lib-row">
                  {renaming === ('lib:' + lp.id) ? <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(null); }} onBlur={saveRename} aria-label="New name" data-testid="rename-input" className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '3px 6px' }} /> : <div title={lp.title} style={{ fontSize: 12, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lp.title}</div>}
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', margin: '2px 0 5px' }}>{lp.numQuestions} Qs{lp.examStyle ? ' · ' + lp.examStyle : ''}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => openPaper(lp.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }} data-testid="lib-open">Open</button><button onClick={() => clonePaper(lp.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }} data-testid="lib-clone" title="Open as a new copy">Duplicate</button>
                    <button onClick={() => startRename('lib', lp.id, lp.title)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Rename paper" data-testid="lib-rename">✎</button><button onClick={() => delPaper(lp.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Delete saved paper">{'✕'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Shared tests{shares.length ? ' (' + shares.length + ')' : ''}</div>
          {shares.length === 0 ? <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Share a paper as a test to see it here.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {shares.map((sh) => (
                <div key={sh.id} className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-testid="share-row">
                  {renaming === ('share:' + sh.id) ? <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(null); }} onBlur={saveRename} aria-label="New name" data-testid="rename-input" className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '3px 6px' }} /> : <div title={sh.title} style={{ fontSize: 12, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sh.title}</div>}
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', margin: '2px 0 5px' }}>{sh.attempts} attempts{sh.attempts ? ' · avg ' + sh.avgPct + '%' : ''}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <a href={'/t/' + sh.token} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }}>Open</a>
                    <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.origin + '/t/' + sh.token); }} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }}>Copy</button>
                    {sh.attempts > 0 && <button onClick={() => viewAttempts(sh.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} data-testid="view-attempts">{attemptsFor === sh.id ? 'Hide' : 'Scores'}</button>}
                    <button onClick={() => startRename('share', sh.id, sh.title)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Rename shared test" data-testid="share-rename">✎</button><button onClick={() => delShare(sh.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Delete shared test">{'✕'}</button>
                  </div>
                  {attemptsFor === sh.id && (<div style={{ marginTop: 6, borderTop: '1px solid var(--stroke-1)', paddingTop: 6 }}>{attemptList.length > 0 ? <button onClick={() => exportScores(sh.title)} data-testid="export-scores" className="btn btn-glass btn-sm" style={{ fontSize: 10, padding: '2px 7px', marginBottom: 4 }}>Export CSV</button> : null}{attemptList.length > 0 ? <button onClick={() => viewStats(sh.id)} data-testid="view-stats" className="btn btn-glass btn-sm" style={{ fontSize: 10, padding: '2px 7px', marginBottom: 4, marginLeft: 4 }}>{statsFor === sh.id ? 'Hide analytics' : 'Analytics'}</button> : null}{statsFor === sh.id && stats ? <div data-testid="stats-panel" style={{ marginTop: 4, marginBottom: 6, fontSize: 11 }}><div style={{ color: 'var(--text-2)', marginBottom: 4 }} data-testid="stats-avg">Class average: <b>{stats.avgPct}%</b> · {stats.count} attempt{stats.count === 1 ? '' : 's'}</div>{stats.perQuestion.map((pq) => <div key={pq.n} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }} data-testid="stats-row"><span style={{ width: 24, color: 'var(--text-4)', flexShrink: 0 }}>Q{pq.n}</span><div style={{ flex: 1, height: 8, background: 'var(--glass-2)', borderRadius: 4, overflow: 'hidden' }}>{pq.correctRate != null ? <div style={{ width: pq.correctRate + '%', height: '100%', background: pq.correctRate >= 70 ? 'var(--green)' : pq.correctRate >= 40 ? '#e0b341' : '#e0707a' }} /> : null}</div><span style={{ width: 34, textAlign: 'right', flexShrink: 0, color: 'var(--text-3)' }}>{pq.correctRate != null ? pq.correctRate + '%' : '—'}</span></div>)}{stats.bySection && stats.bySection.length > 1 ? <div style={{ marginTop: 8 }} data-testid="stats-section"><div style={{ color: 'var(--text-3)', marginBottom: 3 }}>By section</div>{stats.bySection.map((g) => <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}><span style={{ width: 90, color: 'var(--text-4)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.key}</span><div style={{ flex: 1, height: 8, background: 'var(--glass-2)', borderRadius: 4, overflow: 'hidden' }}>{g.correctRate != null ? <div style={{ width: g.correctRate + '%', height: '100%', background: g.correctRate >= 70 ? 'var(--green)' : g.correctRate >= 40 ? '#e0b341' : '#e0707a' }} /> : null}</div><span style={{ width: 34, textAlign: 'right', flexShrink: 0, color: 'var(--text-3)' }}>{g.correctRate != null ? g.correctRate + '%' : '—'}</span></div>)}</div> : null}{stats.byBloom && stats.byBloom.length ? <div style={{ marginTop: 8 }} data-testid="stats-bloom"><div style={{ color: 'var(--text-3)', marginBottom: 3 }}>By cognitive level</div>{stats.byBloom.map((g) => <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}><span style={{ width: 90, color: 'var(--text-4)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.key}</span><div style={{ flex: 1, height: 8, background: 'var(--glass-2)', borderRadius: 4, overflow: 'hidden' }}>{g.correctRate != null ? <div style={{ width: g.correctRate + '%', height: '100%', background: g.correctRate >= 70 ? 'var(--green)' : g.correctRate >= 40 ? '#e0b341' : '#e0707a' }} /> : null}</div><span style={{ width: 34, textAlign: 'right', flexShrink: 0, color: 'var(--text-3)' }}>{g.correctRate != null ? g.correctRate + '%' : '—'}</span></div>)}</div> : null}{stats.hardest && stats.hardest.length ? <div style={{ marginTop: 8 }} data-testid="stats-hardest"><div style={{ color: 'var(--text-3)', marginBottom: 3 }}>Most missed</div>{stats.hardest.map((h) => <div key={h.n} style={{ display: 'flex', gap: 6, color: 'var(--text-2)', margin: '1px 0' }}><span style={{ color: '#e0707a', flexShrink: 0, width: 30 }}>{h.correctRate}%</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Q{h.n} {h.stem}</span></div>)}</div> : null}</div> : null}{attemptList.length === 0 ? <div style={{ fontSize: 11, color: 'var(--text-3)' }}>No attempts yet.</div> : attemptList.map((a) => <div key={a.id} style={{ padding: '2px 0' }}><div style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || 'Anonymous'}</span>{a.awayCount > 0 ? <span data-testid="away-flag" title={'Left the test tab ' + a.awayCount + ' time(s) during the attempt'} style={{ color: '#e0b341', fontSize: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>{'⚠ ' + a.awayCount}</span> : null}<button onClick={() => reviewAttempt(sh.id, a.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10, padding: '2px 7px' }} data-testid="review-attempt">{reviewFor === a.id ? 'Hide' : 'Review'}</button><span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}><input type="number" defaultValue={a.score} min={0} max={a.total} onBlur={(e) => overrideScore(a.id, e.target.value, sh.id)} aria-label="Adjust score" data-testid="score-input" style={{ width: 40, fontSize: 11, padding: '1px 4px', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 4, color: 'var(--text)' }} />/{a.total}</span></div>{reviewFor === a.id && review ? <div data-testid="review-panel" style={{ marginTop: 5, borderLeft: '2px solid var(--violet)', paddingLeft: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>{flatQs(review.paper).map((q, gi) => { const ua = review.answers[gi]; const g = grade(q, ua); const badge = g === true ? '✓' : g === false ? '✗' : '•'; const col = g === true ? 'var(--green)' : g === false ? '#ffb4b4' : 'var(--text-3)'; return <div key={gi} style={{ fontSize: 11, lineHeight: 1.45 }} data-testid="review-q"><div style={{ display: 'flex', gap: 5 }}><span style={{ color: col, fontWeight: 700, flexShrink: 0 }}>{badge}</span><span style={{ flex: 1, minWidth: 0 }}><b>{gi + 1}.</b> {q.q || q.assertion || (q.type === 'match' ? 'Match the following' : '')}</span></div><div style={{ color: 'var(--text-2)', paddingLeft: 16, overflowWrap: 'anywhere' }} data-testid="review-student">Answer: {studentAnswerText(q, ua)}</div>{g !== true ? <div style={{ color: 'var(--text-3)', paddingLeft: 16, overflowWrap: 'anywhere' }} data-testid="review-correct">Correct: {correctText(q)}</div> : null}</div>; })}</div> : null}</div>)}</div>)}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 }}><div className="eyebrow" style={{ margin: 0 }} data-testid="bank-eyebrow">Question bank{bank.length ? ' (' + bank.length + ')' : ''}</div><button type="button" onClick={() => { setBankShareOpen((v) => { const nx = !v; if (nx) loadGrants(); return nx; }); }} data-testid="bank-share-toggle" className="btn btn-glass btn-sm" style={{ fontSize: 10, padding: '2px 7px' }}>{bankShareOpen ? 'Close' : 'Share'}</button></div>
          {bankShareOpen ? <div data-testid="bank-share-panel" className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)', marginBottom: 8 }}><div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 5 }}>Share your bank with a colleague by email. They can insert your questions; only you can edit or delete them.</div><div style={{ display: 'flex', gap: 5 }}><input className="input" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') grantBank(); }} placeholder="colleague@email.com" aria-label="Colleague email" data-testid="grant-email" style={{ flex: 1, minWidth: 0, fontSize: 11, padding: '5px 7px' }} /><button type="button" onClick={grantBank} data-testid="grant-add" className="btn btn-iris btn-sm" style={{ fontSize: 10.5, padding: '4px 9px' }}>Share</button></div>{grantees.length ? <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>{grantees.map((g) => <div key={g.email} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }} data-testid="grantee-row"><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-2)' }}>{g.email}</span><button type="button" onClick={() => revokeBank(g.email)} data-testid="grant-revoke" aria-label={'Revoke ' + g.email} className="btn btn-glass btn-sm" style={{ fontSize: 10, padding: '1px 6px' }}>Revoke</button></div>)}</div> : null}</div> : null}
          <input className="input" value={bankQ} onChange={(e) => setBankQ(e.target.value)} placeholder="Search saved questions…" aria-label="Search question bank" data-testid="bank-search" style={{ width: '100%', boxSizing: 'border-box', fontSize: 11.5, padding: '6px 9px', marginBottom: 6 }} />
          {bank.length === 0 ? <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Save questions from a paper (★) to reuse them here.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bank.map((b) => (
                <div key={b.id} className="glass" style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-testid="bank-row">
                  {renaming === ('bank:' + b.id) ? <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(null); }} onBlur={saveRename} aria-label="New name" data-testid="rename-input" className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 11.5, padding: '3px 6px' }} /> : <div title={b.stem} style={{ fontSize: 11.5, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.stem}</div>}
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', margin: '2px 0 5px' }}>{b.type}{b.topic ? ' \u00b7 ' + b.topic : ''}{b.shared ? ' \u00b7 shared by ' + (b.ownerName || 'colleague') : ''}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => insertFromBank(b.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 9px' }} data-testid="bank-insert">Insert</button>
                    {!b.shared ? <><button onClick={() => startRename('bank', b.id, b.stem)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Rename bank item" data-testid="bank-rename">✎</button><button onClick={() => delBankQ(b.id)} className="btn btn-glass btn-sm" style={{ fontSize: 10.5, padding: '3px 8px' }} aria-label="Delete from bank" data-testid="bank-del">{'\u2715'}</button></> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <div id="main" className="papers-main" style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <h1 className="sr-only">Question paper generator</h1>
          <section className="no-print papers-build" style={{ width: asideOpen ? 472 : 660, flexShrink: 0, borderRight: '1px solid var(--stroke-1)', overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.35)' }}>
            {!asideOpen && <button type="button" onClick={() => setAsideOpen(true)} aria-label="Show papers panel" title="Show library & papers" data-testid="aside-show" className="btn btn-glass btn-sm" style={{ marginBottom: 12, padding: '3px 10px' }}>» Library &amp; papers</button>}
            <div data-testid="build-steps" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, marginBottom: 14, flexWrap: 'wrap' }}>{['1 Blueprint', '2 Source', '3 Sections', 'Generate'].map((st, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{i ? <span style={{ color: 'var(--text-4)' }}>›</span> : null}<span style={{ padding: '2px 8px', fontSize: 10.5, background: 'var(--glass-2)', borderRadius: 999, color: 'var(--text-3)' }}>{st}</span></span>)}</div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Structure &mdash; exam blueprint</div>
            <select value={bpKey} onChange={(e) => chooseBlueprint(e.target.value)} aria-label="Exam blueprint" data-testid="blueprint" style={{ ...ctrl, width: '100%', padding: '9px 11px', fontSize: 13 }}>
              <option value="custom">Custom paper &mdash; define your own sections</option>
              {CATEGORIES.filter((c) => c.presets && c.presets.length > 0).map((c) => (
                <optgroup key={c.k} label={c.label}>
                  {c.presets.map((p) => <option key={c.k + '||' + p.label} value={c.k + '||' + p.label}>{p.label}</option>)}
                </optgroup>
              ))}
            </select>
            <div data-testid="bp-note" style={{ fontSize: 11.5, marginTop: 7, marginBottom: bpReal ? 3 : 16, color: isBP ? 'var(--green)' : 'var(--text-3)' }}>{isBP ? '✓ blueprint-aligned — sections, marks & weights' : '✎ custom — you define the sections below'}</div>
            {bpReal ? <div data-testid="bp-real" style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 16 }}>Real exam: {bpReal} · builds a focused set you can scale up.</div> : null}
            {bpFull ? <label data-testid="full-toggle" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)', margin: '-6px 0 16px', cursor: 'pointer' }}><input type="checkbox" checked={fullSize} onChange={(e) => { setFullSize(e.target.checked); setFullConfirm(false); }} /> Full real-size exam — {fullTotalQ} questions, in {fullBatches} batches{fullSize ? ' (uses more credits)' : ''}</label> : null}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Content source</div>
            <div ref={srcBoxRef} style={{ position: 'relative' }}>
              <button type="button" onClick={() => setSrcOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={srcOpen} data-testid="source-trigger" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid ' + (srcOpen ? 'var(--violet)' : 'var(--stroke-2)'), color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                {selectedDoc ? (<><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Grounded in: {selectedDoc.filename}{selectedDoc.pageCount ? ' (' + selectedDoc.pageCount + ' pp)' : ''}</span><span role="button" tabIndex={0} aria-label="Clear source" data-testid="source-clear" onClick={(e) => { e.stopPropagation(); selectSource(null); }} style={{ color: 'var(--text-3)', padding: '0 4px' }}>✕</span></>) : (<span style={{ flex: 1, color: 'var(--text-3)' }}>From scratch (topic / blueprint only)</span>)}
                <span style={{ color: 'var(--text-3)' }}>{srcOpen ? '▴' : '▾'}</span>
              </button>
              {srcOpen ? (
                <div data-testid="source-panel" style={{ marginTop: 6, background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <input autoFocus value={srcQuery} onChange={(e) => setSrcQuery(e.target.value)} placeholder="Search your PDFs…" aria-label="Search your PDFs" data-testid="source-search" onKeyDown={srcKey} style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: '1px solid var(--stroke-1)', background: 'transparent', color: 'var(--text)', fontSize: 13, padding: '10px 11px', fontFamily: 'inherit', outline: 'none' }} />
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    <button type="button" onClick={() => selectSource(null)} data-testid="source-scratch" style={{ width: '100%', textAlign: 'left', display: 'block', padding: '9px 11px', background: srcActive === 0 ? 'var(--glass-2)' : 'transparent', border: 'none', borderBottom: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>From scratch (topic / blueprint only)</button>
                    {srcLoading ? (<div style={{ padding: '10px 11px', fontSize: 12, color: 'var(--text-4)' }}>Searching…</div>) : (docs.length === 0 ? (<div style={{ padding: '10px 11px', fontSize: 12, color: 'var(--text-4)' }}>{srcQuery.trim() ? 'No PDFs match.' : 'No PDFs yet — upload one below.'}</div>) : docs.map((d, i) => (
                      <button key={d.id} type="button" onClick={() => selectSource(d)} data-testid="source-item" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: srcActive === i + 1 ? 'var(--glass-2)' : (Number(sourceDocId) === Number(d.id) ? 'var(--glass-1)' : 'transparent'), border: 'none', borderBottom: '1px solid var(--stroke-1)', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</span>{d.pageCount ? <span style={{ fontSize: 11, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{d.pageCount} pp</span> : null}<span role="button" tabIndex={0} aria-label={'Delete ' + (d.filename || 'PDF')} title="Delete PDF" data-testid="source-delete" onClick={(e) => { e.stopPropagation(); delDoc(d); }} style={{ color: 'var(--text-3)', padding: '0 4px', fontSize: 12 }}>✕</span></button>
                    )))}
                  </div>
                  <button type="button" onClick={() => { if (fileRef.current) fileRef.current.click(); }} disabled={uploading} data-testid="upload-pdf" style={{ width: '100%', textAlign: 'left', display: 'block', padding: '10px 11px', background: 'var(--glass-1)', border: 'none', borderTop: '1px solid var(--stroke-2)', color: 'var(--violet-2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{uploading ? 'Uploading…' : '↑ Upload a new PDF…'}</button>
                </div>
              ) : null}
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) uploadSource(f); }} style={{ display: 'none' }} data-testid="source-file" aria-hidden="true" tabIndex={-1} />
            </div>
            {uploadMsg ? <div data-testid="upload-msg" style={{ fontSize: 11.5, color: uploading ? 'var(--text-3)' : 'var(--text-2)', marginTop: 6 }}>{uploadMsg}</div> : null}
            {LANGUAGES.length > 1 && selectedDoc && (selectedDoc.lang === 'ta' || selectedDoc.lang === 'hi') && !(language === selectedDoc.lang || language === selectedDoc.lang + '-en') ? <div data-testid="lang-hint" style={{ fontSize: 11.5, marginTop: 6, color: 'var(--text-2)' }}>This PDF looks like {LANG_NAME[selectedDoc.lang]}. <button type="button" onClick={() => setLanguage(selectedDoc.lang)} data-testid="lang-hint-apply" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-2)', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}>Generate in {LANG_NAME[selectedDoc.lang]}?</button></div> : null}
            <div style={{ fontSize: 11, color: 'var(--text-4)', margin: '10px 0 16px' }}>Structure + source combine &mdash; e.g. a CBSE blueprint grounded in your own PDF.</div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Scope (optional)</div>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="Narrow to a chapter or topic — leave blank to use the full blueprint or PDF" aria-label="Scope" className="input" data-testid="topic" style={{ width: '100%', resize: 'vertical', minHeight: 54, fontFamily: 'inherit', padding: '10px 13px' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution / exam name (optional)" aria-label="Institution or exam name" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} />
              <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" aria-label="Instructions" className="input" style={{ flex: 1, minWidth: 170, fontSize: 12.5, padding: '8px 12px' }} /><div style={{ display: 'flex', alignItems: 'center', gap: 8, flexBasis: '100%', marginTop: 2 }} data-testid="logo-control">{logo ? <img src={logo} alt="logo preview" style={{ height: 28, maxWidth: 90, objectFit: 'contain', border: '1px solid var(--stroke-2)', borderRadius: 4, background: '#fff' }} /> : null}<label className="btn btn-glass btn-sm" style={{ fontSize: 11.5, cursor: 'pointer' }} data-testid="logo-add">{logo ? 'Change logo' : '+ Add logo'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { onLogoFile(e.target.files && e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} data-testid="logo-input" /></label>{logo ? <button type="button" onClick={() => setLogo('')} className="btn btn-glass btn-sm" style={{ fontSize: 11.5 }} data-testid="logo-clear">Remove</button> : null}</div>
            </div>
            <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Sections &mdash; {isFullRO ? fullTotalQ : totalQ} questions {'·'} {dispTotalMarks} marks{isFullRO ? ' · full real size' : ''}</div>
            {isFullRO ? (
              <div data-testid="full-sections">
                {bpFull.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 11px', background: 'var(--glass-1)', border: '1px solid var(--stroke-1)', borderRadius: 'var(--r)', marginBottom: 6 }} data-testid="section-row">
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{s.title}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{TYPE_LABELS[(Array.isArray(s.types) ? s.types[0] : s.type)] || 'Multiple choice'} {'·'} {s.count} {'×'} {s.marks}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>Real exam structure &mdash; built in {fullBatches} batches. Uncheck &ldquo;Full real-size&rdquo; above to edit sections.</div>
              </div>
            ) : (<>
              {sections.map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 7, padding: '8px 9px', background: 'var(--glass-1)', border: '1px solid var(--stroke-1)', borderRadius: 'var(--r)' }} data-testid="section-row">
                  <input value={s.title} onChange={(e) => setSec(i, { title: e.target.value })} placeholder="Section title" aria-label="Section title" className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 12.5, padding: '7px 10px' }} />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select value={s.type} onChange={(e) => setSec(i, { type: e.target.value })} aria-label="Question type" style={{ ...ctrl, flex: 1, minWidth: 0 }}>{ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select>
                    <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Qs <input type="number" min={1} max={30} value={s.count} onChange={(e) => setSec(i, { count: clampInt(e.target.value, 1, 30) })} aria-label="Questions in section" className="qpg-num" style={{ ...ctrl, width: 58 }} /></label>
                    <label style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Marks <input type="number" min={1} max={20} step={0.5} value={s.marks} onChange={(e) => setSec(i, { marks: clampHalf(e.target.value, 1, 20) })} aria-label="Marks per question" className="qpg-num" style={{ ...ctrl, width: 58 }} /></label>
                    <button type="button" onClick={() => delSec(i)} className="btn btn-glass btn-sm" style={{ padding: '5px 9px' }} aria-label="Remove section">{'✕'}</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSec} disabled={sections.length >= 8} className="btn btn-glass btn-sm" data-testid="add-section" style={{ marginTop: 2 }}>+ Add section</button>{sections.length >= 8 && <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>Up to 8 sections</span>}
            </>)}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty" style={ctrl}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }} data-testid="cognitive">Focus<select value={cognitive} onChange={(e) => setCognitive(e.target.value)} aria-label="Cognitive focus" style={ctrl}><option value="">Balanced</option><option value="recall">More recall</option><option value="application">More application/HOTS</option></select></label>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>Level<select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level" style={ctrl}><option value="">Any</option><option value="Beginner">Beginner</option><option value="School">School</option><option value="College">College</option><option value="Professional">Professional</option><option value="Expert">Expert</option></select></label>
            </div>
            {LANGUAGES.length > 1 ? (<>
            <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Language</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }} data-testid="lang-pills">{LANGUAGES.map((l) => <button key={l.code} type="button" onClick={() => setLanguage(l.code)} className="chip" aria-pressed={language === l.code} style={{ cursor: 'pointer', fontSize: 12, background: language === l.code ? 'rgba(183,106,255,0.16)' : 'transparent', color: language === l.code ? 'var(--text)' : 'var(--text-3)', borderColor: language === l.code ? 'var(--violet)' : 'var(--stroke-2)' }}>{l.label}</button>)}</div>
            </>) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={includeKey} onChange={(e) => setIncludeKey(e.target.checked)} /> Include answer key</label>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="A second AI pass re-checks the answer key"><input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} /> Verify answers</label>
              <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }} title="Produce A/B/C… versions with questions and options shuffled (same answer key per set)"><span style={{ color: 'var(--text-3)' }}>Shuffled sets</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', padding: 2 }}><button type="button" onClick={() => { setSets((v) => clampInt(v - 1, 1, 4)); setCurSet(0); }} disabled={sets <= 1} aria-label="Fewer sets" className="btn btn-glass btn-sm" style={{ padding: '2px 8px', minWidth: 26 }} data-testid="sets-dec">−</button><span data-testid="sets-value" style={{ minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{sets}</span><button type="button" onClick={() => { setSets((v) => clampInt(v + 1, 1, 4)); setCurSet(0); }} disabled={sets >= 4} aria-label="More sets" className="btn btn-glass btn-sm" style={{ padding: '2px 8px', minWidth: 26 }} data-testid="sets-inc">+</button></span></span>
            </div>
            <div data-testid="gen-explain" style={{ fontSize: 12, lineHeight: 1.45, minHeight: 17, margin: '14px 0 4px', color: canGen ? 'var(--text-3)' : '#ffb4b4' }}>{genExplain}</div>
            <button onClick={() => { if (fullSize && bpFull) setFullConfirm(true); else generate(); }} disabled={busy || (!fullSize && !canGen)} className={(busy || (!fullSize && !canGen)) ? 'btn btn-glass' : 'btn btn-iris'} data-testid="gen-paper" style={{ width: '100%', marginTop: 4, opacity: (!busy && !fullSize && !canGen) ? 0.6 : 1 }}>{busy ? 'Generating…' : (fullSize && bpFull ? '⚡ Generate full paper · ' + fullBatches + ' batches' : '⚡ Generate paper')}</button>
            {fullConfirm && !busy ? (
              <div data-testid="full-confirm" style={{ marginTop: 10, padding: '10px 12px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--violet)' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 8 }}>Build the full <b style={{ fontWeight: 600 }}>{fullTotalQ}-question</b> {examStyle} paper in {fullBatches} batches. This uses more credits than a focused set and can take a couple of minutes.</div>
                <div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => { setFullConfirm(false); generateFull(); }} className="btn btn-iris btn-sm" data-testid="full-go">Generate full paper</button><button type="button" onClick={() => setFullConfirm(false)} className="btn btn-glass btn-sm">Cancel</button></div>
              </div>
            ) : null}
            {note && <div style={{ marginTop: 12, fontSize: 13, color: '#ffb4b4' }}>{note} {note.includes('credits') && <a href="/buy" style={{ color: 'var(--violet-2)' }}>Buy credits →</a>}</div>}
            <div className="mono" style={{ marginTop: 12, fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em' }}>Answers are AI-generated &mdash; spot-check before using in a real exam.</div>
          </section>

          <section className="papers-preview" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '18px 20px', background: 'rgba(5,6,20,0.5)' }}>
            {!paper ? (
              <div className="no-print" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-4)' }}>
                {busy ? (
                  <div style={{ maxWidth: 380 }} data-testid="gen-progress" role="status" aria-live="polite">
                    <div className="qpg-spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid var(--stroke-2)', borderTopColor: 'var(--violet-2)' }} />
                    <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>Generating your paper… <span className="mono" style={{ color: 'var(--text-3)' }}>{elapsed}s</span></div>
                    <div style={{ fontSize: 12.5, marginBottom: 14 }}>{fullProg || (verify ? 'Writing questions, then verifying the answer key — this usually takes 10–30s.' : 'Writing your questions — this usually takes 10–30s.')}</div>
                    <button type="button" onClick={cancelGenerate} className="btn btn-glass btn-sm" data-testid="cancel-gen">Cancel</button>
                  </div>
                ) : (
                  <div style={{ maxWidth: 360 }}>
                    <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: 16, background: 'var(--glass-2)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--violet-2)' }}>{'✎'}</div>
                    <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>Your paper appears here</div>
                    <div style={{ fontSize: 12.5 }}>Build sections on the left, then Generate.</div>
                  </div>
                )}
              </div>
            ) : (
              <div id="result-top">
                <h2 ref={headingRef} tabIndex={-1} className="no-print" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Generated paper: {paper.title}</h2>
                {shortWarn && <div className="no-print" data-testid="short-warn" style={{ marginBottom: 12, fontSize: 12.5, color: '#ffd27a', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', borderRadius: 'var(--r)', padding: '8px 12px' }}>{shortWarn}</div>}
                <div className="no-print result-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, rowGap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>
                    <button onClick={() => setView('paper')} className={view === 'paper' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-paper">Paper</button>
                    <button onClick={() => { setView('practice'); setChecked(false); }} className={view === 'practice' ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="view-practice">Practice</button>
                  </div>
                  {setsArr.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} data-testid="set-switcher"><span style={{ fontSize: 11.5, color: 'var(--text-3)', marginRight: 2 }}>Set</span><div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }}>{setsArr.map((sp, i) => <button key={i} onClick={() => setCurSet(i)} className={curSet === i ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid={'set-tab-' + i} aria-pressed={curSet === i}>{sp.setLabel || String.fromCharCode(65 + i)}</button>)}</div></div>
                  )}
                  {view === 'paper' && <><label style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>Layout<select value={paper.layout || layout} onChange={(e) => { const v = e.target.value; setLayout(v); setPaper((pp) => pp ? { ...pp, layout: v } : pp); }} aria-label="Layout" style={{ padding: '5px 8px', borderRadius: 'var(--r)', background: 'var(--glass-1)', border: '1px solid var(--stroke-2)', color: 'var(--text)', fontSize: 12 }} data-testid="layout-select"><option value="official">Official</option><option value="clean">Clean</option><option value="compact">Compact</option></select></label><button onClick={() => window.print()} className="btn btn-iris btn-sm" data-testid="save-pdf">Save as PDF / Print</button>{setsArr.length > 1 ? <button onClick={printAllSets} className="btn btn-glass btn-sm" data-testid="print-all-sets">Print all {setsArr.length} sets</button> : null}<button onClick={() => setOmr((v) => !v)} className={omr ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="omr-toggle">{omr ? 'Show paper' : 'OMR sheet'}</button><button onClick={generate} disabled={busy} className="btn btn-glass btn-sm">Regenerate</button><button onClick={savePaper} className="btn btn-glass btn-sm" data-testid="save-library">+ Save to library</button><button onClick={shareTest} className="btn btn-glass btn-sm" data-testid="share-test">Share as test</button><span aria-hidden="true" data-testid="tb-div" style={{ width: 1, alignSelf: 'stretch', background: 'var(--stroke-2)', margin: '0 3px' }} /><button onClick={() => setEditAns((v) => !v)} className={editAns ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="edit-answers">{editAns ? 'Done editing' : 'Edit Q&A'}</button><div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 'var(--r)', padding: 3 }} data-testid="copy-toggle" title="Teacher copy includes the answer key; Student copy hides it"><button type="button" onClick={() => setIncludeKey(true)} className={includeKey ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="copy-teacher" aria-pressed={includeKey}>Teacher</button><button type="button" onClick={() => setIncludeKey(false)} className={!includeKey ? 'btn btn-iris btn-sm' : 'btn btn-glass btn-sm'} data-testid="copy-student" aria-pressed={!includeKey}>Student</button></div>{used != null ? <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)' }} data-testid="used-cr">used {used} CR</span> : null}{paper.verified && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="verified" title="A second AI pass re-checked the objective answer key (MCQ, true/false, fill, numeric, assertion). Open-ended types aren't auto-checked.">{'✓'} answer key checked{paper.fixes ? ' (' + paper.fixes + ' corrected)' : ''}</span>}{hist.length ? <button type="button" onClick={undoEdit} className="btn btn-glass btn-sm" data-testid="undo" title="Undo last change (edits + regenerate)">↶ Undo</button> : null}{future.length ? <button type="button" onClick={redoEdit} className="btn btn-glass btn-sm" data-testid="redo" title="Redo">↷ Redo</button> : null}{(pristine && (hist.length || future.length)) ? <button type="button" onClick={revertAll} className="btn btn-glass btn-sm" data-testid="revert-all" title="Discard all edits, restore the originally generated paper">Revert all</button> : null}<span data-testid="export-group" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}><span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Export:</span><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.xml', toMoodleXML(activePaper), 'application/xml')} className="btn btn-glass btn-sm" data-testid="export-xml" title="Moodle XML — import into a Moodle question bank">Moodle XML</button><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.gift.txt', toGIFT(activePaper))} className="btn btn-glass btn-sm" data-testid="export-gift" title="GIFT — Moodle import format">GIFT</button><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.aiken.txt', toAiken(activePaper))} className="btn btn-glass btn-sm" data-testid="export-aiken" title="Aiken — simple single-answer MCQ format for Moodle">Aiken</button><button onClick={() => downloadBlob(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.qti.zip', toQTIZip(activePaper))} className="btn btn-glass btn-sm" data-testid="export-qti" title="QTI 2.1 package (.zip) — import into Canvas, Blackboard or Moodle">QTI</button><button onClick={() => downloadText(slug(activePaper.title) + (setsArr.length > 1 ? '-' + (activePaper.setLabel || '') : '') + '.csv', toCSV(activePaper), 'text/csv')} className="btn btn-glass btn-sm" data-testid="export-csv" title="CSV — spreadsheet of all questions and answers">CSV</button></span>{savedMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--green)' }} data-testid="saved-msg">{savedMsg}</span>}{shareMsg && <span className="mono" style={{ fontSize: 11, color: 'var(--violet-2)' }} data-testid="share-msg">{shareMsg}</span>}</>}
                  {view === 'practice' && (checked
                    ? <><span style={{ fontSize: 15, fontWeight: 600 }} data-testid="score">Score {correctN} / {autoTotal}{autoTotal ? ' (' + Math.round(100 * correctN / autoTotal) + '%)' : ''}</span>{writtenN > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>+ {writtenN} written to self-check</span>}<button onClick={() => { setChecked(false); setAnswers({}); }} className="btn btn-glass btn-sm">Try again</button></>
                    : <button onClick={() => setChecked(true)} className="btn btn-iris btn-sm" data-testid="check-answers">Check answers</button>)}
                </div>

                {editAns && (
                  <div className="no-print glass" style={{ padding: '16px 18px', borderRadius: 'var(--r-lg)', maxWidth: 820, margin: '0 auto 14px' }}>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Edit questions &amp; answers</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>AI questions &amp; answers can occasionally need a fix &mdash; edit any here before you print, save or share. Changes apply everywhere.</div>
                    {(() => { let n = 0; return paper.sections.flatMap((sec) => sec.questions.map((q) => { const gi = n++; return (
                      <div key={gi} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--violet-2)', minWidth: 24 }}>{gi + 1}.</span>
                        <input value={String(q.q || q.assertion || '')} onChange={(e) => editPatch(gi, q.type === 'assertion' ? { assertion: e.target.value } : { q: e.target.value })} aria-label="Question text" data-testid="edit-stem" className="input" style={{ flex: 1, minWidth: 0, fontSize: 12.5, padding: '5px 9px' }} />
                        <EditAnswerControl q={q} gi={gi} onPatch={editPatch} />
                        <button type="button" onClick={() => regenQ(gi)} disabled={regenGi != null} title="Replace this question with a fresh AI-generated one (uses a credit)" className="btn btn-glass btn-sm" style={{ padding: '2px 9px' }} data-testid={'regen-' + gi}>{regenGi === gi ? '…' : '↻'}</button>
                      </div>
                    ); })); })()}
                  </div>
                )}
                {view === 'paper' ? (
                  <div id="paper-print" style={{ background: '#fff', color: '#111', borderRadius: 'var(--r-lg)', padding: '40px 44px', maxWidth: 820, margin: '0 auto', border: '1px solid var(--stroke-2)' }}>
                    {omr ? <OMRSheet paper={activePaper} /> : (printAll && setsArr.length > 1 ? setsArr.map((sp, i) => (<div key={i} className={i > 0 ? 'pagebreak' : ''}><div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#555', margin: '0 0 10px' }}>SET {sp.setLabel || String.fromCharCode(65 + i)}</div><PaperView paper={sp} layout={paper.layout || layout} includeKey={includeKey} /></div>)) : <PaperView paper={activePaper} layout={paper.layout || layout} includeKey={includeKey} onRegen={setsArr.length > 1 ? null : regenQ} regenGi={regenGi} onRegenSection={setsArr.length > 1 ? null : regenSection} onBankQ={setsArr.length > 1 ? null : saveToBank} onDelete={setsArr.length > 1 ? null : delQuestion} />)}
                  </div>
                ) : (
                  <div className="glass" style={{ padding: '24px 26px', borderRadius: 'var(--r-lg)', maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{paper.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 18 }}>Answer the questions, then hit Check answers. Auto-graded: {autoTotal}{writtenN ? ' · ' + writtenN + ' written (self-check)' : ''}.</div>
                    {flat.map((q, gi) => (
                      <div key={gi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--stroke-1)' }} data-testid="practice-q">
                        <div style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}><span style={{ fontWeight: 600, color: 'var(--violet-2)', flexShrink: 0 }}>{gi + 1}.</span><div style={{ flex: 1 }}><PromptStem q={q} /></div></div>
                        <div style={{ marginLeft: 22 }}><PracticeInput q={q} ua={answers[gi]} checked={checked} onAns={(v) => setAnswers((a) => ({ ...a, [gi]: v }))} />{checked && <Feedback q={q} ua={answers[gi]} />}</div>
                      </div>
                    ))}
                    {!checked && <button onClick={() => setChecked(true)} className="btn btn-iris" style={{ marginTop: 4 }}>Check answers</button>}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } #papers-shell, .papers-body, .papers-main, .papers-preview, #result-top { height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; } html, body { height: auto !important; overflow: visible !important; background: #fff !important; } #paper-print { border: none !important; border-radius: 0 !important; box-shadow: none !important; max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; } #paper-print .q-block, #paper-print .key-item { break-inside: avoid !important; page-break-inside: avoid !important; } #paper-print .section-head { break-after: avoid !important; page-break-after: avoid !important; } #paper-print .pagebreak { page-break-before: always !important; break-before: page !important; } } @media (max-width: 880px) { #papers-shell { height: auto !important; overflow: visible !important; } .papers-body, .papers-main { flex-direction: column !important; } .papers-aside, .papers-build, .papers-preview { width: 100% !important; flex-shrink: 1 !important; overflow: visible !important; border-right: none !important; border-bottom: 1px solid var(--stroke-1) !important; } } @media (max-width: 560px) { .result-toolbar .btn { padding: 4px 8px !important; font-size: 11px !important; } .result-toolbar .btn-sm { padding: 3px 7px !important; font-size: 10.5px !important; } } @keyframes qpg-spin { to { transform: rotate(360deg); } } .qpg-spinner { animation: qpg-spin 0.8s linear infinite; } .qpg-num { -moz-appearance: textfield; appearance: textfield; } .qpg-num::-webkit-outer-spin-button, .qpg-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }` }} />
    </div>
  );
}
