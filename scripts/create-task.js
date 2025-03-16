import { fetchPriorities, fetchStatuses, fetchDepartments, fetchEmployees, createTask } from "./api.js";
import { storageService } from "./storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("new-task-form");
  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const prioritySelect = document.getElementById("taskPriority");
  const statusSelect = document.getElementById("taskStatus");
  const departmentSelect = document.getElementById("taskDepartment");
  const employeeSelect = document.getElementById("taskEmployee");
  const dueDateInput = document.getElementById("taskDueDate");

  // Set default due date to tomorrow
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dueDateInput.value = tomorrow.toISOString().split("T")[0];

  // Load persisted form data (if any)
  const persistedData = storageService.getTaskFormData();
  if (persistedData) {
    titleInput.value = persistedData.title || "";
    descriptionInput.value = persistedData.description || "";
    prioritySelect.value = persistedData.priority || "";
    statusSelect.value = persistedData.status || "";
    departmentSelect.value = persistedData.department || "";
    // Dispatch change event to repopulate employee dropdown
    departmentSelect.dispatchEvent(new Event("change"));
    employeeSelect.value = persistedData.employee || "";
    dueDateInput.value = persistedData.dueDate || tomorrow.toISOString().split("T")[0];
  }

  // Populate dropdowns with API data concurrently
  try {
    const [priorities, statuses, departments, employees] = await Promise.all([
      fetchPriorities(),
      fetchStatuses(),
      fetchDepartments(),
      fetchEmployees(),
    ]);

    // Populate priority dropdown
    priorities.forEach((priority) => {
      const option = document.createElement("option");
      option.value = priority.id;
      option.textContent = priority.name;
      prioritySelect.appendChild(option);
    });
    // Set default priority to "Medium" if available and not already set
    if (!prioritySelect.value) {
      const mediumOption = Array.from(prioritySelect.options).find((opt) => opt.textContent.toLowerCase() === "medium");
      if (mediumOption) prioritySelect.value = mediumOption.value;
    }

    // Populate status dropdown
    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status.id;
      option.textContent = status.name;
      statusSelect.appendChild(option);
    });

    // Populate department dropdown
    departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id;
      option.textContent = dept.name;
      departmentSelect.appendChild(option);
    });

    // Store employees globally for filtering
    window.allEmployees = employees;

    // Initially populate employee dropdown based on selected department
    updateEmployeeDropdown();
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
  }

  // Update employee dropdown based on selected department
  departmentSelect.addEventListener("change", updateEmployeeDropdown);

  function updateEmployeeDropdown() {
    const selectedDeptId = departmentSelect.value;
    // Clear current employee options except the "დაამატე თანამშრომელი" option
    employeeSelect.innerHTML = `<option value="add" id="addEmployeeOption">დაამატე თანამშრომელი</option>`;
    const filteredEmployees = window.allEmployees.filter((emp) => emp.departmentId === parseInt(selectedDeptId));
    filteredEmployees.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.id;
      option.textContent = `${emp.firstName} ${emp.lastName}`;
      employeeSelect.appendChild(option);
    });
  }

  // Save form data to local storage on input changes
  form.addEventListener("input", () => {
    const formData = {
      title: titleInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value,
      status: statusSelect.value,
      department: departmentSelect.value,
      employee: employeeSelect.value,
      dueDate: dueDateInput.value,
    };
    storageService.setTaskFormData(formData);
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Validate title and description length
    if (titleInput.value.trim().length < 3) {
      alert("Title must be at least 3 characters.");
      return;
    }
    if (descriptionInput.value.trim() && descriptionInput.value.trim().split(/\s+/).length < 4) {
      alert("If provided, description must contain at least 4 words.");
      return;
    }
    // Due date validation: cannot be in the past
    const today = new Date();
    const selectedDate = new Date(dueDateInput.value);
    if (selectedDate < new Date(today.toISOString().split("T")[0])) {
      alert("Due date cannot be in the past.");
      return;
    }
    // Build task data
    const taskData = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      priorityId: parseInt(prioritySelect.value),
      statusId: parseInt(statusSelect.value),
      departmentId: parseInt(departmentSelect.value),
      employeeId: parseInt(employeeSelect.value),
      dueDate: dueDateInput.value,
    };

    try {
      const createdTask = await createTask(taskData);
      if (createdTask) {
        alert("Task created successfully!");
        storageService.clearTaskFormData();
        window.location.href = "index.html";
      } else {
        alert("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("An error occurred while creating the task.");
    }
  });
  // Listen for "დაამატე თანამშრომელი" click in employee select
  employeeSelect.addEventListener("change", (e) => {
    if (employeeSelect.value === "add") {
      // Trigger modal in task context
      const modal = document.querySelector("employee-modal");
      modal.open("task");
      // Reset selection to previous valid value or blank
      employeeSelect.value = "";
    }
  });
  // Add a click listener to handle the case when "add" is already selected
  employeeSelect.addEventListener("click", () => {
    if (employeeSelect.value === "add") {
      const modal = document.querySelector("employee-modal");
      modal.open("task");
      // Optionally, reset selection
      employeeSelect.value = "";
    }
  });
  // Listen for employee-created event to update employee dropdown and pre-select the new employee if in task context
  document.addEventListener("employee-created", (e) => {
    const newEmployee = e.detail;
    // Update global list
    window.allEmployees.push(newEmployee);
    // If current department matches, add new employee to dropdown
    if (parseInt(departmentSelect.value) === parseInt(newEmployee.departmentId)) {
      const option = document.createElement("option");
      option.value = newEmployee.id;
      option.textContent = `${newEmployee.firstName} ${newEmployee.lastName}`;
      employeeSelect.appendChild(option);
      // If modal was opened from task context, auto-select the new employee
      const modal = document.querySelector("employee-modal");
      if (modal._context === "task") {
        employeeSelect.value = newEmployee.id;
      }
    }
  });
});
