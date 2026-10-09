// stack.js — Stack (LIFO) visualizer

const MAX_SIZE = 8;
const DEMO_STEP_MS = 1000;
const POP_ANIM_MS = 350;
const FIND_STEP_MS = 800;

let stack = [];
let demoTimer = null;
let demoRunning = false;
// Temp stack for the 2-stack find. Only non-empty mid-find;
// updateStatus surfaces it so progress is visible.
let auxStack = [];
let findTimer = null;
let findRunning = false;

const visualizer = document.getElementById("visualizer");
const explanationText = document.getElementById("explanationText");
const stackStatus = document.getElementById("stackStatus");
const algorithmCodeDisplay = document.getElementById("algorithm-code");
const pushInput = document.getElementById("pushInput");
const findInput = document.getElementById("findInput");
const findBtn = document.getElementById("findBtn");
const operationSelect = document.getElementById("operationSelect");
const demoBtn = document.getElementById("demoBtn");

const algorithmsCode = {
  push: `
ALGORITHM — PUSH(x)

Step 1 -> Check if the stack is full (overflow)
Step 2 -> Place x on top of the stack
Step 3 -> The new element becomes the TOP

CODE

  #define MAX 100
  int stack[MAX], top = -1;

  void push(int x) {
      if (top == MAX - 1) {
          printf("Stack Overflow");
          return;
      }
      stack[++top] = x;
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  pop: `
ALGORITHM — POP()

Step 1 -> Check if the stack is empty (underflow)
Step 2 -> Remember the TOP element
Step 3 -> Remove it; the element below becomes the new TOP

CODE

  int pop() {
      if (top == -1) {
          printf("Stack Underflow");
          return -1;
      }
      return stack[top--];
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  peek: `
ALGORITHM — PEEK()

Step 1 -> Check if the stack is empty (underflow)
Step 2 -> Return the TOP element without removing it

CODE

  int peek() {
      if (top == -1) {
          printf("Stack is empty");
          return -1;
      }
      return stack[top];
  }

TIME COMPLEXITY: O(1)
SPACE COMPLEXITY: O(1) per operation
  `,
  find: `
ALGORITHM — FIND(x) WITH A TEMP STACK

Step 1 -> While the main stack is not empty, look at its TOP
Step 2 -> If TOP equals x, x is FOUND
Step 3 -> Otherwise pop TOP into a second (temp) stack and repeat
Step 4 -> If the main stack empties first, x is NOT present
Step 5 -> Push everything back from the temp stack to restore order

CODE

  int findTwoStacks(int main[], int *top, int x) {
      int temp[MAX], t = -1, found = 0;
      while (*top != -1 && !found) {
          int v = main[(*top)--];   // pop from main
          if (v == x) found = 1;
          temp[++t] = v;            // stash in temp
      }
      while (t != -1)               // restore main
          main[++(*top)] = temp[t--];
      return found;
  }

TIME COMPLEXITY: O(n) — each element moves at most twice
SPACE COMPLEXITY: O(n) for the temp stack
  `,
  demo: `
DEMO SEQUENCE

push(10) -> push(20) -> push(30) -> peek()
  -> pop() -> pop() -> push(40) -> pop()

Watch the TOP marker move as elements are
added and removed. Last in, first out (LIFO).
  `,
};

function explain(message) {
  const p = document.createElement("p");
  p.textContent = message;
  explanationText.appendChild(p);
  explanationText.scrollTop = explanationText.scrollHeight;
}

function updateStatus() {
  const top = stack.length === 0 ? "—" : stack[stack.length - 1];
  const temp = auxStack.length > 0 ? ` — Temp: ${auxStack.length}` : "";
  stackStatus.textContent = `Size: ${stack.length} / ${MAX_SIZE} — Top: ${top}${temp}`;
}

function makeItem(value, extraClass = "") {
  const item = document.createElement("div");
  item.className = "stack-item" + extraClass;
  item.textContent = value;
  return item;
}

// Render bottom-anchored stack. The container uses
// flex-direction: column-reverse, so stack[0] lands at the bottom.
function renderStack(options = {}) {
  const { flashTop = false, popping = false } = options;
  visualizer.innerHTML = "";
  const container = document.createElement("div");
  container.className = "stack-container";

  if (stack.length === 0) {
    const empty = document.createElement("div");
    empty.className = "stack-empty";
    empty.textContent = "Stack is empty — push a value to begin.";
    container.appendChild(empty);
  }

  stack.forEach((value, index) => {
    const isTop = index === stack.length - 1;
    let cls = isTop ? " top" : "";
    if (isTop && flashTop) cls += " peek-flash";
    if (isTop && popping) cls += " pop-out";
    container.appendChild(makeItem(value, cls));
  });

  visualizer.appendChild(container);
}

// Duo view for the 2-stack find: main + temp stacks side by side.
// foundIndex (into the current main stack) highlights the match.
function renderFindView(foundIndex = null) {
  visualizer.innerHTML = "";
  const duo = document.createElement("div");
  duo.className = "stack-duo";
  duo.appendChild(stackPane("Main Stack", stack, foundIndex));
  duo.appendChild(stackPane("Temp Stack", auxStack, null));
  visualizer.appendChild(duo);
}

function stackPane(caption, arr, foundIndex) {
  const pane = document.createElement("div");
  pane.className = "stack-pane";
  const cap = document.createElement("div");
  cap.className = "stack-caption";
  cap.textContent = caption;
  pane.appendChild(cap);
  const items = document.createElement("div");
  items.className = "stack-items";
  if (arr.length === 0) {
    const empty = document.createElement("div");
    empty.className = "stack-empty";
    empty.textContent = "— empty —";
    items.appendChild(empty);
  }
  arr.forEach((value, index) => {
    const isTop = index === arr.length - 1;
    let cls = isTop ? " top" : "";
    if (foundIndex !== null && index === foundIndex) cls += " found";
    items.appendChild(makeItem(value, cls));
  });
  pane.appendChild(items);
  return pane;
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

// Cancel a running find. Elements parked in the temp stack are pushed
// back so the main stack is whole again — never drop them.
function stopFind() {
  if (findTimer !== null) {
    clearTimeout(findTimer);
    findTimer = null;
  }
  findBtn.disabled = false;
  if (!findRunning) return;
  findRunning = false;
  while (auxStack.length > 0) stack.push(auxStack.pop());
  auxStack = [];
  renderStack();
  updateStatus();
}

function pushValue(rawValue) {
  const value = Number(rawValue);
  if (rawValue === "" || Number.isNaN(value)) {
    explain("Push rejected: enter a valid number first.");
    return false;
  }
  if (stack.length >= MAX_SIZE) {
    explain(`Stack Overflow: cannot push ${value} — stack is full (${MAX_SIZE}). Pop something first.`);
    return false;
  }
  stack.push(value);
  renderStack();
  updateStatus();
  explain(`push(${value}): placed on top. Size is now ${stack.length}.`);
  return true;
}

function popValue() {
  if (stack.length === 0) {
    explain("Stack Underflow: cannot pop — stack is empty.");
    return false;
  }
  const value = stack[stack.length - 1];
  renderStack({ popping: true });
  setTimeout(() => {
    stack.pop();
    renderStack();
    updateStatus();
  }, POP_ANIM_MS);
  explain(`pop(): removed ${value} from the top.`);
  return true;
}

function peekValue() {
  if (stack.length === 0) {
    explain("Peek: stack is empty — nothing on top.");
    return false;
  }
  renderStack({ flashTop: true });
  explain(`peek(): top element is ${stack[stack.length - 1]} (stack unchanged).`);
  return true;
}

function clearStack() {
  stopDemo();
  stopFind();
  stack = [];
  auxStack = [];
  renderStack();
  updateStatus();
  explain("clear(): stack emptied.");
}

// Animated 2-stack search: pop non-matches into a temp stack until the
// target surfaces (or main empties), then push everything back so the
// stack ends exactly as it started.
function findValue(rawValue) {
  const target = Number(rawValue);
  if (rawValue === "" || Number.isNaN(target)) {
    explain("Find rejected: enter a valid number first.");
    return false;
  }
  if (findRunning) return false;
  stopDemo();
  if (stack.length === 0) {
    explain("Find: stack is empty — nothing to search.");
    return false;
  }
  auxStack = [];
  findRunning = true;
  findBtn.disabled = true;
  algorithmCodeDisplay.textContent = algorithmsCode.find;
  operationSelect.value = "find";
  let comparisons = 0;
  explain(`find(${target}): searching top-down, parking checked elements in a temp stack.`);
  renderFindView(null);
  updateStatus();

  const searchStep = () => {
    if (stack.length === 0) {
      explain(`Checked ${comparisons} element(s): ${target} is NOT in the stack. Restoring…`);
      findTimer = setTimeout(restoreStep, FIND_STEP_MS);
      return;
    }
    const top = stack[stack.length - 1];
    comparisons++;
    if (top === target) {
      renderFindView(stack.length - 1);
      updateStatus();
      explain(`Found ${target} after ${comparisons} comparison(s). Restoring temp stack…`);
      findTimer = setTimeout(restoreStep, FIND_STEP_MS);
      return;
    }
    stack.pop();
    auxStack.push(top);
    renderFindView(null);
    updateStatus();
    explain(`Checked ${top} ≠ ${target} — moved to temp stack.`);
    findTimer = setTimeout(searchStep, FIND_STEP_MS);
  };

  const restoreStep = () => {
    if (auxStack.length === 0) {
      findRunning = false;
      findTimer = null;
      findBtn.disabled = false;
      renderStack();
      updateStatus();
      explain(`Restore complete. Stack is back to [${stack.join(", ")}].`);
      return;
    }
    const value = auxStack.pop();
    stack.push(value);
    renderFindView(null);
    updateStatus();
    explain(`Moved ${value} back from temp stack.`);
    findTimer = setTimeout(restoreStep, FIND_STEP_MS);
  };

  findTimer = setTimeout(searchStep, FIND_STEP_MS);
  return true;
}

const DEMO_SEQUENCE = [
  { op: "push", value: 10 },
  { op: "push", value: 20 },
  { op: "push", value: 30 },
  { op: "peek" },
  { op: "pop" },
  { op: "pop" },
  { op: "push", value: 40 },
  { op: "pop" },
];

function runDemoSequence() {
  if (demoRunning) return;
  stopDemo();
  stopFind();
  stack = [];
  renderStack();
  updateStatus();
  explanationText.innerHTML = "";
  explain("Demo started: push(10), push(20), push(30), peek, pop, pop, push(40), pop.");
  algorithmCodeDisplay.textContent = algorithmsCode.demo;
  operationSelect.value = "demo";
  demoRunning = true;
  demoBtn.disabled = true;
  demoBtn.textContent = "Demo running… (Clear to stop)";

  let step = 0;
  const runStep = () => {
    if (step >= DEMO_SEQUENCE.length) {
      explain(`Demo finished. Final stack: [${stack.join(", ")}]. LIFO order observed.`);
      stopDemo();
      return;
    }
    const action = DEMO_SEQUENCE[step];
    if (action.op === "push") pushValue(action.value);
    else if (action.op === "pop") popValue();
    else if (action.op === "peek") peekValue();
    step += 1;
    demoTimer = setTimeout(runStep, DEMO_STEP_MS);
  };
  demoTimer = setTimeout(runStep, DEMO_STEP_MS);
}

// Manual operations cancel a running demo/find so they never interleave.
document.getElementById("pushBtn").addEventListener("click", () => {
  stopDemo();
  stopFind();
  if (pushValue(pushInput.value)) pushInput.value = "";
});

document.getElementById("popBtn").addEventListener("click", () => {
  stopDemo();
  stopFind();
  popValue();
});

document.getElementById("peekBtn").addEventListener("click", () => {
  stopDemo();
  stopFind();
  peekValue();
});

document.getElementById("clearBtn").addEventListener("click", clearStack);

demoBtn.addEventListener("click", runDemoSequence);

findBtn.addEventListener("click", () => {
  stopDemo();
  findValue(findInput.value);
});

pushInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    stopFind();
    if (pushValue(pushInput.value)) pushInput.value = "";
  }
});

findInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    findValue(findInput.value);
  }
});

operationSelect.addEventListener("change", (e) => {
  algorithmCodeDisplay.textContent =
    algorithmsCode[e.target.value] || "Code not available.";
});

// Initial state
renderStack();
updateStatus();
algorithmCodeDisplay.textContent = algorithmsCode.push;
explain("Stack visualizer ready. Push values, find one with 2-stack search, or run the demo sequence.");
