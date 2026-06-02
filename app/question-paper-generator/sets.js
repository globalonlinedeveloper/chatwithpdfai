// Pure, deterministic helpers for "multiple shuffled sets" of a generated paper.
// No React, no I/O. Set 0 is always the original master paper, untouched.
// Sets 1..n-1 are deep-cloned variants: questions reordered per section and,
// for option-bearing types (mcq/code/assertion/multi), options permuted with the
// correct-answer index(es) remapped so the right option TEXT stays correct.

// 32-bit string hash (FNV-1a-ish) → unsigned int seed.
function hashStr(s) {
  let h = 2166136261 >>> 0;
  const str = String(s == null ? '' : s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 PRNG — small, fast, deterministic. Returns () => float in [0,1).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates: return an array of indices [0..len-1] shuffled with rng.
function shuffledIndices(len, rng) {
  const idx = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = idx[i];
    idx[i] = idx[j];
    idx[j] = t;
  }
  return idx;
}

const OPTION_TYPES = ['mcq', 'code', 'assertion', 'multi'];

// Permute one question's options and remap its answer index(es) to follow the text.
// `perm` is the new-order index array: newOptions[k] = oldOptions[perm[k]].
// To remap an OLD index we need oldIndex -> newIndex, i.e. the position k where perm[k] === oldIndex.
function permuteOptions(q, rng) {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;
  const perm = shuffledIndices(q.options.length, rng);
  const newOptions = perm.map((oldI) => q.options[oldI]);
  // oldToNew[oldIndex] = position in the new array
  const oldToNew = new Array(q.options.length);
  for (let k = 0; k < perm.length; k++) oldToNew[perm[k]] = k;
  q.options = newOptions;
  if (q.type === 'multi') {
    if (Array.isArray(q.answers)) q.answers = q.answers.map((a) => oldToNew[a]).sort((x, y) => x - y);
  } else if (typeof q.answer === 'number') {
    q.answer = oldToNew[q.answer];
  }
  return q;
}

// Build one variant section from a master section using rng.
function variantSection(section, rng) {
  const qs = Array.isArray(section.questions) ? section.questions : [];
  const order = shuffledIndices(qs.length, rng);
  const reordered = order.map((i) => qs[i]);
  reordered.forEach((q) => {
    if (q && OPTION_TYPES.includes(q.type)) permuteOptions(q, rng);
    // tf/fill/numeric/short/long: reordered only, content untouched.
    // match: pairs reordered (grading is order-independent), content untouched.
    if (q && q.type === 'match' && Array.isArray(q.pairs)) {
      const pOrder = shuffledIndices(q.pairs.length, rng);
      q.pairs = pOrder.map((pi) => q.pairs[pi]);
    }
  });
  return { ...section, questions: reordered };
}

const LETTER = (i) => String.fromCharCode(65 + i); // 0->A, 1->B, ...

// deriveSets(paper, n) → array of n papers. Set 0 = original master (only setLabel added).
export function deriveSets(paper, n) {
  const count = Math.max(1, Math.floor(Number(n) || 1));
  const out = [];
  // Set 0: the original, unchanged (so "Set A" matches what the user saw). Only stamp the label.
  out.push({ ...paper, setLabel: LETTER(0) });
  for (let s = 1; s < count; s++) {
    // Deep clone the master so variants never mutate the input.
    const clone = JSON.parse(JSON.stringify(paper));
    const sections = Array.isArray(clone.sections) ? clone.sections : [];
    clone.sections = sections.map((sec, si) => {
      const rng = mulberry32(hashStr(String(paper.title) + '|set' + s + '|sec' + si));
      return variantSection(sec, rng);
    });
    clone.setLabel = LETTER(s);
    out.push(clone);
  }
  return out;
}

// Self-check (logic only, no output): for options ['W','X','Y','Z'] with answer index 1
// ('X'), after permuteOptions the value at q.options[q.answer] must still be 'X', because
// oldToNew maps the old correct position into its new slot. Same holds element-wise for
// multi via q.answers. Set 0 is returned by reference-spread with only setLabel added,
// so the default (n===1) path yields the master paper unchanged.
