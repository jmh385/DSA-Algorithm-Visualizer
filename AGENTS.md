# AGENTS.md — DSA-Algorithm-Visualizer

Static vanilla-JS algorithm visualizer. No `package.json`, build, bundler, tests, lint, CI, or dependencies.

## Run

No build step. Preview static files directly:

```bash
python -m http.server 8000   # then open http://localhost:8000
# or: npx serve .
```

Opening `index.html` from disk also works.

## Structure (`css/` + `js/` + `assets/`)

Pages in root, code in subdirs. Each page is a self-contained trio with no shared modules or imports — paths are relative (`css/…`, `js/…`, `../assets/…` from CSS):

- `index.html` + `js/sorting.js` + `css/style.css` — landing page; sorting UI is an embedded hidden `#sorting-visualizer` div toggled by JS
- `sorting.html` + `js/sorting.js` + `css/style.css` — standalone sorting page; same control ids as the embedded sorter, always-visible `#sorting-page` wrapper
- `graph.html` + `js/graph.js` + `css/graph.css` — BFS/DFS/Dijkstra/Prim/Kruskal
- `tree.html` + `js/tree.js` + `css/tree.css` — traversals, BST ops, construction
- `rw.html` + `js/rw.js` + `css/rw.css` — TSP / Hanoi / Knapsack
- `stack.html` + `js/stack.js` + `css/stack.css` — Stack push/pop/peek + scripted demo
- `queue.html` + `js/queue.js` + `css/queue.css` — Queue enqueue/dequeue/peek + reverse-with-stack demo (horizontal FIFO mirror of the stack page)
- `linkedlist.html` + `js/linkedlist.js` + `css/linkedlist.css` — Singly linked list: positional insert/delete, pointer-walk search/traverse + scripted demo
- `search.html` + `js/search.js` + `css/search.css` — Linear/binary search over bars + side-by-side compare race (stacked layout mirroring `sorting.html`)
- `assets/1.png`, `assets/3.jpg` — background images referenced from CSS

## CSS

- `css/style.css` is the shared base: reset, page shell, header, `#controls` set, `#visualizer` card, `#explanationText`, `#code-section`/`pre`, stack/queue layout + status + duo-view helpers, both media queries. It also styles the landing/sorting pages directly (LANDING section at the bottom wins ties within the file).
- Every other `css/*.css` starts with `@import url("style.css");` (must stay line 1) and keeps only page overrides + visualization-specific rules. Imported rules lose ties, so a page file never needs to repeat a shared declaration.
- Do not use bare element selectors (`h1`, `input`) in page files or the shared section — they leak across pages via the import. Scope them (e.g. `#sorting-visualizer h1`).

## Gotchas

- `js/sorting.js` runs on both `index.html` and `sorting.html`: the welcome-screen toggle is null-guarded, and both pages must keep the same sorter control ids (`#userInput`, `#algorithm`, `#startBtn`, `#exampleBtn`, `#visualizer`, `#explanationText`, `#algorithm-code`). Do not use `#sorting-visualizer` outside `index.html` — it is `display: none` by default.
- Each page's JS is monolithic and coupled to hardcoded DOM ids in its HTML (e.g. `#visualizeBtn`, `#explanationText`, `#algorithm-code`, per-file `algorithmsCode` template strings). Renaming an id breaks that page; keep HTML/JS edits in sync.
- Rendering is SVG/DOM + CSS only. Keep it that way — do not add frameworks, bundlers, or npm deps.
