// =================================================================
// Minimal in-process job queue, concurrency = 1.
//
// The box is a shared 3 GB Hostinger slice; concurrent PDF extraction +
// embedding would compete for RAM. This serialises heavy jobs so only one
// runs at a time. enqueue() resolves with the job's result (or rejects with
// its error) while keeping the internal chain alive for the next job.
//
// MVP awaits the enqueued job so the HTTP response carries the final status.
// A later refinement can return 202 + poll instead (see REQUIREMENTS M2).
// =================================================================

let chain = Promise.resolve();
let depth = 0;

export function queueDepth() {
  return depth;
}

export function enqueue(job) {
  depth += 1;
  const run = chain.then(() => job());
  // Advance the chain regardless of this job's success/failure.
  chain = run.then(
    () => { depth -= 1; },
    () => { depth -= 1; }
  );
  return run;
}
