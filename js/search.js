// search.js — Linear search, binary search + side-by-side race

const STEP_MS = 800;

const userInput = document.getElementById("userInput");
const targetInput = document.getElementById("targetInput");
const algorithmSelect = document.getElementById("algorithm");
const startBtn = document.getElementById("startBtn");
const exampleBtn = document.getElementById("exampleBtn");
const visualizer = document.getElementById("visualizer");
const explanationText = document.getElementById("explanationText");
const algorithmCodeDisplay = document.getElementById("algorithm-code");

let currentTimer = null;

const algorithmsCode = {
  linear: `
ALGORITHM — LINEAR SEARCH(x)

Step 1 -> Start at the first element
Step 2 -> Compare it with x; on a match, return its position
Step 3 -> Otherwise move to the next element and repeat
Step 4 -> Reaching the end means x is NOT present

CODE

  int linearSearch(int arr[], int n, int x) {
      for (int i = 0; i < n; i++)
          if (arr[i] == x) return i;
      return -1;
  }

TIME COMPLEXITY: O(n) — checks every element in the worst case
SPACE COMPLEXITY: O(1)
  `,
  binary: `
ALGORITHM — BINARY SEARCH(x) ON SORTED DATA

Step 1 -> Look at the middle of the current range
Step 2 -> On a match, return its position
Step 3 -> If x is larger, discard the left half (and vice versa)
Step 4 -> Repeat until found or the range is empty

CODE

  int binarySearch(int arr[], int n, int x) {
      int lo = 0, hi = n - 1;
      while (lo <= hi) {
          int mid = (lo + hi) / 2;
          if (arr[mid] == x) return mid;
          if (arr[mid] < x) lo = mid + 1;
          else hi = mid - 1;
      }
      return -1;
  }

TIME COMPLEXITY: O(log n) — halves the range each step
SPACE COMPLEXITY: O(1)
REQUIRES sorted input
  `,
  race: `
COMPARE — LINEAR vs BINARY SEARCH

Both algorithms hunt the same target side by side.
Linear checks one element per step: O(n) comparisons.
Binary halves the range per step: O(log n) comparisons.

Watch the counters: binary usually finishes in a
handful of steps while linear walks the whole array.
Binary needs sorted data — the race sorts a copy first.
  `,
};

// 20-element example: sorted 1–20, target 14 (linear: 14 checks,
// binary: 5 checks — a clear contrast).
const EXAMPLE_ARRAY = Array.from({ length: 20 }, (_, i) => i + 1);
const EXAMPLE_TARGET = 14;

function stopCurrent() {
  if (currentTimer !== null) {
    clearInterval(currentTimer);
    currentTimer = null;
  }
}

function addExplanationStep(step) {
  const p = document.createElement("p");
  p.textContent = step;
  explanationText.appendChild(p);
  explanationText.scrollTop = explanationText.scrollHeight;
}

function isSorted(array) {
  for (let i = 1; i < array.length; i++) {
    if (array[i] < array[i - 1]) return false;
  }
  return true;
}

// Render bars into a container. marks: checked indexes (light blue),
// current/mid probe (red), found hit (green), range [lo,hi] for binary
// (everything outside renders eliminated grey).
function renderBars(container, array, marks = {}) {
  const { checked = [], current = -1, found = -1, mid = -1, lo = 0, hi = array.length - 1 } = marks;
  const maxVal = Math.max(...array);
  container.innerHTML = array
    .map((value, index) => {
      let className = "bar";
      if (index === found) className = "bar sorted";
      else if (index === current || index === mid) className = "bar mid";
      else if (index < lo || index > hi) className = "bar eliminated";
      else if (checked.includes(index)) className = "bar checked";
      const pct = maxVal > 0 ? Math.max((value / maxVal) * 95, 6) : 6;
      return `<div class="${className}" style="height:${pct}%"><div class="number">${value}</div></div>`;
    })
    .join("");
}

