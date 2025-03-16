import { fetchSingleTask, fetchStatuses, updateTask } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Extract taskId from URL, e.g. ?id=123
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("id");
  if (!taskId) {
    alert("No task id provided in URL.");
    return;
  }

  try {
    // Fetch task details and statuses concurrently
    const [task, statuses] = await Promise.all([fetchSingleTask(taskId), fetchStatuses()]);
    renderTaskDetails(task, statuses);
  } catch (error) {
    console.error("Error loading task details:", error);
    alert("Failed to load task details.");
  }
});

function renderTaskDetails(task, statuses) {
  // Render task title and description
  document.getElementById("taskTitle").textContent = task.title;
  document.getElementById("taskDescription").textContent = task.description;

  // Render pills (Row 1) for priority and department
  const pillsContainer = document.querySelector(".task-pills");
  pillsContainer.innerHTML = "";
  // Priority pill
  const priorityPill = document.createElement("span");
  priorityPill.className = "pill";
  priorityPill.textContent = task.priority; // assuming task.priority is a string
  pillsContainer.appendChild(priorityPill);
  // Department pill
  const deptPill = document.createElement("span");
  deptPill.className = "pill";
  deptPill.textContent = task.department; // assuming task.department is a string
  pillsContainer.appendChild(deptPill);

  // Populate the status select (Row 4, first info row)
  const statusSelect = document.getElementById("taskStatusSelect");
  statusSelect.innerHTML = "";
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status.id;
    option.textContent = status.name;
    if (status.id === task.statusId) {
      option.selected = true;
    }
    statusSelect.appendChild(option);
  });

  // Listen for status changes to update task status via API
  statusSelect.addEventListener("change", async () => {
    const newStatusId = parseInt(statusSelect.value);
    try {
      const updatedTask = await updateTask(task.id, newStatusId);
      if (updatedTask) {
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update status.");
    }
  });

  // Render employee card (Row 4, second info row)
  const employeeCard = document.getElementById("employeeCard");
  employeeCard.innerHTML = "";
  if (task.employee) {
    const avatar = document.createElement("img");
    avatar.src = task.employee.avatar;
    avatar.alt = task.employee.firstName + " " + task.employee.lastName;
    avatar.className = "employee-avatar";
    const empInfo = document.createElement("div");
    empInfo.className = "employee-info";
    const deptDiv = document.createElement("div");
    deptDiv.textContent = task.employee.department;
    const nameDiv = document.createElement("div");
    nameDiv.textContent = task.employee.firstName + " " + task.employee.lastName;
    empInfo.appendChild(deptDiv);
    empInfo.appendChild(nameDiv);
    employeeCard.appendChild(avatar);
    employeeCard.appendChild(empInfo);
  } else {
    employeeCard.textContent = "No employee assigned.";
  }

  // Render formatted due date (Row 4, third info row)
  const dueDateDisplay = document.getElementById("dueDateDisplay");
  const dueDate = new Date(task.dueDate);
  dueDateDisplay.textContent = formatDueDate(dueDate);
}

function formatDueDate(date) {
  // Format: "Monday - dd/mm/yyyy"
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${weekday} - ${dd}/${mm}/${yyyy}`;
}
