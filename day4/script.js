// 1. Select all required elements
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// 2. Constants
const MAX_CHARS = 200;
const WARNING_THRESHOLD = 180;

// 3. Update Counts Function
function updateCounts() {
  const text = textarea.value;
  const charLength = text.length;
  
  // Count words: split by whitespace, filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordLength = text.trim() === "" ? 0 : words.length;

  // Update text content
  charCount.textContent = `${charLength} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${wordLength} words`;

  // Update classes based on length
  charCount.classList.remove("warning", "over");
  if (charLength > MAX_CHARS) {
    charCount.classList.add("over");
  } else if (charLength > WARNING_THRESHOLD) {
    charCount.classList.add("warning");
  }
}

// 4. Save Draft to localStorage
function saveDraft() {
  localStorage.setItem("note-draft", textarea.value);
}

// 5. Load Draft from localStorage
function loadDraft() {
  const saved = localStorage.getItem("note-draft");
  if (saved) {
    textarea.value = saved;
  }
}

// 6. Load Theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }
}

// 7. Clear Everything
function clearAll() {
  textarea.value = "";
  localStorage.removeItem("note-draft");
  updateCounts();
  textarea.focus();
}

// --- EVENT LISTENERS ---

// Update and save on every keystroke
textarea.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

// Clear button click
clearBtn.addEventListener("click", clearAll);

// Theme toggle click
themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
    localStorage.setItem("theme", "dark");
  }
});

// Escape key clears the textarea
textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// --- INITIALIZE ON LOAD ---
loadDraft();
loadTheme();
updateCounts();