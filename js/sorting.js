// Grab elements

const welcomeScreen = document.getElementById("welcome-screen");
const sortingVisualizer = document.getElementById("sorting-visualizer");
const sortingOption = document.getElementById("sorting-option");
const graphOption = document.getElementById("graph-option");
const treeOption = document.getElementById("tree-option");
const algorithmCodeDisplay = document.getElementById("algorithm-code");

// Show sorting visualizer (index.html landing page only;
// sorting.html shows the visualizer directly, so these may be null)
if (sortingOption && welcomeScreen && sortingVisualizer) {
  sortingOption.addEventListener("click", () => {
    welcomeScreen.style.display = "none"; // Hide welcome screen
    sortingVisualizer.style.display = "block"; // Show sorting visualizer
  });
}

const algorithmsCode = {
  bubble: `
  ALGORITHM 

Step 1 -> Start at the beginning of the list 
Step 2 -> Compare the first value in the list with the next value 
Step 3 -> If the first value is larger, swap the positions of the two values 
step 4 -> Move to the second value in the list 
step 5 -> Repeat until there are no more items to compare 
step 6 -> Go back to the start of the list and repeat the entire process

CODE

 void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

TIME COMPLEXITY

Average case time complexity: O(n2)
Worst-case time complexity: O(n2)
Best case time complexity: O(n)



  `,
  selection: `
ALGORITHM

Initialization: Start with an unsorted array or list. 
Iteration: Iterate over the array. 
Find the minimum element: Find the smallest value in the unsorted portion of the array. 
Swap elements: Swap the minimum element with the first element in the unsorted portion of the array. 
Reduce the unsorted portion: The sorted portion of the array grows by one element. 
Repeat: Repeat the process until there are no more elements left in the unsorted portion of the array. 
Completion: The array is sorted

CODE

  void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}

TIME COMPLEXITY

Average case time complexity: O(n2)
Worst-case time complexity: O(n2)
Best case time complexity: O(n2)


  `,
  insertion: `

ALGORITHM

Step 1 -> Mark the first element as sorted: Consider the first element to be the beginning of the sorted subarray. 
Step 2 -> Compare the next element: Compare the next element with the elements in the sorted part of the array. 
Step 3 -> Shift larger elements: Shift all larger elements in the sorted part one position to the right. 
Step 4 -> Insert the element: Insert the element into its correct position in the sorted part. 
Step 5 -> Repeat: Repeat the process until all elements are sorted

CODE

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
TIME COMPLEXITY

Best case time complexity: O(n)
Average and worst-case time complexity: O(n2)

  `,
  merge: `

ALGORITHM

Divide: Split the unsorted array into two sub-arrays of roughly equal size. 
Repeat: Continue to divide the sub-arrays until each sub-array has only one element. 
Merge: Compare the smallest elements from each sub-array and copy the smaller one to a temporary array. Move the pointer of the sub-array with the smaller element forward. 
Repeat: Repeat step 3 until one of the sub-arrays is empty. 
Copy: Copy the remaining elements from the non-empty sub-array to the temporary array. 
Copy back: Copy the elements back from the temporary array to the original list.

CODE

void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    int leftArr[n1], rightArr[n2];

    for (int i = 0; i < n1; i++) leftArr[i] = arr[left + i];
    for (int j = 0; j < n2; j++) rightArr[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

TIME COMPLEXITY

Best and Average time complexity: O(n log n)
Worst-case time complexity: O(n log n)



  `,
  quick: `

  ALGORITHM

Select a pivot: Choose an element from the array to use as a pivot. The pivot can be the first, last, or a random element, or the median of a few elements. 
Partition the array: Split the array into two parts, with elements smaller than the pivot on the left and elements larger than the pivot on the right. 
Repeat: Apply Quick Sort to each sub-array until they are sorted.


CODE

  int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
TIME COMPLEXITY

Best and Average time complexity: O(n log n)
Worst-case time complexity: (n2)

    `
  
};


// Event listener to display algorithm code
document.getElementById("algorithm").addEventListener("change", (e) => {
  const selectedAlgorithm = e.target.value;
  algorithmCodeDisplay.textContent = algorithmsCode[selectedAlgorithm] || "Code not available.";
});



const startBtn = document.getElementById('startBtn');
const visualizer = document.getElementById('visualizer');
const userInput = document.getElementById('userInput');
const explanationText = document.getElementById('explanationText');

// Event listener for the start button
startBtn.addEventListener('click', () => {
  const algorithm = document.getElementById('algorithm').value;
  const inputArray = processUserInput(userInput.value);

  if (!inputArray) {
    alert("Please enter valid numbers separated by commas.");
    return;
  }

  // Clear previous explanation text
  explanationText.innerHTML = "";

  switch (algorithm) {
    case 'bubble':
      visualizeBubbleSort(inputArray);
      break;
    case 'selection':
      visualizeSelectionSort(inputArray);
      break;
    case 'insertion':
      visualizeInsertionSort(inputArray);
      break;
    case 'quick':
      quickPending = 0; // fresh sort — drop any state from a previous run
      visualizeQuickSort(inputArray, 0, inputArray.length - 1);
      break;
    case 'merge':
      visualizeMergeSort(inputArray);
      break;
    default:
      alert("Invalid algorithm selected!");
  }
});

