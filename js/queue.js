// queue.js — Queue (FIFO) visualizer

const MAX_SIZE = 8;
const DEMO_STEP_MS = 1000;
const DEQUEUE_ANIM_MS = 350;
const REVERSE_STEP_MS = 800;
const FIND_STEP_MS = 1000;

let queue = [];
let demoTimer = null;
let demoRunning = false;
// Temp stack for reverse-with-stack. Only non-empty mid-reverse;
// updateStatus surfaces it so progress is visible.
let tempStack = [];
let reverseTimer = null;
let reverseRunning = false;
// Progress counters for rotation find: after findTotal rotates the
// queue is back in its original order, so cancellation just finishes
// the rotation silently instead of needing a restore pass.
let findTotal = 0;
let findDone = 0;
let findTimer = null;
let findRunning = false;

const visualizer = document.getElementById("visualizer");
const explanationText = document.getElementById("explanationText");
const queueStatus = document.getElementById("queueStatus");
const algorithmCodeDisplay = document.getElementById("algorithm-code");
const enqueueInput = document.getElementById("enqueueInput");
const reverseBtn = document.getElementById("reverseBtn");
const findInput = document.getElementById("findInput");
const findBtn = document.getElementById("findBtn");
const operationSelect = document.getElementById("operationSelect");
const demoBtn = document.getElementById("demoBtn");

