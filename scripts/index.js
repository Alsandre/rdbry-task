document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch statuses and tasks concurrently
    const [statuses, tasks] = await Promise.all([fetchStatuses(), fetchTasks()]);

    // Render the dynamic dashboard
    renderDashboard(statuses, tasks);
    // setupFilters(tasks);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    // You could also display an error message in the UI here.
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
      // Create task card element
      const taskCard = document.createElement("div");
      taskCard.className = "task-card";

      // Build card inner HTML. Adjust property names if needed.
      taskCard.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description.substring(0, 100)}${task.description.length > 100 ? "..." : ""}</p>
        <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
        <span>${task.department}</span>
        <img src="${task.employee.avatar}" alt="${task.employee.name}" class="avatar">
      `;
      column.appendChild(taskCard);
    });

    container.appendChild(column);
  });
}

function setupFilters(tasks) {
  console.log(storageService.getFilters())
  const { department, priority, employee } = storageService.getFilters();
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