// Preset example inputs, one per algorithm — each chosen to show off
// that algorithm's behavior (many swaps, few shifts, classic partitions).
const EXAMPLE_ARRAYS = {
  bubble: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  selection: [64, 34, 25, 12, 22, 11, 90, 48, 56, 71, 9, 33, 41, 5, 77, 18],
  insertion: [1, 3, 2, 4, 6, 5, 7, 9, 8, 10, 12, 11, 13, 15, 14, 16],
  quick: [42, 15, 88, 6, 73, 29, 54, 91, 37, 64, 11, 48, 80, 23, 67, 35],
  merge: [38, 27, 43, 3, 9, 82, 10, 55, 21, 74, 61, 49, 96, 32, 68, 15],
};

// Example button: loads the preset for the currently selected
// algorithm into the input and starts the visualization immediately.
const exampleBtn = document.getElementById('exampleBtn');
if (exampleBtn) {
  exampleBtn.addEventListener('click', () => {
    const selected = document.getElementById('algorithm').value;
    const example = EXAMPLE_ARRAYS[selected] || EXAMPLE_ARRAYS.bubble;
    userInput.value = example.join(',');
    startBtn.click();
  });
}

// Helper function to process user input
function processUserInput(input) {
  const numbers = input.split(',').map(num => parseInt(num.trim(), 10));
  return numbers.every(num => !isNaN(num)) ? numbers : null;
}

// Helper functions for displaying and animating the array
// activeRange ({left, right}) marks the subarray currently being
// considered (quick/merge sort); others render plain blue.
function displayArray(array, sortedIndex = -1, activeRange = null) {
  const maxVal = Math.max(...array);
  visualizer.innerHTML = array
    .map((value, index) => {
      let className = "bar";
      if (sortedIndex !== -1 && index <= sortedIndex) {
        className = "bar sorted";
      } else if (
        activeRange !== null &&
        index >= activeRange.left &&
        index <= activeRange.right
      ) {
        className = "bar active-range";
      }
      // Scale tallest bar to ~95% of the visualizer so bars always fit
      // inside the box; floor at 6% so labels stay visible (and to
      // handle zeros/negatives, which can't produce a valid height).
      const pct = maxVal > 0 ? Math.max((value / maxVal) * 95, 6) : 6;
      return `
        <div class="${className}" style="height:${pct}%">
          <div class="number">${value}</div>
        </div>
      `;
    })
    .join('');
}

function highlightBars(index1, index2) {
  const bars = document.querySelectorAll('.bar');
  resetHighlights();
  if (bars[index1]) bars[index1].classList.add('red');
  if (bars[index2]) bars[index2].classList.add('red');
}

function resetHighlights() {
  document.querySelectorAll('.bar').forEach(bar => bar.classList.remove('red'));
}

function addExplanationStep(step) {
  const p = document.createElement("p");
  p.textContent = step;
  explanationText.appendChild(p);
  explanationText.scrollTop = explanationText.scrollHeight; // Auto scroll to the latest step
}

// Bubble Sort
function visualizeBubbleSort(array) {
  displayArray(array);
  let i = 0, j = 0;

  const interval = setInterval(() => {
    if (i < array.length) {
      if (j < array.length - i - 1) {
        highlightBars(j, j + 1);
        addExplanationStep(`Comparing ${array[j]} at index ${j} and ${array[j + 1]} at index ${j + 1}.`);

        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          addExplanationStep(`Swapped ${array[j]} and ${array[j + 1]}.`);
          displayArray(array);
        }
        j++;
      } else {
        addExplanationStep(`Pass ${i + 1} completed. Largest element moved to the end.`);
        displayArray(array, array.length - i - 1); // Mark sorted elements
        j = 0;
        i++;
      }
    } else {
      addExplanationStep("Bubble Sort Completed! The array is now sorted.");
      clearInterval(interval);
      resetHighlights();
      displayArray(array, array.length - 1); // Mark all elements as sorted
    }
  }, 800);
}

// Selection Sort
function visualizeSelectionSort(array) {
  displayArray(array);
  let i = 0, j = i + 1;
  let minIndex = i;

  const interval = setInterval(() => {
    if (i < array.length - 1) {
      if (j < array.length) {
        highlightBars(minIndex, j);
        addExplanationStep(`Comparing ${array[j]} at index ${j} with current minimum ${array[minIndex]} at index ${minIndex}.`);

        if (array[j] < array[minIndex]) {
          minIndex = j;
          addExplanationStep(`Updated minimum to ${array[minIndex]} at index ${minIndex}.`);
        }
        j++;
      } else {
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        addExplanationStep(`Swapped ${array[i]} at index ${i} with minimum ${array[minIndex]} at index ${minIndex}.`);
        displayArray(array);
        i++;
        j = i + 1;
        minIndex = i;
      }
    } else {
      addExplanationStep("Selection Sort Completed! The array is now sorted.");
      clearInterval(interval);
      resetHighlights();
      displayArray(array, array.length - 1); // Mark all elements as sorted
    }
  }, 800);
}

