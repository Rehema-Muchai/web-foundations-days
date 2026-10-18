// 1. Select elements
const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// 2. State: store all fetched users here
let allUsers = [];

// 3. Render function
function renderUsers(usersToRender) {
  usersList.innerHTML = ""; // Clear current list

  if (usersToRender.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    li.style.color = "#666";
    li.style.fontStyle = "italic";
    usersList.appendChild(li);
    return;
  }

  usersToRender.forEach((user) => {
    const li = document.createElement("li");
    li.style.marginBottom = "16px";
    li.style.borderBottom = "1px solid #eee";
    li.style.paddingBottom = "8px";

    // Name
    const nameEl = document.createElement("strong");
    nameEl.textContent = user.name;
    li.appendChild(nameEl);
    li.appendChild(document.createElement("br"));

    // Email
    const emailEl = document.createElement("span");
    emailEl.textContent = `Email: ${user.email}`;
    li.appendChild(emailEl);
    li.appendChild(document.createElement("br"));

    // City
    const cityEl = document.createElement("span");
    cityEl.textContent = `City: ${user.address.city}`;
    li.appendChild(cityEl);
    li.appendChild(document.createElement("br"));

    // Company
    const companyEl = document.createElement("span");
    companyEl.textContent = `Company: ${user.company.name}`;
    li.appendChild(companyEl);

    usersList.appendChild(li);
  });
}

// 4. Fetch function
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;
  filterInput.disabled = true;
  usersList.innerHTML = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    allUsers = await response.json();
    renderUsers(allUsers);
    statusText.textContent = `Successfully loaded ${allUsers.length} users.`;
    filterInput.disabled = false; // Enable filter now that we have data
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error("Fetch error:", error);
  } finally {
    loadBtn.disabled = false; // Always re-enable the button
  }
}

// 5. Event Listeners
loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (event) => {
  const filterText = event.target.value.toLowerCase().trim();
  
  const filteredUsers = allUsers.filter((user) => 
    user.name.toLowerCase().includes(filterText)
  );
  
  renderUsers(filteredUsers);
});