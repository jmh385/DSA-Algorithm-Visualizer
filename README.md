# DSA-Algorithm-Visualizer
Interactive DSA Algorithm Visualizer - An educational web application that brings data structures and algorithms to life through dynamic visualizations. Features sorting algorithms, graph algorithms, tree operations, and classic algorithmic problems with step-by-step animations and code explanations. Built with vanilla JavaScript, HTML5, and CSS3.
# 🧠 DSA Algorithm Visualizer

An interactive web-based platform for visualizing data structures and algorithms through dynamic animations and step-by-step explanations. Perfect for students, educators, and developers looking to understand algorithmic concepts visually.

## ✨ Features

### 🔄 Sorting Algorithms
- **Bubble Sort** - Compare and swap adjacent elements
- **Selection Sort** - Find minimum and place at correct position
- **Insertion Sort** - Insert elements into sorted portion
- **Merge Sort** - Divide and conquer approach
- **Quick Sort** - Partition-based sorting

### 🔍 Searching Algorithms
- **Linear Search** - Step-by-step scan with comparison count
- **Binary Search** - Low/high/mid range narrowing (auto-sorts input)
- **Compare Race** - Side-by-side linear vs binary with live counters and verdict

### 📊 Graph Algorithms
- **Breadth-First Search (BFS)** - Level-by-level traversal
- **Depth-First Search (DFS)** - Deep exploration with backtracking
- **Dijkstra's Algorithm** - Shortest path in weighted graphs
- **Prim's Algorithm** - Minimum Spanning Tree construction
- **Kruskal's Algorithm** - MST using edge sorting

### 🌳 Tree Operations
- **Tree Traversals** - Preorder, Inorder, Postorder
- **Binary Search Tree Operations** - Search, Insert, Delete
- **Tree Construction** - From preorder/inorder and postorder/inorder

### 🎯 Classic Problems
- **Tower of Hanoi** - Recursive disk movement puzzle
- **Traveling Salesman Problem** - Route optimization
- **Knapsack Problem** - Dynamic programming solution

### 🥞 Stack Operations
- **Push / Pop / Peek** - Core LIFO operations with animations
- **Scripted Demo** - Auto-played push/pop sequence with narration

### 📥 Queue Operations
- **Enqueue / Dequeue / Peek** - Core FIFO operations with animations
- **Reverse Demo** - Queue reversal animated with a helper stack
- **Scripted Demo** - Auto-played enqueue/dequeue sequence with narration

### 🔗 Linked List Operations
- **Insert Head / Tail / At Position** - Pointer-splice animations
- **Delete Head / Tail / By Value** - Relink narration with NULL terminator
- **Search & Traverse** - Walking-pointer animations with narration

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional installations required

### Installation
1. Clone the repository:
```
git clone https://github.com/yourusername/dsa-algorithm-visualizer.git
cd dsa-algorithm-visualizer
```

2. Open `index.html` in your web browser or serve with a local server:
```
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

3. Navigate to `http://localhost:8000` (if using local server)

## 🎮 How to Use

### Sorting Algorithms
1. Select a sorting algorithm from the dropdown
2. Enter comma-separated numbers (e.g., `64,34,25,12,22,11,90`)
3. Click **"Start Sorting"** to begin visualization
4. Watch the step-by-step animation with explanations

### Graph Algorithms
1. Choose graph type (directed/undirected)
2. Enter number of vertices
3. Define edges in format: `A-B, B-C, C-D` (with optional weights: `A-B(5)`)
4. Select algorithm and provide start/goal vertices
5. Click **"Visualize Graph"** then **"Start Algorithm"**

### Tree Operations
1. Enter node values separated by commas
2. Select desired tree operation
3. For search/insert/delete: provide the target value
4. Click **"Visualize Tree"** then **"Run Algorithm"**

### Classic Problems
1. Choose problem type (TSP, Hanoi, Knapsack)
2. Configure problem parameters
3. Click **"Visualize Problem"** then **"Start Algorithm"**

## 📁 Project Structure

