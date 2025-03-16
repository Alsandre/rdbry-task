import { fetchStatuses, fetchDepartments, fetchEmployees, fetchPriorities, fetchTasks } from "./api.js";
import { storageService } from "./storage.js";
import { createTaskCard } from "./utils.js";

let currentFilters = storageService.getFilters() || {
  department: [], // multi-select: array of department IDs
  priority: [], // multi-select: array of priority IDs
  employee: null, // single-select: employee ID (or null)
};

let allDepartments = [];
let allPriorities = [];
let allEmployees = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [statuses, tasks] = await Promise.all([fetchStatuses(), fetchTasks()]);
    renderDashboard(statuses, applyFilters(tasks));

    const [departments, priorities, employees] = await Promise.all([fetchDepartments(), fetchPriorities(), fetchEmployees()]);
    allDepartments = departments;
    allPriorities = priorities;
    allEmployees = employees;

    // Render filter pills from currentFilters
    updateFilterPills();

    // Attach click listeners to filter containers to open dropdowns
    document.getElementById("departmentFilterContainer").addEventListener("click", () => {
      openFilterDropdown("department");
    });
    document.getElementById("priorityFilterContainer").addEventListener("click", () => {
      openFilterDropdown("priority");
    });
    document.getElementById("employeeFilterContainer").addEventListener("click", () => {
      openFilterDropdown("employee");
    });

    // If there are persisted filters, reapply them (and re-render tasks)
    if (currentFilters) {
      renderDashboard(statuses, applyFilters(tasks));
    }
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
});

function renderDashboard(statuses, tasks) {
  const container = document.querySelector(".task-columns");
  container.innerHTML = ""; // Clear any pre-existing content

  // Set container styles to support horizontal scrolling when many columns exist
  container.style.display = "flex";
  container.style.overflowX = "auto";
  container.style.gap = "1rem";
  container.style.padding = "1rem";

  statuses.forEach((status) => {
    // Create a column element for each status
    const column = document.createElement("div");
    column.className = "task-column";
    column.dataset.statusId = status.id; // Ensure your status objects have an 'id'

    // Create and add the column header (status name)
    const header = document.createElement("h2");
    header.textContent = status.name; // Ensure your status objects have a 'name'
    header.style.textAlign = "center";
    column.appendChild(header);

    // Filter tasks that belong to the current status
    const tasksForStatus = tasks.filter((task) => task.statusId === status.id);

    tasksForStatus.forEach((task) => {
      const card = createTaskCard(task);
      column.appendChild(card);
    });

    container.appendChild(column);
  });
}

function setupFilters(tasks) {
  console.log(storageService.getFilters());
  const { department, priority, employee } = storageService.getFilters() || {};
  document.getElementById("departmentFilter").value = department || "";
  document.getElementById("priorityFilter").value = priority || "";
  document.getElementById("employeeFilter").value = employee || "";

  document.querySelectorAll(".filters select").forEach((select) => {
    select.addEventListener("change", () => {
      saveFilters({
        department: document.getElementById("departmentFilter").value,
        priority: document.getElementById("priorityFilter").value,
        employee: document.getElementById("employeeFilter").value,
      });
      renderTasks(filterTasks(tasks));
    });
  });
}

function filterTasks(tasks) {
  const department = document.getElementById("departmentFilter").value;
  const priority = document.getElementById("priorityFilter").value;
  const employee = document.getElementById("employeeFilter").value;

  return tasks.filter(
    (task) =>
      (!department || task.department === department) &&
      (!priority || task.priority === priority) &&
      (!employee || task.employee.name === employee)
  );
}

