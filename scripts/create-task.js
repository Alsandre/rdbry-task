import { fetchPriorities, fetchStatuses, fetchDepartments, fetchEmployees, createTask } from "./api.js";
import { storageService } from "./storage.js";

let currentEmployee = null;

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("new-task-form");
  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const prioritySelect = document.getElementById("taskPriority");
  const statusSelect = document.getElementById("taskStatus");
  const departmentSelect = document.getElementById("taskDepartment");
  // const employeeSelect = document.getElementById("taskEmployee");
  const customSelect = document.getElementById("customEmployeeSelect");
  const employeeInput = document.getElementById("employeeInput");
  const dropdown = document.getElementById("employeeDropdown");
  const optionsContainer = dropdown.querySelector(".options-container");

  const dueDateInput = document.getElementById("taskDueDate");

  // Load persisted form data (if any)
  const persistedData = storageService.getTaskFormData();
  if (persistedData) {
    titleInput.value = persistedData.title || "";
    descriptionInput.value = persistedData.description || "";
    dueDateInput.value = persistedData.dueDate || "";
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
    renderEmployeeOptions();
    // Now, if persisted data exists, reapply it
    if (persistedData) {
      if (persistedData.priority) {
        prioritySelect.value = persistedData.priority;
      }
      if (persistedData.status) {
        statusSelect.value = persistedData.status;
      }
      if (persistedData.department) {
        departmentSelect.value = persistedData.department;
        // Trigger change event to update employee options
        departmentSelect.dispatchEvent(new Event("change"));
      }
      if (persistedData.employee) {
        // Here, persistedData.employee should ideally be an object with id
        employeeInput.value = persistedData.employee.id;
        selectEmployee(persistedData.employee);
      }
    }
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
  }

  // Update employee dropdown based on selected department
  departmentSelect.addEventListener("change", () => {
    // Clear current employee selection
    currentEmployee = null;
    employeeInput.value = "";
    const selectedValue = customSelect.querySelector(".selected-value");
    selectedValue.innerHTML = '<span class="placeholder">აირჩიე თანამშრომელი</span>';

    // Enable/disable employee selection based on department selection
    if (departmentSelect.value) {
      customSelect.classList.remove("disabled");
      renderEmployeeOptions();
    } else {
      customSelect.classList.add("disabled");
      optionsContainer.innerHTML = "";
    }
  });

  // Function to render employee options in dropdown
  function renderEmployeeOptions() {
    optionsContainer.innerHTML = "";

    // Get selected department ID
    const selectedDepartmentId = parseInt(departmentSelect.value);

    // Filter employees by department
    const departmentEmployees = window.allEmployees.filter((emp) => emp.department.id === selectedDepartmentId);

    // If no employees for selected department, show only "Add New" option
    if (departmentEmployees.length === 0) {
      const addNewOption = document.createElement("div");
      addNewOption.className = "dropdown-option add-new";
      addNewOption.textContent = "+ დაამატე ახალი თანამშრომელი";
      optionsContainer.appendChild(addNewOption);
      return;
    }

    // Render filtered employees
    departmentEmployees.forEach((emp) => {
      const option = document.createElement("div");
      option.className = "dropdown-option";
      // Create avatar element
      const avatar = document.createElement("img");
      avatar.className = "option-avatar";
      avatar.src = emp.avatar;
      avatar.alt = emp.name + " " + emp.surname;
      // Create text element
      const text = document.createElement("span");
      text.textContent = `${emp.name} ${emp.surname}`;
      option.appendChild(avatar);
      option.appendChild(text);
      // On click, select this employee
      option.addEventListener("click", () => {
        selectEmployee(emp);
      });
      optionsContainer.appendChild(option);
    });
  }

  // Function to select an employee
  function selectEmployee(emp) {
    if (!emp) return;
    currentEmployee = emp;
    // Update hidden input with employee id
    employeeInput.value = emp.id;
    form.dispatchEvent(new Event("input"));
    // Update collapsed view: show avatar and name
    const selectedValue = customSelect.querySelector(".selected-value");
    selectedValue.innerHTML = ""; // Clear previous content
    const avatar = document.createElement("img");
    avatar.src = emp.avatar;
    avatar.alt = emp.name + " " + emp.surname;
    const nameSpan = document.createElement("span");
    nameSpan.textContent = `${emp.name} ${emp.surname}`;
    selectedValue.appendChild(avatar);
    selectedValue.appendChild(nameSpan);

    closeDropdown();
  }

  // Function to open dropdown
  function openDropdown() {
    // Don't open if no department is selected
    if (!departmentSelect.value) {
      return;
    }
    renderEmployeeOptions();
    dropdown.hidden = false;
    customSelect.classList.add("expanded");
    // Add outside click listener
    setTimeout(() => {
      document.addEventListener("click", outsideClickListener);
    }, 0);
  }

  // Function to close dropdown
  function closeDropdown() {
    dropdown.hidden = true;
    customSelect.classList.remove("expanded");
    document.removeEventListener("click", outsideClickListener);
  }

  // Outside click listener
  function outsideClickListener(event) {
    if (!customSelect.contains(event.target) && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  }

  // Toggle dropdown on click of the custom select
  customSelect.addEventListener("click", (e) => {
    // Prevent event from bubbling to document and closing it immediately
    e.stopPropagation();
    // If already expanded, collapse it; otherwise, open it.
    if (dropdown.hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  // Instead of pre-creating, we can add the event when rendering:
  dropdown.addEventListener("click", (e) => {
    // Check if clicked element (or its parent) has class "add-new"
    let el = e.target;
    while (el && el !== dropdown) {
      if (el.classList.contains("add-new")) {
        // Trigger employee modal in task context
        const modal = document.querySelector("employee-modal");
        modal.open("task");
        closeDropdown();
        return;
      }
      el = el.parentElement;
    }
  });
  // Save form data to local storage on input changes
  form.addEventListener("input", () => {
    const formData = {
      title: titleInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value,
      status: statusSelect.value,
      department: departmentSelect.value,
      employee: currentEmployee,
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
      name: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      priority_id: parseInt(prioritySelect.value),
      status_id: parseInt(statusSelect.value),
      employee_id: parseInt(document.getElementById("employeeInput").value),
      due_date: dueDateInput.value,
    };

    try {
      const createdTask = await createTask(taskData);
      if (createdTask) {
        storageService.clearTaskFormData();
        window.location.href = "/index.html";
      } else {
        console.log("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  });
  // Listen for "დაამატე თანამშრომელი" click in employee select
  // employeeSelect.addEventListener("change", (e) => {
  //   if (employeeSelect.value === "add") {
  //     // Trigger modal in task context
  //     const modal = document.querySelector("employee-modal");
  //     modal.open("task");
  //     // Reset selection to previous valid value or blank
  //     employeeSelect.value = "";
  //   }
  // });
  // Add a click listener to handle the case when "add" is already selected
  // employeeSelect.addEventListener("click", () => {
  //   if (employeeSelect.value === "add") {
  //     const modal = document.querySelector("employee-modal");
  //     modal.open("task");
  //     // Optionally, reset selection
  //     employeeSelect.value = "";
  //   }
  // });
  // Listen for employee-created event to update employee dropdown and pre-select the new employee if in task context
  document.addEventListener("employee-created", (e) => {
    const newEmployee = e.detail;
    // Update global list
    window.allEmployees.push(newEmployee);
    // If current department matches, add new employee to dropdown
    if (parseInt(departmentSelect.value) === parseInt(newEmployee.departmentId)) {
      selectEmployee(newEmployee);
    }
  });
});