// Insertion Sort
function visualizeInsertionSort(array) {
  displayArray(array);
  let i = 1, j = i;

  const interval = setInterval(() => {
    if (i < array.length) {
      if (j > 0 && array[j - 1] > array[j]) {
        highlightBars(j - 1, j);
        [array[j], array[j - 1]] = [array[j - 1], array[j]];
        addExplanationStep(`Moved ${array[j]} to the correct position.`);
        displayArray(array);
        j--;
      } else {
        i++;
        j = i;
      }
    } else {
      addExplanationStep("Insertion Sort Completed! The array is now sorted.");
      clearInterval(interval);
      resetHighlights();
      displayArray(array, array.length - 1); // Mark all elements as sorted
    }
  }, 800);
}

// Quick Sort
// quickPending tracks in-flight partitions so the last one to finish
// can render the all-green finale (reset when a new sort starts above).
let quickPending = 0;

function visualizeQuickSort(array, left, right) {
  if (left >= right) return;
  quickPending++;

  const pivot = array[right];
  let i = left - 1;

  displayArray(array, -1, { left, right });
  addExplanationStep(`Considering subarray [${left}..${right}] with pivot ${pivot}.`);

  const animatePartition = (j) => {
    if (j < right) {
      highlightBars(j, right); // Highlight current element and pivot
      if (array[j] <= pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        addExplanationStep(`Swapped ${array[i]} and ${array[j]}.`);
        displayArray(array, -1, { left, right }); // Update visuals
      }
      setTimeout(() => animatePartition(j + 1), 500); // Continue partitioning
    } else {
      [array[i + 1], array[right]] = [array[right], array[i + 1]];
      addExplanationStep(`Pivot ${pivot} moved to index ${i + 1}.`);
      displayArray(array, -1, { left, right }); // Show pivot position

      // Recursively sort left and right partitions with delays
      setTimeout(() => {
        // This partition is done; children re-arm the counter below.
        // Clamp (don't go negative) so a stale run can't break a new one.
        quickPending = Math.max(0, quickPending - 1);
        visualizeQuickSort(array, left, i);
        visualizeQuickSort(array, i + 2, right);
        if (quickPending === 0) {
          addExplanationStep("Quick Sort Completed! The array is now sorted.");
          resetHighlights();
          displayArray(array, array.length - 1); // Mark all elements as sorted
        }
      }, 800);
    }
  };

  animatePartition(left); // Start partitioning animation
}

// Merge Sort
function visualizeMergeSort(array) {
  const steps = []; // Array to store intermediate steps for visualization

  // Recursive function to divide and merge
  function mergeSortRecursive(arr, left, right) {
    if (left >= right) return;

    const middle = Math.floor((left + right) / 2);

    // Divide the array into two halves
    mergeSortRecursive(arr, left, middle);
    mergeSortRecursive(arr, middle + 1, right);

    // Merge the two halves
    const merged = merge(arr, left, middle, right);
    steps.push({ snapshot: [...merged], left, right });
  }

  // Function to merge two halves
  function merge(arr, left, middle, right) {
    const leftArray = arr.slice(left, middle + 1);
    const rightArray = arr.slice(middle + 1, right + 1);

    let i = 0, j = 0, k = left;
    const explanation = [];

    while (i < leftArray.length && j < rightArray.length) {
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        explanation.push(`Placed ${leftArray[i]} from the left half into position ${k}.`);
        i++;
      } else {
        arr[k] = rightArray[j];
        explanation.push(`Placed ${rightArray[j]} from the right half into position ${k}.`);
        j++;
      }
      k++;
    }

    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      explanation.push(`Placed remaining ${leftArray[i]} from the left half into position ${k}.`);
      i++;
      k++;
    }

    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      explanation.push(`Placed remaining ${rightArray[j]} from the right half into position ${k}.`);
      j++;
      k++;
    }

    addExplanationStep(explanation.join(" "));
    return arr;
  }

  // Start the merge sort process
  mergeSortRecursive(array, 0, array.length - 1);

  // Animation using steps
  let stepIndex = 0;

  const interval = setInterval(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      displayArray(step.snapshot, -1, { left: step.left, right: step.right });
      addExplanationStep(`Step ${stepIndex + 1}: Merging subarray [${step.left}..${step.right}].`);
      stepIndex++;
    } else {
      clearInterval(interval);
      addExplanationStep("Merge Sort Completed! The array is now sorted.");
      resetHighlights();
      displayArray(array, array.length - 1); // Mark all elements as sorted
    }
  }, 800);
}

