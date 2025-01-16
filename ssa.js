// for steps drop down
function displaySteps() {
  const steps = document.getElementById("ssa-steps");
  steps.classList.toggle("visible"); // toggle the visible class
}

// Select all input elements with the name "arrayType" (radio buttons)
document.querySelectorAll('input[name="arrayType"]').forEach((radio) => {
  // Add an event listener to each radio button to respond to changes
  radio.addEventListener("change", () => {
    // Determine whether the "custom" option is selected
    const isCustom =
      document.querySelector('input[name="arrayType"]:checked').value ===
      "custom";
    // Show or hide the array size input based on whether the custom option is selected
    document.getElementById("arraySizeContainer").style.display = isCustom
      ? "none"
      : "block";
    // Show or hide the custom array input field when "custom" is selected
    document.getElementById("customArrayContainer").style.display = isCustom
      ? "block"
      : "none";
  });
});

// Counters for tracking passes, comparisons, and swaps
let comparisons = 0;
let swaps = 0;
let passes = 0;

// Visualization Helper Functions \\
// Create and display bars to visualize the array
function createBars(array) {
  // Get the visualizer container
  const container = document.getElementById("visualizer");
  container.innerHTML = ""; // Clear any existing bars
  // Loop through the array to create bars for each value
  array.forEach((value) => {
    // Create a bar element for the current value
    const bar = document.createElement("div");
    // Assign the "bar" class to the element
    bar.className = "visBar";
    // Set the bar's height based on the array value
    bar.style.height = `${value}px`;
    // Add the bar to the container
    container.appendChild(bar);
  });
}

// Update the height of existing bars to reflect changes in the array
function updateBars(array) {
  // Get all bar elements
  const bars = document.querySelectorAll(".visBar");
  // Loop through the array and update each bar's height
  array.forEach((value, index) => {
    bars[index].style.height = `${value}px`;
  });
}

// Generate an array of random integers
function generateRandomArray(size) {
  const array = [];
  // Fill the array with random values between 0 and 200
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 200));
  }
  // Return the generated array
  return array;
}

// Function to parse the custom array
function parseCustomArray(input) {
  // Split the input string into an array of values using commas as the delimiter
  return input.split(",").map((num) => {
    // Trim any extra spaces around the value and parse it as an integer (base 10)
    const parsed = parseInt(num.trim(), 10);
    // If parsing fails (e.g., value is not a valid number), throw an error
    if (isNaN(parsed))
      throw new Error("Invalid array input. Ensure all values are numbers.");
    // Return the parsed number
    return parsed;
  });
}

// Perform Bubble Sort and visualize the process
async function bubbleSort(array) {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    passes++; // Increment pass counter
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++; // Increment comparison counter
      // Swap if elements are in the wrong order
      if (array[j] > array[j + 1]) {
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++; // Increment swap counter
        updateBars(array); // Update the bar visualization
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
  // create array
  let array = [];
  // set isCustom to true if arrayType is checked
  const isCustom =
    document.querySelector('input[name="arrayType"]:checked').value ===
    "custom";

  try {
    // if isCustom is true
    if (isCustom) {
      // make var customArrayInput hold the custom array values
      const customArrayInput = document.getElementById("customArray").value;
      // if the custom array cannot be trimmed
      if (!customArrayInput.trim())
        throw new Error("Please enter a custom array.");
      // else parse the customArray and set its value to be held by array var
      array = parseCustomArray(customArrayInput);
    } else {
      // if not a custom array, get the size value from the user
      const size = parseInt(document.getElementById("arraySize").value, 10);
      // if the value is not an integer or is less than 1
      if (!Number.isInteger(size) || size <= 0) {
        // display alert
        alert("Please enter a valid array size greater than 0.");
        return;
      }
      // generate the array of user input size with random numbers
      array = generateRandomArray(size);
    }

    createBars(array); // Visualize initial array

    // will hold the selected algorithm
    const algorithm = document.getElementById("algorithmSelect").value;

    // before sorting
    document.getElementById("output").innerHTML = `
        <h2>Before Sorting:</h2>
        ${array.slice(0, 20).join(", ")} ${array.length > 20 ? " ..." : ""}
      `;

    comparisons = 0;
    swaps = 0;
    passes = 0;

    // start time recording
    const start = performance.now();
    // if the algorithm selected is...
    if (algorithm === "bubbleSort") {
      // call...
      await bubbleSort(array);
    } else if (algorithm === "selectionSort") {
      await selectionSort(array);
    } else if (algorithm === "insertionSort") {
      await insertionSort(array);
    }
    // end time recording of algorithm
    const end = performance.now();

    // duration is the difference between end and start
    const duration = (end - start).toFixed(2);
    // get div element with Id of "output" and add the following to the div
    document.getElementById("output").innerHTML += `
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
