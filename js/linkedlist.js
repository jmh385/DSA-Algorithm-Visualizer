// linkedlist.js — Singly linked list visualizer

const MAX_SIZE = 10;
const DEMO_STEP_MS = 1000;
const WALK_STEP_MS = 700;

let list = [];
let demoTimer = null;
let demoRunning = false;
// Pointer walks (search/traverse) never mutate, so cancelling one only
// stops the timer — there is nothing to restore.
let walkTimer = null;
let walkRunning = false;

const visualizer = document.getElementById("visualizer");
const explanationText = document.getElementById("explanationText");
const listStatus = document.getElementById("listStatus");
const algorithmCodeDisplay = document.getElementById("algorithm-code");
const insertInput = document.getElementById("insertInput");
const positionInput = document.getElementById("positionInput");
const deleteInput = document.getElementById("deleteInput");
const searchInput = document.getElementById("searchInput");
const operationSelect = document.getElementById("operationSelect");
const demoBtn = document.getElementById("demoBtn");
const traverseBtn = document.getElementById("traverseBtn");

const algorithmsCode = {
  insert: `
ALGORITHM — INSERT(x) AT POSITION p (1-based)

Step 1 -> Check the list is not full (overflow)
Step 2 -> Walk from HEAD to the node before position p
Step 3 -> Point the new node at that node's successor
Step 4 -> Point that node at the new node (HEAD if p == 1)

CODE

  struct Node { int data; struct Node *next; };

  void insertAt(struct Node **head, int x, int p) {
      struct Node *n = malloc(sizeof *n);
      n->data = x;
      if (p == 1) { n->next = *head; *head = n; return; }
      struct Node *cur = *head;
      for (int i = 1; i < p - 1; i++) cur = cur->next;
      n->next = cur->next;
      cur->next = n;
  }

TIME COMPLEXITY: O(1) head, O(n) tail/position
SPACE COMPLEXITY: O(1) per node
  `,
  delete: `
ALGORITHM — DELETE(x)

Step 1 -> Check the list is not empty (underflow)
Step 2 -> If HEAD holds x, move HEAD to the next node and free it
Step 3 -> Otherwise walk until a node's successor holds x
Step 4 -> Bypass it: point the node at its successor's successor

CODE

  void deleteValue(struct Node **head, int x) {
      if (*head == NULL) { printf("Underflow"); return; }
      if ((*head)->data == x) {
          struct Node *tmp = *head;
          *head = (*head)->next;
          free(tmp);
          return;
      }
      struct Node *cur = *head;
      while (cur->next && cur->next->data != x) cur = cur->next;
      if (cur->next) {
          struct Node *tmp = cur->next;
          cur->next = tmp->next;
          free(tmp);
      }
  }

TIME COMPLEXITY: O(1) head, O(n) tail/by-value
SPACE COMPLEXITY: O(1)
  `,
  search: `
ALGORITHM — SEARCH(x)

Step 1 -> Start the pointer at HEAD
Step 2 -> Compare each node's data with x, advancing the pointer
Step 3 -> On a match, x is FOUND at that position
Step 4 -> Reaching NULL means x is NOT present

CODE

  int search(struct Node *head, int x) {
      int pos = 1;
      for (struct Node *cur = head; cur; cur = cur->next, pos++)
          if (cur->data == x) return pos;
      return -1;
  }

TIME COMPLEXITY: O(n)
SPACE COMPLEXITY: O(1)
  `,
  traverse: `
ALGORITHM — TRAVERSE()

Step 1 -> Start the pointer at HEAD
Step 2 -> Visit each node, then follow its next pointer
Step 3 -> Stop at NULL — every node visited exactly once

CODE

  void traverse(struct Node *head) {
      for (struct Node *cur = head; cur; cur = cur->next)
          printf("%d ", cur->data);
  }

TIME COMPLEXITY: O(n)
SPACE COMPLEXITY: O(1)
  `,
  demo: `
DEMO SEQUENCE

insertTail(10) -> insertTail(20) -> insertTail(30)
  -> search(20) -> delete(20) -> insertHead(5) -> traverse()

Watch HEAD move, pointers relink around the removed
node, and the final walk visit every node in order.
  `,
};

function explain(message) {
  const p = document.createElement("p");
  p.textContent = message;
  explanationText.appendChild(p);
  explanationText.scrollTop = explanationText.scrollHeight;
}

