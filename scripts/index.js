import { fetchTasks } from "./api.js";
import { saveFilters, loadFilters } from "./state.js";

document.addEventListener("DOMContentLoaded", async () => {
  const tasks = await fetchTasks();
  renderTasks(tasks);
  setupFilters(tasks);
});

function renderTasks(tasks) {
  document.querySelectorAll(".column").forEach((col) => (col.innerHTML = ""));
  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description.substring(0, 100)}...</p>
            <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
            <span>${task.department}</span>
            <img src="${task.employee.avatar}" class="avatar">
        `;
    document.getElementById(task.status.toLowerCase().replace(/\s+/g, "-")).appendChild(taskCard);
  });
}

function setupFilters(tasks) {
  const { department, priority, employee } = loadFilters();
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
