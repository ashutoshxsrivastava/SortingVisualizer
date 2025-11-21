document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const arrayInputsDiv = document.getElementById("arrayInputs");
  const addNumberBtn = document.getElementById("addNumber");
  const randomArrayBtn = document.getElementById("randomArrayBtn");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const algoSelect = document.getElementById("algoSelect");
  const arrayContainer = document.getElementById("arrayContainer");
  const speedRange = document.getElementById("speedRange");
  const sortedMessage = document.getElementById("sortedMessage");

  const sizeModal = document.getElementById("sizeModal");
  const arraySizeInput = document.getElementById("arraySizeInput");
  const confirmSizeBtn = document.getElementById("confirmSizeBtn");
  const cancelSizeBtn = document.getElementById("cancelSizeBtn");

  let array = [];
  let stopSorting = false;
  let paused = false;
  let currentSpeed = 300; // initial speed

  // Event listeners
 pauseBtn.addEventListener("click", () => {
     paused = !paused;
     pauseBtn.innerText = paused ? "Resume" : "Pause";

     // Message
     sortedMessage.innerText = paused ? "⏸️ Sorting paused! Please resume" : "▶️ Sorting resumed!";
 });

  resetBtn.addEventListener("click", () => location.reload());

  speedRange.addEventListener("input", () => {
    const val = parseInt(speedRange.value);
    currentSpeed = 1200 - (val / speedRange.max) * 1150;
  });

  async function sleepDynamic() {
    while (paused) await new Promise(resolve => setTimeout(resolve, 50));
    return new Promise(resolve => setTimeout(resolve, currentSpeed));
  }

  function addInput(value = "") {
    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
    arrayInputsDiv.appendChild(input);
  }

  function enableControls(enabled) {
    addNumberBtn.disabled = !enabled;
    randomArrayBtn.disabled = !enabled;
    startBtn.disabled = !enabled;
    stopBtn.disabled = enabled;
    pauseBtn.disabled = enabled;
    algoSelect.disabled = !enabled;

    const inputs = arrayInputsDiv.querySelectorAll("input");
    inputs.forEach(i => i.disabled = !enabled);
  }

  function renderBars() {
    arrayContainer.innerHTML = "";
    array.forEach(v => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.innerText = v;
      arrayContainer.appendChild(bar);
    });
  }

  async function animateSwap(i, j) {
    if (stopSorting) return;
    const bars = arrayContainer.children;
    if (!bars[i] || !bars[j]) return;

    const left = bars[i];
    const right = bars[j];
    left.style.zIndex = right.style.zIndex = 9999;

    const lift = () => Math.max(28, Math.min(60, Math.round(60 * (300 / Math.max(80, currentSpeed)))));

    left.style.transform = `translateY(-${lift()}px)`;
    right.style.transform = `translateY(${lift()}px)`;
    await sleepDynamic();

    const dx = right.offsetLeft - left.offsetLeft;
    left.style.transform = `translate(${dx}px, -${lift()}px)`;
    right.style.transform = `translate(${-dx}px, ${lift()}px)`;
    await sleepDynamic();

    left.style.transform = `translate(${dx}px, 0)`;
    right.style.transform = `translate(${-dx}px, 0)`;
    await sleepDynamic();

    left.style.transform = right.style.transform = "";
    if (i < j) arrayContainer.insertBefore(right, left);
    else arrayContainer.insertBefore(left, right);

    Array.from(arrayContainer.children).forEach((bar, k) => bar.innerText = array[k]);
    left.style.zIndex = right.style.zIndex = "";
    await sleepDynamic();
  }

  async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (stopSorting) return;

        const bars = arrayContainer.children;
        bars[j].classList.add("current");
        bars[j + 1].classList.add("current");
        await sleepDynamic();

        if (array[j] > array[j + 1]) {
          bars[j].classList.add("greater");
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          await animateSwap(j, j + 1);
          bars[j].classList.remove("greater");
          bars[j + 1].classList.remove("greater");
          swapped = true;
        }
        bars[j].classList.remove("current");
        bars[j + 1].classList.remove("current");
      }
      arrayContainer.children[n - i - 1].classList.add("sorted");
      if (!swapped) {
        for (let k = 0; k < n - i - 1; k++) arrayContainer.children[k].classList.add("sorted");
        break;
      }
    }
    Array.from(arrayContainer.children).forEach(bar => bar.classList.add("sorted"));
    sortedMessage.innerText = "✅ Array Sorted Successfully!";
    enableControls(true);
  }

  async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n; i++) {
      if (stopSorting) return;
      let minIdx = i;
      const bars = arrayContainer.children;
      bars[minIdx].classList.add("min");

      for (let j = i + 1; j < n; j++) {
        if (stopSorting) return;
        bars[j].classList.add("current");
        await sleepDynamic();
        if (array[j] < array[minIdx]) {
          bars[minIdx].classList.remove("min");
          minIdx = j;
          bars[minIdx].classList.add("min");
        }
        bars[j].classList.remove("current");
      }

      if (minIdx !== i) {
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        await animateSwap(i, minIdx);
      }
      bars[i].classList.remove("min");
      bars[i].classList.add("sorted");
    }
    arrayContainer.children[arrayContainer.children.length - 1].classList.add("sorted");
    sortedMessage.innerText = "✅ Array Sorted Successfully!";
    enableControls(true);
  }

  addNumberBtn.addEventListener("click", () => addInput(""));
  randomArrayBtn.addEventListener("click", () => { sizeModal.style.display = "flex"; });
  confirmSizeBtn.addEventListener("click", () => {
      const s = parseInt(arraySizeInput.value);
      if (isNaN(s) || s < 1 || s > 50) return alert("Enter size 1–50");

      // Clear previous inputs
      arrayInputsDiv.innerHTML = "";
      array = [];

      // Generate random array
      for (let i = 0; i < s; i++) {
          const v = Math.floor(Math.random() * 100) + 1;
          array.push(v);
          addInput(v); // add input field with value
      }

      // Show message
      sortedMessage.innerText = `🟢 Array of size ${s} generated successfully!`;

      // Close modal
      sizeModal.style.display = "none";
      arraySizeInput.value = "";
  });

  cancelSizeBtn.addEventListener("click", () => sizeModal.style.display = "none");

  startBtn.addEventListener("click", () => {
      const inputs = arrayInputsDiv.querySelectorAll("input");
      array = [];
      inputs.forEach(inp => { const v = parseInt(inp.value); if (!isNaN(v)) array.push(v); });
      if (array.length === 0) return alert("Array is empty, please enter elements");

      renderBars();
      stopSorting = false;
      paused = false;
      pauseBtn.innerText = "Pause";
      enableControls(false);

      // Message
      sortedMessage.innerText = "🔹 Sorting started...";

      if (algoSelect.value === "bubble") bubbleSort();
      else selectionSort();
  });

  stopBtn.addEventListener("click", () => {
      stopSorting = true;
      paused = false;
      pauseBtn.innerText = "Pause";
      enableControls(true);

      // Message
      sortedMessage.innerText = "⏹️ Sorting stopped!";
  });

  // initial 5 inputs
  for (let i = 0; i < 5; i++) addInput("");

  document.addEventListener("keydown", e => { if (e.key === "Escape") sizeModal.style.display = "none"; });
});