function updateStatus() {
  const head = list.length === 0 ? "—" : list[0];
  const tail = list.length === 0 ? "—" : list[list.length - 1];
  listStatus.textContent = `Size: ${list.length} / ${MAX_SIZE} — Head: ${head} — Tail: ${tail}`;
}

function makeNode(value, extraClass = "") {
  const node = document.createElement("div");
  node.className = "list-node" + extraClass;
  const data = document.createElement("div");
  data.className = "node-data";
  data.textContent = value;
  const next = document.createElement("div");
  next.className = "node-next";
  next.textContent = "→";
  node.appendChild(data);
  node.appendChild(next);
  return node;
}

// Render the chain left to right ending in NULL. Indexes stand in for
// pointers: highlight marks {current, found, splice} by node index,
// `searched` (already-checked node indexes, kept lit amber), and
// `animate` (pop-in only the newly inserted node — walks re-render
// every step, so animating there would replay on all nodes each tick).
function renderList(mark = {}) {
  const {
    current = -1,
    found = -1,
    splice = -1,
    searched = [],
    animate = -1,
  } = mark;
  visualizer.innerHTML = "";
  const container = document.createElement("div");
  container.className = "list-container";

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = "List is empty — insert a value to begin.";
    container.appendChild(empty);
  }

  list.forEach((value, index) => {
    let cls = "";
    if (index === 0) cls += " head-node";
    if (index === current) cls += " current";
    if (index === found) cls += " found";
    if (index === splice) cls += " splice";
    if (searched.includes(index)) cls += " searched";
    if (index === animate) cls += " node-in";
    container.appendChild(makeNode(value, cls));
    if (index < list.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "list-arrow";
      arrow.textContent = "→";
      container.appendChild(arrow);
    }
  });

  if (list.length > 0) {
    const nullEnd = document.createElement("div");
    nullEnd.className = "list-null";
    nullEnd.textContent = "NULL";
    container.appendChild(nullEnd);
  }

  visualizer.appendChild(container);
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

function stopWalk() {
  if (walkTimer !== null) {
    clearTimeout(walkTimer);
    walkTimer = null;
  }
  walkRunning = false;
}

function readNumber(rawValue) {
  const value = Number(rawValue);
  return rawValue === "" || Number.isNaN(value) ? null : value;
}

function insertHead(value) {
  list.unshift(value);
  renderList({ splice: 0, animate: 0 });
  updateStatus();
  explain(`insertHead(${value}): HEAD now points to ${value}.`);
}

function insertTail(value) {
  list.push(value);
  renderList({ splice: list.length - 1, animate: list.length - 1 });
  updateStatus();
  explain(
    `insertTail(${value}): node ${list.length > 1 ? list[list.length - 2] : "—"} now points to ${value}.`,
  );
}

function insertAtPos(rawValue, rawPos) {
  const value = readNumber(rawValue);
  if (value === null) {
    explain("Insert rejected: enter a valid number first.");
    return false;
  }
  const pos = Number(rawPos);
  if (
    rawPos === "" ||
    !Number.isInteger(pos) ||
    pos < 1 ||
    pos > list.length + 1
  ) {
    explain(`Insert rejected: position must be 1–${list.length + 1}.`);
    return false;
  }
  if (list.length >= MAX_SIZE) {
    explain(`Overflow: cannot insert ${value} — list is full (${MAX_SIZE}).`);
    return false;
  }
  if (pos === 1) {
    insertHead(value);
    return true;
  }
  if (pos === list.length + 1) {
    insertTail(value);
    return true;
  }
  list.splice(pos - 1, 0, value);
  renderList({ splice: pos - 1, animate: pos - 1 });
  updateStatus();
  explain(
    `insertAt(${value}, ${pos}): node ${list[pos - 2]} now points to ${value}, which points to ${list[pos]}.`,
  );
  return true;
}

function guardedInsert(value, pos) {
  if (list.length >= MAX_SIZE) {
    explain(`Overflow: list is full (${MAX_SIZE}).`);
    return false;
  }
  if (pos === "head") insertHead(value);
  else insertTail(value);
  return true;
}

function deleteHead() {
  if (list.length === 0) {
    explain("Underflow: cannot delete — list is empty.");
    return false;
  }
  const value = list.shift();
  renderList();
  updateStatus();
  explain(
    `deleteHead(): removed ${value}. HEAD now points to ${list.length > 0 ? list[0] : "NULL"}.`,
  );
  return true;
}