const algorithmsCode = {
  enqueue: `
ALGORITHM — ENQUEUE(x)

Step 1 -> Check if the queue is full (overflow)
Step 2 -> Place x at the REAR of the queue

CODE

  #define MAX 100
  int queue[MAX], front = 0, rear = -1;

  void enqueue(int x) {
      if (rear == MAX - 1) {
          printf("Queue Overflow");
          return;
      }
      queue[++rear] = x;
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  dequeue: `
ALGORITHM — DEQUEUE()

Step 1 -> Check if the queue is empty (underflow)
Step 2 -> Remember the FRONT element
Step 3 -> Remove it; the next element becomes the new FRONT

CODE

  int dequeue() {
      if (front > rear) {
          printf("Queue Underflow");
          return -1;
      }
      return queue[front++];
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  peek: `
ALGORITHM — PEEK()

Step 1 -> Check if the queue is empty (underflow)
Step 2 -> Return the FRONT element without removing it

CODE

  int peek() {
      if (front > rear) {
          printf("Queue is empty");
          return -1;
      }
      return queue[front];
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  reverse: `
ALGORITHM — REVERSE WITH A STACK

Step 1 -> While the queue is not empty, dequeue FRONT into a stack
Step 2 -> The first element ends up at the BOTTOM of the stack
Step 3 -> Pop the whole stack back into the queue (appends at REAR)
Step 4 -> The queue now runs in reverse order

CODE

  void reverseQueue(int q[], int *front, int *rear) {
      int stack[MAX], top = -1;
      while (*front <= *rear)
          stack[++top] = q[(*front)++];   // drain queue into stack
      *front = 0; *rear = -1;
      while (top != -1)
          q[++(*rear)] = stack[top--];    // pop stack back into queue
  }

TIME COMPLEXITY: O(n) — each element moves twice
SPACE COMPLEXITY: O(n) for the helper stack
  `,
  find: `
ALGORITHM — FIND(x) BY ROTATION

Step 1 -> Repeat N times (N = queue size): look at FRONT
Step 2 -> If FRONT equals x, x is FOUND (remember its position)
Step 3 -> Dequeue FRONT and immediately enqueue it at REAR
Step 4 -> After N rotations every element is back where it
   started, so the queue order is unchanged

CODE

  int findInQueue(Queue *q, int x) {
      int n = size(q), found = 0;
      for (int i = 0; i < n; i++) {
          int v = dequeue(q);   // take from front
          if (v == x) found = 1;
          enqueue(q, v);        // put back at rear
      }
      return found;             // queue order unchanged
  }

TIME COMPLEXITY: O(n) — one full rotation
SPACE COMPLEXITY: O(1) — no helper structure
  `,
  demo: `
DEMO SEQUENCE

enqueue(10) -> enqueue(20) -> enqueue(30) -> peek()
  -> dequeue() -> enqueue(40) -> dequeue()

Watch the FRONT marker advance as the earliest
arrival always leaves first (FIFO).
  `,
};

function explain(message) {
  const p = document.createElement("p");
  p.textContent = message;
  explanationText.appendChild(p);
  explanationText.scrollTop = explanationText.scrollHeight;
}

function updateStatus() {
  const front = queue.length === 0 ? "—" : queue[0];
  const rear = queue.length === 0 ? "—" : queue[queue.length - 1];
  const temp = tempStack.length > 0 ? ` — Temp: ${tempStack.length}` : "";
  queueStatus.textContent = `Size: ${queue.length} / ${MAX_SIZE} — Front: ${front} — Rear: ${rear}${temp}`;
}

function makeItem(value, extraClass = "") {
  const item = document.createElement("div");
  item.className = "queue-item" + extraClass;
  item.textContent = value;
  return item;
}

// Render left-anchored row: queue[0] is FRONT (left), last is REAR.
// foundRear lights up a just-checked match (it sits at the rear
// because checking rotates it there).
function renderQueue(options = {}) {
  const { flashFront = false, dequeuing = false, foundRear = false } = options;
  visualizer.innerHTML = "";
  const container = document.createElement("div");
  container.className = "queue-container";

  if (queue.length === 0) {
    const empty = document.createElement("div");
    empty.className = "queue-empty";
    empty.textContent = "Queue is empty — enqueue a value to begin.";
    container.appendChild(empty);
  }

  queue.forEach((value, index) => {
    let cls = "";
    if (index === 0) cls += " front";
    if (index === queue.length - 1) cls += " rear";
    if (index === 0 && flashFront) cls += " peek-flash";
    if (index === 0 && dequeuing) cls += " dequeue-out";
    if (index === queue.length - 1 && foundRear) cls += " found";
    container.appendChild(makeItem(value, cls));
  });

  visualizer.appendChild(container);
}

// Duo view for reverse-with-stack: queue + temp stack side by side.
function renderReverseView() {
  visualizer.innerHTML = "";
  const duo = document.createElement("div");
  duo.className = "queue-duo";

  const queuePane = document.createElement("div");
  queuePane.className = "queue-pane";
  const queueCap = document.createElement("div");
  queueCap.className = "queue-caption";
  queueCap.textContent = "Queue";
  queuePane.appendChild(queueCap);
  const row = document.createElement("div");
  row.className = "queue-row";
  if (queue.length === 0) {
    const empty = document.createElement("div");
    empty.className = "queue-empty";
    empty.textContent = "— empty —";
    row.appendChild(empty);
  }
  queue.forEach((value, index) => {
    let cls = "";
    if (index === 0) cls += " front";
    if (index === queue.length - 1) cls += " rear";
    row.appendChild(makeItem(value, cls));
  });
  queuePane.appendChild(row);
  duo.appendChild(queuePane);

  const tempPane = document.createElement("div");
  tempPane.className = "temp-pane";
  const tempCap = document.createElement("div");
  tempCap.className = "queue-caption";
  tempCap.textContent = "Temp Stack";
  tempPane.appendChild(tempCap);
  const items = document.createElement("div");
  items.className = "temp-items";
  if (tempStack.length === 0) {
    const empty = document.createElement("div");
    empty.className = "queue-empty";
    empty.textContent = "— empty —";
    items.appendChild(empty);
  }
  tempStack.forEach((value) => {
    const item = document.createElement("div");
    item.className = "temp-item";
    item.textContent = value;
    items.appendChild(item);
  });
  tempPane.appendChild(items);
  duo.appendChild(tempPane);

  visualizer.appendChild(duo);
}

function stopDemo() {
  if (demoTimer !== null) {
    clearTimeout(demoTimer);
    demoTimer = null;
  }
  if (demoRunning) {
    demoRunning = false;
    demoBtn.disabled = false;
    demoBtn.textContent = "Run Demo Sequence";
  }
}

// Cancel a running reverse. Elements parked in the temp stack are
// restored to the FRONT (reverse of how they left) — never drop them.
function stopReverse() {
  if (reverseTimer !== null) {
    clearTimeout(reverseTimer);
    reverseTimer = null;
  }
  reverseBtn.disabled = false;
  if (!reverseRunning) return;
  reverseRunning = false;
  while (tempStack.length > 0) queue.unshift(tempStack.pop());
  tempStack = [];
  renderQueue();
  updateStatus();
}

// Cancel a running find. The queue is mid-rotation, so silently finish
// the remaining rotates — the order ends up exactly as it started.
function stopFind() {
  if (findTimer !== null) {
    clearTimeout(findTimer);
    findTimer = null;
  }
  findBtn.disabled = false;
  if (!findRunning) return;
  findRunning = false;
  const remaining =
    findTotal > 0 ? (findTotal - (findDone % findTotal)) % findTotal : 0;
  for (let i = 0; i < remaining; i++) queue.push(queue.shift());
  renderQueue();
  updateStatus();
}

function enqueueValue(rawValue) {
  const value = Number(rawValue);
  if (rawValue === "" || Number.isNaN(value)) {
    explain("Enqueue rejected: enter a valid number first.");
    return false;
  }
  if (queue.length >= MAX_SIZE) {
    explain(
      `Queue Overflow: cannot enqueue ${value} — queue is full (${MAX_SIZE}). Dequeue something first.`,
    );
    return false;
  }
  queue.push(value);
  renderQueue();
  updateStatus();
  explain(`enqueue(${value}): placed at rear. Size is now ${queue.length}.`);
  return true;
}

function dequeueValue() {
  if (queue.length === 0) {
    explain("Queue Underflow: cannot dequeue — queue is empty.");
    return false;
  }
  const value = queue[0];
  renderQueue({ dequeuing: true });
  setTimeout(() => {
    queue.shift();
    renderQueue();
    updateStatus();
  }, DEQUEUE_ANIM_MS);
  explain(`dequeue(): removed ${value} from the front.`);
  return true;
}

function peekValue() {
  if (queue.length === 0) {
    explain("Peek: queue is empty — nothing at front.");
    return false;
  }
  renderQueue({ flashFront: true });
  explain(`peek(): front element is ${queue[0]} (queue unchanged).`);
  return true;
}

function clearQueue() {
  stopDemo();
  stopReverse();
  stopFind();
  queue = [];
  tempStack = [];
  renderQueue();
  updateStatus();
  explain("clear(): queue emptied.");
}

// Animated search by rotation: dequeue each front, check it, and
// immediately enqueue it at the rear. After exactly N steps (N = queue
// size) every element is back where it started, so the queue ends in
// its original order using only genuine queue operations.
function findValue(rawValue) {
  const target = Number(rawValue);
  if (rawValue === "" || Number.isNaN(target)) {
    explain("Find rejected: enter a valid number first.");
    return false;
  }
  if (findRunning) return false;
  stopDemo();
  stopReverse();
  if (queue.length === 0) {
    explain("Find: queue is empty — nothing to search.");
    return false;
  }
  findRunning = true;
  findBtn.disabled = true;
  algorithmCodeDisplay.textContent = algorithmsCode.find;
  operationSelect.value = "find";
  findTotal = queue.length;
  findDone = 0;
  let foundAt = -1;
  explain(
    `find(${target}): checking ${findTotal} element(s) front to back, rotating each to the rear.`,
  );
  renderQueue({ flashFront: true });
  updateStatus();

  const searchStep = () => {
    if (findDone >= findTotal) {
      // One full rotation: the order is exactly as it started.
      findRunning = false;
      findTimer = null;
      findBtn.disabled = false;
      renderQueue();
      updateStatus();
      if (foundAt === -1) {
        explain(
          `${target} is NOT in the queue (${findTotal} checked). Order unchanged.`,
        );
      } else {
        explain(
          `Done. ${target} found at position ${foundAt + 1}. Queue is back to [${queue.join(", ")}].`,
        );
      }
      return;
    }
    const front = queue.shift();
    queue.push(front);
    findDone++;
    if (front === target && foundAt === -1) {
      foundAt = findDone - 1;
      renderQueue({ foundRear: true });
      explain(
        `Checked ${front} = ${target} — FOUND at position ${foundAt + 1}. Rotating the rest to restore order…`,
      );
    } else {
      renderQueue({ flashFront: true });
      explain(
        `Checked ${front} ≠ ${target} — moved to rear (${findDone}/${findTotal}).`,
      );
    }
    updateStatus();
    findTimer = setTimeout(searchStep, FIND_STEP_MS);
  };

  findTimer = setTimeout(searchStep, FIND_STEP_MS);
  return true;
}

// Animated reversal via a helper stack: dequeue everything into the
// temp stack, then pop it back — the queue ends up reversed.
function reverseQueue() {
  if (reverseRunning) return false;
  stopDemo();
  stopFind();
  if (queue.length === 0) {
    explain("Reverse: queue is empty — nothing to reverse.");
    return false;
  }
  tempStack = [];
  reverseRunning = true;
  reverseBtn.disabled = true;
  algorithmCodeDisplay.textContent = algorithmsCode.reverse;
  operationSelect.value = "reverse";
  explain(
    `reverse(): draining ${queue.length} element(s) into a temp stack, front first.`,
  );
  renderReverseView();
  updateStatus();

  const drainStep = () => {
    if (queue.length === 0) {
      explain("Queue drained. Popping the temp stack back into the queue…");
      reverseTimer = setTimeout(fillStep, REVERSE_STEP_MS);
      return;
    }
    const value = queue.shift();
    tempStack.push(value);
    renderReverseView();
    updateStatus();
    explain(`Moved ${value} from queue front to temp stack.`);
    reverseTimer = setTimeout(drainStep, REVERSE_STEP_MS);
  };

  const fillStep = () => {
    if (tempStack.length === 0) {
      reverseRunning = false;
      reverseTimer = null;
      reverseBtn.disabled = false;
      renderQueue();
      updateStatus();
      explain(`Reverse complete. Queue is now [${queue.join(", ")}].`);
      return;
    }
    const value = tempStack.pop();
    queue.push(value);
    renderReverseView();
    updateStatus();
    explain(`Popped ${value} from temp stack to queue rear.`);
    reverseTimer = setTimeout(fillStep, REVERSE_STEP_MS);
  };

  reverseTimer = setTimeout(drainStep, REVERSE_STEP_MS);
  return true;
}

const DEMO_SEQUENCE = [
  { op: "enqueue", value: 10 },
  { op: "enqueue", value: 20 },
  { op: "enqueue", value: 30 },
  { op: "peek" },
  { op: "dequeue" },
  { op: "enqueue", value: 40 },
  { op: "dequeue" },
];

function runDemoSequence() {
  if (demoRunning) return;
  stopDemo();
  stopReverse();
  stopFind();
  queue = [];
  renderQueue();
  updateStatus();
  explanationText.innerHTML = "";
  explain(
    "Demo started: enqueue(10), enqueue(20), enqueue(30), peek, dequeue, enqueue(40), dequeue.",
  );
  algorithmCodeDisplay.textContent = algorithmsCode.demo;
  operationSelect.value = "demo";
  demoRunning = true;
  demoBtn.disabled = true;
  demoBtn.textContent = "Demo running… (Clear to stop)";

  let step = 0;
  const runStep = () => {
    if (step >= DEMO_SEQUENCE.length) {
      explain(
        `Demo finished. Final queue: [${queue.join(", ")}]. FIFO order observed.`,
      );
      stopDemo();
      return;
    }
    const action = DEMO_SEQUENCE[step];
    if (action.op === "enqueue") enqueueValue(action.value);
    else if (action.op === "dequeue") dequeueValue();
    else if (action.op === "peek") peekValue();
    step += 1;
    demoTimer = setTimeout(runStep, DEMO_STEP_MS);
  };
  demoTimer = setTimeout(runStep, DEMO_STEP_MS);
}

// Manual operations cancel a running demo/reverse/find so they never interleave.
document.getElementById("enqueueBtn").addEventListener("click", () => {
  stopDemo();
  stopReverse();
  stopFind();
  if (enqueueValue(enqueueInput.value)) enqueueInput.value = "";
});

document.getElementById("dequeueBtn").addEventListener("click", () => {
  stopDemo();
  stopReverse();
  stopFind();
  dequeueValue();
});

document.getElementById("peekBtn").addEventListener("click", () => {
  stopDemo();
  stopReverse();
  stopFind();
  peekValue();
});

document.getElementById("clearBtn").addEventListener("click", clearQueue);

demoBtn.addEventListener("click", runDemoSequence);

reverseBtn.addEventListener("click", () => {
  stopDemo();
  stopFind();
  reverseQueue();
});

findBtn.addEventListener("click", () => {
  stopDemo();
  stopReverse();
  findValue(findInput.value);
});

enqueueInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    stopReverse();
    stopFind();
    if (enqueueValue(enqueueInput.value)) enqueueInput.value = "";
  }
});

findInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    stopReverse();
    findValue(findInput.value);
  }
});

operationSelect.addEventListener("change", (e) => {
  algorithmCodeDisplay.textContent =
    algorithmsCode[e.target.value] || "Code not available.";
});

// Initial state
renderQueue();
updateStatus();
algorithmCodeDisplay.textContent = algorithmsCode.enqueue;
explain(
  "Queue visualizer ready. Enqueue values, find one by rotation search, reverse with a helper stack, or run the demo sequence.",
);

