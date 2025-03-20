const API_URL = "https://momentum.redberryinternship.ge/api";
const token = "9e6ff624-9eaf-4164-a4f4-2f0b0b1d1704";

export async function fetchTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching tasks: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchSingleTask(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching task ${taskId}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchStatuses() {
  try {
    const response = await fetch(`${API_URL}/statuses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching statuses: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchPriorities() {
  try {
    const response = await fetch(`${API_URL}/priorities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching priorities: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchDepartments() {
  try {
    const response = await fetch(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching departments: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
    ``;
  }
}

export async function fetchEmployees() {
  try {
    const response = await fetch(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching employees: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchComments(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error fetching comments for task ${taskId}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function createTask(taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error(`Error creating task: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createEmployee(employeeData) {
  try {
    // Create FormData object and append the required fields
    const formData = new FormData();
    formData.append("name", employeeData.name);
    formData.append("surname", employeeData.surname);
    formData.append("department_id", employeeData.department_id);
    formData.append("avatar", employeeData.avatar); // avatar should be a File object

    const response = await fetch(`${API_URL}/employees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type when using FormData!
        Accept: "application/json",
      },
      body: formData,
    });
    if (!response.ok) throw new Error(`Error creating employee: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createComment(taskId, commentData) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      throw new Error("Failed to create comment");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function updateTask(taskId, statusId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statusId }),
    });
    if (!response.ok) throw new Error(`Error updating task ${taskId}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
