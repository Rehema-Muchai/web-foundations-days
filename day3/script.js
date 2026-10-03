// ==========================================
// STARTING DATA
// ==========================================
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// ==========================================
// 1. searchNotes(word)
// ==========================================
function searchNotes(word) {
  const lowerWord = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(lowerWord));
}

// ==========================================
// 2. longestNote()
// ==========================================
function longestNote() {
  if (notes.length === 0) return null; // Handle empty array edge case
  
  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

// ==========================================
// 3. countByCategory()
// ==========================================
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

// ==========================================
// 4. getSummary()
// ==========================================
function getSummary() {
  const counts = countByCategory();
  const totalNotes = notes.length;
  const noteWord = totalNotes === 1 ? "note" : "notes"; // Handle singular vs plural
  
  // Convert the counts object into an array of strings like "2 personal"
  const breakdown = Object.entries(counts)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");
    
  return `${totalNotes} ${noteWord}: ${breakdown}.`;
}

// ==========================================
// 5. isDuplicate(text)
// ==========================================
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanText);
}

// ==========================================
// 6. addNote(text, category)
// ==========================================
function addNote(text, category) {
  const cleanText = text.trim();
  
  // Check length (1-200 characters)
  if (cleanText.length < 1 || cleanText.length > 200) {
    console.log("❌ Rejected: Note must be 1-200 characters.");
    return false;
  }
  
  // Check for duplicates
  if (isDuplicate(cleanText)) {
    console.log("❌ Rejected: This note is a duplicate.");
    return false;
  }
  
  // Check category validity
  const validCategories = ["personal", "work", "study"];
  if (!validCategories.includes(category)) {
    console.log(`❌ Rejected: Invalid category. Must be one of: ${validCategories.join(", ")}.`);
    return false;
  }
  
  // If all checks pass, add the note
  notes.push({
    id: Date.now(), // Generate a unique ID based on current time
    text: cleanText,
    category: category,
  });
  console.log(`✅ Added: "${cleanText}"`);
  return true;
}


// ==========================================
// TESTING (Normal Case + Edge Case for each)
// ==========================================

// Keep a backup of the original notes to restore after edge cases that modify the array
const originalNotes = JSON.parse(JSON.stringify(notes)); 

console.log("--- Testing searchNotes ---");
console.log(searchNotes("assignment")); 
// Expected: [ { id: 2, text: 'Finish the Day 3 assignment', category: 'study' } ]

console.log(searchNotes("python")); 
// Expected: [] (Edge case: search with no results)


console.log("\n--- Testing longestNote ---");
console.log(longestNote()); 
// Expected: { id: 3, text: 'Email the project report to Grace', category: 'work' }

const tempNotes = notes;
notes = [];
console.log(longestNote()); 
// Expected: null (Edge case: empty array)
notes = tempNotes;


console.log("\n--- Testing countByCategory ---");
console.log(countByCategory()); 
// Expected: { personal: 2, study: 2, work: 1 }

notes = [];
console.log(countByCategory()); 
// Expected: {} (Edge case: empty array)
notes = tempNotes;


console.log("\n--- Testing getSummary ---");
console.log(getSummary()); 
// Expected: "5 notes: 2 personal, 2 study, 1 work." (order of categories may vary slightly)

notes = [{ id: 99, text: "Solo task", category: "work" }];
console.log(getSummary()); 
// Expected: "1 note: 1 work." (Edge case: exactly one note, tests singular "note")
notes = tempNotes;


console.log("\n--- Testing isDuplicate ---");
console.log(isDuplicate("  BUY milk AND bread  ")); 
// Expected: true (Edge case: ignores case and extra spaces)

console.log(isDuplicate("Buy a car")); 
// Expected: false (Normal case: not a duplicate)


console.log("\n--- Testing addNote ---");
console.log(addNote("Walk the dog", "personal")); 
// Expected: true (logs "✅ Added: 'Walk the dog'")

console.log(addNote("   ", "work")); 
// Expected: false (Edge case: empty/whitespace only, logs rejection reason)

console.log(addNote("Call mum", "personal")); 
// Expected: false (Edge case: duplicate, logs rejection reason)

console.log(addNote("Play FIFA", "gaming")); 
// Expected: false (Edge case: invalid category, logs rejection reason)