// Event listener to toggle between random and custom array
document.querySelectorAll('input[name="arrayType"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isCustom =
      document.querySelector('input[name="arrayType"]:checked').value ===
      "custom";
    document.getElementById("arraySizeContainer").style.display = isCustom
      ? "none"
      : "block";
    document.getElementById("customArrayContainer").style.display = isCustom
      ? "block"
      : "none";
  });
});

// Counters for tracking passes, comparisons, and swaps
let comparisons = 0;
let swaps = 0;
let passes = 0;

// Visualization Helper Functions
function createBars(array) {
  const container = document.getElementById("visualizer");
  container.innerHTML = ""; // Clear existing bars
  array.forEach((value) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${value}px`;
    container.appendChild(bar);
  });
}

function updateBars(array) {
  const bars = document.querySelectorAll(".bar");
  array.forEach((value, index) => {
    bars[index].style.height = `${value}px`;
  });
}

// Function to generate a random array
function generateRandomArray(size) {
  const array = [];
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 200)); // Random numbers between 0 and 200
  }
  return array;
}

// Function to parse the custom array
function parseCustomArray(input) {
  return input.split(",").map((num) => {
    const parsed = parseInt(num.trim(), 10);
    if (isNaN(parsed))
      throw new Error("Invalid array input. Ensure all values are numbers.");
    return parsed;
  });
}

// Bubble Sort Algorithm
async function bubbleSort(array) {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    passes++;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      if (array[j] > array[j + 1]) {
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++;
        updateBars(array); // Update visualization
        await new Promise((resolve) => setTimeout(resolve, 50)); // Pause for animation
      }
    }
  }
}

// Selection Sort Algorithm
async function selectionSort(array) {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    passes++;
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      let temp = array[i];
      array[i] = array[minIndex];
      array[minIndex] = temp;
      swaps++;
      updateBars(array); // Update visualization
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

// Insertion Sort Algorithm
async function insertionSort(array) {
  const n = array.length;
  for (let i = 1; i < n; i++) {
    passes++;
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      comparisons++;
      array[j + 1] = array[j];
      j = j - 1;
      swaps++;
      updateBars(array); // Update visualization
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    array[j + 1] = key;
    updateBars(array); // Update visualization
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Function to run the selected sorting algorithm and display the result
async function runSortingAlgorithm() {
  let array = [];
  const isCustom =
    document.querySelector('input[name="arrayType"]:checked').value ===
    "custom";

  try {
    if (isCustom) {
      const customArrayInput = document.getElementById("customArray").value;
      if (!customArrayInput.trim())
        throw new Error("Please enter a custom array.");
      array = parseCustomArray(customArrayInput);
    } else {
      const size = parseInt(document.getElementById("arraySize").value, 10);
      if (!Number.isInteger(size) || size <= 0) {
        alert("Please enter a valid array size greater than 0.");
        return;
      }
      array = generateRandomArray(size);
    }

    createBars(array); // Visualize initial array

    const algorithm = document.getElementById("algorithmSelect").value;

    comparisons = 0;
    swaps = 0;
    passes = 0;

    const start = performance.now();
    if (algorithm === "bubbleSort") {
      await bubbleSort(array);
    } else if (algorithm === "selectionSort") {
      await selectionSort(array);
    } else if (algorithm === "insertionSort") {
      await insertionSort(array);
    }
    const end = performance.now();

    const duration = (end - start).toFixed(2);
    document.getElementById("output").innerHTML = `
        <h2>After Sorting:</h2>
        ${array.slice(0, 20).join(", ")} ${array.length > 20 ? " ..." : ""}
        <p><strong>Passes:</strong> ${passes}</p>
        <p><strong>Comparisons:</strong> ${comparisons}</p>
        <p><strong>Swaps:</strong> ${swaps}</p>
        <p><strong>Time taken:</strong> ${duration} milliseconds</p>
      `;
  } catch (error) {
    alert(error.message);
  }
}