// Step-machine for linear search. render(state) paints, log(msg)
// narrates; the driver (single or race) owns the timer.
function makeLinearRunner(array, target, render, log) {
  let i = 0;
  let comparisons = 0;
  let done = false;
  let foundAt = -1;
  return {
    get done() {
      return done;
    },
    get comparisons() {
      return comparisons;
    },
    step() {
      if (done) return;
      if (i >= array.length) {
        done = true;
        render({ checked: array.map((_, k) => k) });
        log(`checked all ${array.length} element(s): ${target} is NOT present (${comparisons} comparisons).`);
        return;
      }
      comparisons++;
      if (array[i] === target) {
        foundAt = i;
        done = true;
        const checked = array.map((_, k) => k).filter((k) => k < i);
        render({ checked, found: i });
        log(`arr[${i}] = ${target} — FOUND at position ${i + 1} after ${comparisons} comparison(s).`);
        return;
      }
      const checked = array.map((_, k) => k).filter((k) => k <= i);
      render({ checked, current: i });
      log(`arr[${i}] = ${array[i]} ≠ ${target} — moving on (comparison ${comparisons}).`);
      i++;
    },
  };
}

// Step-machine for binary search over a SORTED array.
function makeBinaryRunner(array, target, render, log) {
  let lo = 0;
  let hi = array.length - 1;
  let comparisons = 0;
  let done = false;
  return {
    get done() {
      return done;
    },
    get comparisons() {
      return comparisons;
    },
    step() {
      if (done) return;
      if (lo > hi) {
        done = true;
        render({ lo: 1, hi: 0 });
        log(`range empty: ${target} is NOT present (${comparisons} comparisons).`);
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      comparisons++;
      if (array[mid] === target) {
        done = true;
        render({ lo, hi, found: mid });
        log(`arr[${mid}] = ${target} — FOUND at position ${mid + 1} after ${comparisons} comparison(s).`);
      } else if (array[mid] < target) {
        render({ lo, hi, mid });
        log(`arr[${mid}] = ${array[mid]} < ${target} — discarding left half [${lo}..${mid}] (comparison ${comparisons}).`);
        lo = mid + 1;
      } else {
        render({ lo, hi, mid });
        log(`arr[${mid}] = ${array[mid]} > ${target} — discarding right half [${mid}..${hi}] (comparison ${comparisons}).`);
        hi = mid - 1;
      }
    },
  };
}

function parseArrayInput() {
  const numbers = userInput.value.split(",").map((num) => parseInt(num.trim(), 10));
  return numbers.length > 0 && numbers.every((num) => !isNaN(num)) ? numbers : null;
}

function parseTarget() {
  const value = parseInt(targetInput.value.trim(), 10);
  return targetInput.value.trim() !== "" && !isNaN(value) ? value : null;
}

function runSingle(kind, array, target) {
  renderBars(visualizer, array, {});
  let data = array;
  if (kind === "binary" && !isSorted(array)) {
    data = [...array].sort((a, b) => a - b);
    addExplanationStep(`Input is not sorted — binary search runs on the sorted copy [${data.join(", ")}]. Positions below refer to the sorted copy.`);
    renderBars(visualizer, data, {});
  }
  const runner =
    kind === "binary"
      ? makeBinaryRunner(data, target, (marks) => renderBars(visualizer, data, marks), addExplanationStep)
      : makeLinearRunner(data, target, (marks) => renderBars(visualizer, data, marks), addExplanationStep);
  currentTimer = setInterval(() => {
    runner.step();
    if (runner.done) {
      stopCurrent();
      addExplanationStep(`${kind === "binary" ? "Binary" : "Linear"} search finished: ${runner.comparisons} comparison(s).`);
    }
  }, STEP_MS);
}

function runRace(array, target) {
  visualizer.innerHTML = "";
  const panels = document.createElement("div");
  panels.className = "race-panels";
  const mkPanel = (title) => {
    const panel = document.createElement("div");
    panel.className = "race-panel";
    const heading = document.createElement("div");
    heading.className = "race-title";
    heading.textContent = title;
    const count = document.createElement("div");
    count.className = "race-count";
    count.textContent = "Comparisons: 0";
    const bars = document.createElement("div");
    bars.className = "race-bars";
    panel.appendChild(heading);
    panel.appendChild(count);
    panel.appendChild(bars);
    panels.appendChild(panel);
    return { count, bars };
  };
  const linearPanel = mkPanel("Linear Search");
  const binaryPanel = mkPanel("Binary Search (sorted copy)");
  const verdict = document.createElement("div");
  verdict.className = "race-verdict";
  verdict.textContent = "Racing…";
  visualizer.appendChild(panels);
  visualizer.appendChild(verdict);

  const sorted = [...array].sort((a, b) => a - b);
  if (!isSorted(array)) {
    addExplanationStep(`Binary side races on the sorted copy [${sorted.join(", ")}]; linear races on your input as given.`);
  }
  const linear = makeLinearRunner(
    array,
    target,
    (marks) => {
      renderBars(linearPanel.bars, array, marks);
      linearPanel.count.textContent = `Comparisons: ${linear.comparisons}`;
    },
    (msg) => addExplanationStep(`Linear: ${msg}`),
  );
  const binary = makeBinaryRunner(
    sorted,
    target,
    (marks) => {
      renderBars(binaryPanel.bars, sorted, marks);
      binaryPanel.count.textContent = `Comparisons: ${binary.comparisons}`;
    },
    (msg) => addExplanationStep(`Binary: ${msg}`),
  );
  renderBars(linearPanel.bars, array, {});
  renderBars(binaryPanel.bars, sorted, {});

  currentTimer = setInterval(() => {
    if (!linear.done) linear.step();
    if (!binary.done) binary.step();
    linearPanel.count.textContent = `Comparisons: ${linear.comparisons}`;
    binaryPanel.count.textContent = `Comparisons: ${binary.comparisons}`;
    if (linear.done && binary.done) {
      stopCurrent();
      const winner =
        binary.comparisons < linear.comparisons
          ? `Binary wins (${binary.comparisons} vs ${linear.comparisons} comparisons)`
          : binary.comparisons > linear.comparisons
            ? `Linear wins (${linear.comparisons} vs ${binary.comparisons} comparisons)`
            : `Tie at ${linear.comparisons} comparison(s)`;
      verdict.textContent = `Race over — ${winner}.`;
      addExplanationStep(`Race over — linear ${linear.comparisons} comparison(s), binary ${binary.comparisons} comparison(s). ${winner}.`);
    }
  }, STEP_MS);
}

startBtn.addEventListener("click", () => {
  stopCurrent();
  const array = parseArrayInput();
  if (!array) {
    alert("Please enter valid numbers separated by commas.");
    return;
  }
  const target = parseTarget();
  if (target === null) {
    alert("Please enter a valid target number.");
    return;
  }
  explanationText.innerHTML = "";
  const kind = algorithmSelect.value;
  if (kind === "race") runRace(array, target);
  else runSingle(kind, array, target);
});

exampleBtn.addEventListener("click", () => {
  stopCurrent();
  userInput.value = EXAMPLE_ARRAY.join(",");
  targetInput.value = String(EXAMPLE_TARGET);
  explanationText.innerHTML = "";
  addExplanationStep(`Loaded example: [1..20] with target ${EXAMPLE_TARGET}.`);
  const kind = algorithmSelect.value;
  if (kind === "race") runRace(EXAMPLE_ARRAY, EXAMPLE_TARGET);
  else runSingle(kind, [...EXAMPLE_ARRAY], EXAMPLE_TARGET);
});

algorithmSelect.addEventListener("change", (e) => {
  algorithmCodeDisplay.textContent = algorithmsCode[e.target.value] || "Code not available.";
});

// Initial state
renderBars(visualizer, EXAMPLE_ARRAY, {});
algorithmCodeDisplay.textContent = algorithmsCode.linear;
explainReady();

function explainReady() {
  addExplanationStep("Search visualizer ready. Enter an array + target, or run the 20-element example.");
}