function deleteTail() {
  if (list.length === 0) {
    explain("Underflow: cannot delete — list is empty.");
    return false;
  }
  const value = list.pop();
  renderList();
  updateStatus();
  explain(
    `deleteTail(): removed ${value}. ${list.length > 0 ? `Node ${list[list.length - 1]} now points to NULL.` : "List is now empty."}`,
  );
  return true;
}

function deleteValue(rawValue) {
  const value = readNumber(rawValue);
  if (value === null) {
    explain("Delete rejected: enter a valid number first.");
    return false;
  }
  const index = list.indexOf(value);
  if (index === -1) {
    explain(`delete(${value}): not in the list — nothing removed.`);
    return false;
  }
  const prev = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;
  list.splice(index, 1);
  renderList();
  updateStatus();
  if (prev === null)
    explain(
      `delete(${value}): removed head. HEAD now points to ${next === null ? "NULL" : next}.`,
    );
  else
    explain(
      `delete(${value}): node ${prev} now points to ${next === null ? "NULL" : next}.`,
    );
  return true;
}

function clearList() {
  stopDemo();
  stopWalk();
  list = [];
  renderList();
  updateStatus();
  explain("clear(): list emptied.");
}

// Animated pointer walk: highlight advances node by node.
// Callers stop any demo first (unless the demo itself is calling).
function walkList(steps, onDone) {
  if (walkRunning) {
    explain("A walk is already running — wait for it to finish.");
    return false;
  }
  if (list.length === 0) {
    explain("Walk: list is empty — nothing to visit.");
    return false;
  }
  walkRunning = true;
  let step = 0;
  const runStep = () => {
    if (step >= steps.length) {
      walkRunning = false;
      walkTimer = null;
      renderList();
      updateStatus();
      if (onDone) onDone();
      return;
    }
    steps[step]();
    step += 1;
    walkTimer = setTimeout(runStep, WALK_STEP_MS);
  };
  walkTimer = setTimeout(runStep, WALK_STEP_MS);
  return true;
}

function searchValue(rawValue, keepDemo = false) {
  const target = readNumber(rawValue);
  if (target === null) {
    explain("Search rejected: enter a valid number first.");
    return false;
  }
  if (!keepDemo) stopDemo();
  if (list.length === 0) {
    explain("Search: list is empty — nothing to find.");
    return false;
  }
  const snapshot = list.slice();
  let foundAt = -1;
  const steps = snapshot.map((value, index) => () => {
    // Nodes before the pointer were already checked — keep them lit.
    const searched = snapshot.map((_, i) => i).filter((i) => i < index);
    if (value === target && foundAt === -1) {
      foundAt = index;
      renderList({ found: index, searched });
      explain(`Pointer at node ${index + 1}: ${value} = ${target} — FOUND.`);
    } else if (foundAt === -1) {
      renderList({ current: index, searched });
      explain(
        `Pointer at node ${index + 1}: ${value} ≠ ${target} — advancing.`,
      );
    }
  });
  explain(
    `search(${target}): walking from HEAD, ${snapshot.length} node(s) to check.`,
  );
  algorithmCodeDisplay.textContent = algorithmsCode.search;
  operationSelect.value = "search";
  return walkList(steps, () => {
    if (foundAt === -1)
      explain(
        `${target} is NOT in the list (${snapshot.length} node(s) checked).`,
      );
    else explain(`Done. ${target} found at position ${foundAt + 1}.`);
  });
}

function traverseList(keepDemo = false) {
  if (!keepDemo) stopDemo();
  if (list.length === 0) {
    explain("Traverse: list is empty — nothing to visit.");
    return false;
  }
  const snapshot = list.slice();
  const steps = snapshot.map((value, index) => () => {
    renderList({ current: index });
    explain(
      `Visit node ${index + 1}: data = ${value}, next → ${index + 1 < snapshot.length ? snapshot[index + 1] : "NULL"}.`,
    );
  });
  explain(`traverse(): visiting ${snapshot.length} node(s) from HEAD to NULL.`);
  algorithmCodeDisplay.textContent = algorithmsCode.traverse;
  operationSelect.value = "traverse";
  return walkList(steps, () => {
    explain(`Traverse complete: [${snapshot.join(" → ")} → NULL].`);
  });
}

const DEMO_SEQUENCE = [
  { op: "insertTail", value: 10 },
  { op: "insertTail", value: 20 },
  { op: "insertTail", value: 30 },
  { op: "search", value: 20 },
  { op: "delete", value: 20 },
  { op: "insertHead", value: 5 },
  { op: "traverse" },
];