```
dsa-algorithm-visualizer/
├── index.html              # Main landing page (with embedded sorting visualizer)
├── sorting.html            # Standalone sorting algorithms page
├── search.html              # Searching algorithms + compare race page
├── graph.html             # Graph algorithms interface
├── tree.html              # Tree operations interface
├── rw.html                # Classic problems interface
├── stack.html             # Stack visualizer interface
├── queue.html             # Queue visualizer interface
├── linkedlist.html        # Linked list visualizer interface
├── css/
│   ├── style.css          # Landing + sorting styling
│   ├── graph.css          # Graph page styling
│   ├── tree.css           # Tree page styling
│   ├── rw.css             # Classic problems styling
│   ├── stack.css          # Stack page styling
│   ├── queue.css          # Queue page styling
│   ├── linkedlist.css     # Linked list page styling
│   └── search.css         # Searching page styling
├── js/
│   ├── sorting.js         # Sorting algorithms logic
│   ├── graph.js           # Graph algorithms implementation
│   ├── tree.js            # Tree operations logic
│   ├── rw.js              # Classic problems implementation
│   ├── stack.js           # Stack operations logic
│   ├── queue.js           # Queue operations logic
│   ├── linkedlist.js      # Linked list operations logic
│   └── search.js          # Searching algorithms logic
├── assets/
│   ├── 1.png              # Background image
│   └── 3.jpg              # Background image
└── README.md
```

## 🛠️ Technical Implementation

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: SVG for dynamic visualizations
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **No external dependencies** - Pure vanilla JavaScript

### Key Features
- **Real-time Animations** - Smooth transitions with configurable speed
- **Interactive Controls** - Play, pause, step-through functionality
- **Algorithm Explanations** - Step-by-step textual descriptions
- **Code Display** - Algorithm implementations in C/C++
- **Responsive Design** - Works on desktop and mobile devices
- **Multiple Input Methods** - Manual input and predefined examples

## 🎯 Educational Value

This visualizer helps users understand:
- **Time and Space Complexity** - Visual representation of algorithm efficiency
- **Algorithm Logic** - Step-by-step breakdown of complex processes
- **Data Structure Relationships** - How elements interact and transform
- **Problem-Solving Patterns** - Common algorithmic approaches

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Ideas
- Add new algorithms (Heap Sort, Radix Sort, A* Pathfinding)
- Improve animations and visual effects
- Add more data structures (Hash Tables, Heaps, Tries)
- Implement algorithm complexity analysis
- Add mobile touch controls
- Create algorithm comparison features

## 📋 Future Enhancements

- [ ] **Algorithm Comparison** - Side-by-side performance analysis
- [ ] **Custom Speed Control** - User-adjustable animation speed
- [ ] **Save/Share Visualizations** - Export animations as GIFs
- [ ] **Quiz Mode** - Interactive learning with questions
- [ ] **Dark/Light Theme** - User preference settings
- [ ] **Multiple Language Support** - Code examples in Python, Java
- [ ] **Audio Narration** - Spoken explanations for accessibility

## 📖 Algorithm References

Each algorithm includes:
- **Step-by-step explanation** of the process
- **Time complexity analysis** (Best, Average, Worst case)
- **Space complexity** information
- **Complete code implementation** in C/C++
- **Visual animation** showing each operation

## 🐛 Known Issues

- Large datasets (>50 elements) may slow down animations
- Complex graphs might overlap on smaller screens
- Safari may have minor CSS animation differences

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub:[https://github.com/lav2003]
- LinkedIn: [www.linkedin.com/in/lav-singh-ba8853289]
- Email: lavsingh5268@gmail.com

## 🙏 Acknowledgments

- Inspired by various algorithm visualization platforms
- Educational content structured for optimal learning
- Built with passion for computer science education

⭐ **Star this repository if you found it helpful!**



This README.md file provides:

- **Complete project overview** with emojis for visual appeal
- **Detailed installation and usage instructions**
- **Project structure** showing all your files
- **Technical implementation details**
- **Contributing guidelines** for open source collaboration
- **Future enhancement roadmap**
- **Professional formatting** with proper markdown syntax

Simply copy this code into a `README.md` file in your project root directory. Remember to:

1. Replace `yourusername` with your actual GitHub username
2. Update the author section with your real information
3. Add a `LICENSE` file if you haven't already
4. Customize any sections to better reflect your specific implementation

This README will make your DSA Algorithm Visualizer project look professional and well-documented on GitHub!