function openFilterDropdown(filterType) {
  // Remove any existing dropdown from previous clicks
  const existingDropdown = document.querySelector(".filter-dropdown");
  if (existingDropdown) existingDropdown.remove();

  // Determine which filter container to attach to
  const container = document.getElementById(filterType + "FilterContainer");
  // Create dropdown container
  const dropdown = document.createElement("div");
  dropdown.className = "filter-dropdown";
  // Set fixed dimensions
  dropdown.style.width = container.offsetWidth + "px";
  dropdown.style.height = "250px";
  dropdown.style.overflowY = "auto";
  dropdown.style.position = "absolute";
  dropdown.style.background = "#fff";
  dropdown.style.border = "1px solid #ccc";
  dropdown.style.zIndex = "100";
  dropdown.style.padding = "0.5rem";

  // Populate dropdown with options based on filterType
  let options = [];
  if (filterType === "department") {
    options = allDepartments;
  } else if (filterType === "priority") {
    options = allPriorities;
  } else if (filterType === "employee") {
    options = allEmployees;
  }

  // Create a list element
  const list = document.createElement("ul");
  list.style.listStyle = "none";
  list.style.padding = "0";
  list.style.margin = "0";

  options.forEach((option) => {
    const li = document.createElement("li");
    li.style.marginBottom = "0.5rem";
    // For multi-select, use checkboxes; for employee, use radio buttons.
    const input = document.createElement("input");
    input.type = filterType === "employee" ? "radio" : "checkbox";
    input.name = filterType + "FilterOption";
    input.value = option.id;

    // Pre-check if already selected in currentFilters
    if (filterType === "employee") {
      if (currentFilters.employee == option.id) {
        input.checked = true;
      }
    } else {
      if (currentFilters[filterType].includes(option.id)) {
        input.checked = true;
      }
    }

    const label = document.createElement("label");
    label.textContent = option.name;
    label.style.marginLeft = "0.5rem";
    li.appendChild(input);
    li.appendChild(label);
    list.appendChild(li);
  });

  dropdown.appendChild(list);

  // Add "არჩევა" (Apply) button
  const applyBtn = document.createElement("button");
  applyBtn.textContent = "არჩევა";
  applyBtn.style.float = "right";
  applyBtn.style.marginTop = "0.5rem";
  applyBtn.addEventListener("click", () => {
    // Read selections and update currentFilters
    if (filterType === "employee") {
      const selected = dropdown.querySelector("input[name='" + filterType + "FilterOption']:checked");
      currentFilters.employee = selected ? parseInt(selected.value) : null;
    } else {
      const selectedOptions = Array.from(dropdown.querySelectorAll("input[name='" + filterType + "FilterOption']:checked")).map(
        (input) => parseInt(input.value)
      );
      currentFilters[filterType] = selectedOptions;
    }
    // Persist filters
    storageService.setFilters(currentFilters);
    // Update filter pills UI
    updateFilterPills();
    // Remove dropdown from view
    dropdown.remove();

    // Re-filter tasks and re-render dashboard
    // Assume tasks and statuses are globally available or re-fetch tasks if needed.
    // For simplicity, re-fetch tasks and statuses here:
    Promise.all([fetchStatuses(), fetchTasks()]).then(([statuses, tasks]) => {
      renderDashboard(statuses, applyFilters(tasks));
    });
  });
  dropdown.appendChild(applyBtn);

  // Position dropdown relative to the container
  const rect = container.getBoundingClientRect();
  dropdown.style.top = rect.bottom + window.scrollY + "px";
  dropdown.style.left = rect.left + window.scrollX + "px";

  // Append dropdown to body
  document.body.appendChild(dropdown);

  // Listener for clicks outside the dropdown
  function outsideClickListener(event) {
    if (!dropdown.contains(event.target)) {
      dropdown.remove();
      document.removeEventListener("click", outsideClickListener);
    }
  }
  // Add the listener after a short delay to avoid immediate removal due to current click.
  setTimeout(() => {
    document.addEventListener("click", outsideClickListener);
  }, 0);
}
function updateFilterPills() {
  const pillsContainer = document.querySelector(".filter-pills");
  pillsContainer.innerHTML = ""; // clear existing pills

  let hasFilters = false;
  // For each filter type, if selections exist, create a pill for each selection.
  // For multi-select filters:
  ["department", "priority"].forEach((filterType) => {
    currentFilters[filterType].forEach((id) => {
      const option = getOptionById(filterType, id);
      if (option) {
        const pill = createPill(filterType, id, option.name);
        pillsContainer.appendChild(pill);
        hasFilters = true;
      }
    });
  });
  // For employee filter (single select)
  if (currentFilters.employee) {
    const option = getOptionById("employee", currentFilters.employee);
    if (option) {
      const pill = createPill("employee", currentFilters.employee, option.name);
      pillsContainer.appendChild(pill);
      hasFilters = true;
    }
  }

  if (hasFilters) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "გასუფთავება";
    clearBtn.className = "clear-filters-btn";
    clearBtn.style.marginLeft = "auto"; // Adjust style to position it at the end
    clearBtn.addEventListener("click", () => {
      // Clear filter values
      currentFilters = { department: [], priority: [], employee: null };
      storageService.clearFilters();
      updateFilterPills();
      // Re-fetch tasks and statuses (or use cached ones) to re-render the dashboard without filters
      Promise.all([fetchStatuses(), fetchTasks()]).then(([statuses, tasks]) => {
        renderDashboard(statuses, applyFilters(tasks));
      });
    });
    pillsContainer.appendChild(clearBtn);
  }
}
function getOptionById(filterType, id) {
  let list = [];
  if (filterType === "department") list = allDepartments;
  if (filterType === "priority") list = allPriorities;
  if (filterType === "employee") list = allEmployees;
  return list.find((opt) => opt.id === id);
}
function createPill(filterType, id, text) {
  const pill = document.createElement("div");
  pill.className = "filter-pill";
  pill.textContent = text;
  // Add an "x" icon/button to remove the filter
  const removeBtn = document.createElement("span");
  removeBtn.textContent = "×";
  removeBtn.className = "pill-remove";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.marginLeft = "0.5rem";
  removeBtn.addEventListener("click", () => {
    removeFilter(filterType, id);
  });
  pill.appendChild(removeBtn);
  return pill;
}
function removeFilter(filterType, id) {
  if (filterType === "employee") {
    currentFilters.employee = null;
  } else {
    currentFilters[filterType] = currentFilters[filterType].filter((item) => item !== id);
  }
  storageService.setFilters(currentFilters);
  updateFilterPills();
  // Re-fetch tasks and re-render dashboard
  Promise.all([fetchStatuses(), fetchTasks()]).then(([statuses, tasks]) => {
    renderDashboard(statuses, applyFilters(tasks));
  });
}
function applyFilters(tasks) {
  return tasks.filter((task) => {
    // Check department: if filter is active, task.departmentId should match one of them.
    if (currentFilters.department.length > 0 && !currentFilters.department.includes(task.departmentId)) {
      return false;
    }
    // Check priority: similarly, task.priorityId should be in currentFilters.priority.
    if (currentFilters.priority.length > 0 && !currentFilters.priority.includes(task.priorityId)) {
      return false;
    }
    // Check employee: if set, task.employeeId must equal it.
    if (currentFilters.employee && task.employeeId !== currentFilters.employee) {
      return false;
    }
    return true;
  });
}