function runDemoSequence() {
  if (demoRunning) return;
  stopDemo();
  stopWalk();
  list = [];
  renderList();
  updateStatus();
  explanationText.innerHTML = "";
  explain(
    "Demo started: insertTail(10, 20, 30), search(20), delete(20), insertHead(5), traverse.",
  );
  algorithmCodeDisplay.textContent = algorithmsCode.demo;
  operationSelect.value = "demo";
  demoRunning = true;
  demoBtn.disabled = true;
  demoBtn.textContent = "Demo running… (Clear to stop)";

  let step = 0;
  const runStep = () => {
    if (step >= DEMO_SEQUENCE.length) {
      explain(`Demo finished. Final list: [${list.join(", ")}].`);
      stopDemo();
      return;
    }
    const action = DEMO_SEQUENCE[step];
    step += 1;
    if (action.op === "insertTail") {
      guardedInsert(action.value, "tail");
      demoTimer = setTimeout(runStep, DEMO_STEP_MS);
    } else if (action.op === "insertHead") {
      guardedInsert(action.value, "head");
      demoTimer = setTimeout(runStep, DEMO_STEP_MS);
    } else if (action.op === "delete") {
      deleteValue(String(action.value));
      demoTimer = setTimeout(runStep, DEMO_STEP_MS);
    } else if (action.op === "search") {
      searchInput.value = String(action.value);
      searchValue(action.value, true);
      // Walk runs on its own timer; resume demo after it finishes.
      const waitForWalk = () => {
        if (walkRunning) demoTimer = setTimeout(waitForWalk, WALK_STEP_MS);
        else demoTimer = setTimeout(runStep, DEMO_STEP_MS);
      };
      demoTimer = setTimeout(waitForWalk, WALK_STEP_MS);
    } else if (action.op === "traverse") {
      traverseList(true);
      const waitForWalk = () => {
        if (walkRunning) demoTimer = setTimeout(waitForWalk, WALK_STEP_MS);
        else demoTimer = setTimeout(runStep, DEMO_STEP_MS);
      };
      demoTimer = setTimeout(waitForWalk, WALK_STEP_MS);
    }
  };
  demoTimer = setTimeout(runStep, DEMO_STEP_MS);
}

// Manual operations cancel a running demo/walk so they never interleave.
document.getElementById("insertHeadBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  if (list.length >= MAX_SIZE) {
    explain(`Overflow: list is full (${MAX_SIZE}).`);
    return;
  }
  const value = readNumber(insertInput.value);
  if (value === null) {
    explain("Insert rejected: enter a valid number first.");
    return;
  }
  insertHead(value);
  insertInput.value = "";
});

document.getElementById("insertTailBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  if (list.length >= MAX_SIZE) {
    explain(`Overflow: list is full (${MAX_SIZE}).`);
    return;
  }
  const value = readNumber(insertInput.value);
  if (value === null) {
    explain("Insert rejected: enter a valid number first.");
    return;
  }
  insertTail(value);
  insertInput.value = "";
});

document.getElementById("insertAtBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  if (insertAtPos(insertInput.value, positionInput.value))
    insertInput.value = "";
});

document.getElementById("deleteHeadBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  deleteHead();
});

document.getElementById("deleteTailBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  deleteTail();
});

document.getElementById("deleteValueBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  deleteValue(deleteInput.value);
});

// document.getElementById("clearBtn").addEventListener("click", clearList);

document.getElementById("searchBtn").addEventListener("click", () => {
  stopDemo();
  stopWalk();
  searchValue(searchInput.value);
});

traverseBtn.addEventListener("click", () => {
  stopDemo();
  stopWalk();
  traverseList();
});

demoBtn.addEventListener("click", runDemoSequence);

insertInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    stopWalk();
    insertAtPos(
      insertInput.value,
      positionInput.value || String(list.length + 1),
    );
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopDemo();
    stopWalk();
    searchValue(searchInput.value);
  }
});

operationSelect.addEventListener("change", (e) => {
  algorithmCodeDisplay.textContent =
    algorithmsCode[e.target.value] || "Code not available.";
});

// Initial state
renderList();
updateStatus();
algorithmCodeDisplay.textContent = algorithmsCode.insert;
explain(
  "Linked list ready. Insert values, search with a walking pointer, or run the demo sequence.",
);

