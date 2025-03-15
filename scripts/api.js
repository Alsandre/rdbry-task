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
    return [];``
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
    console.error(error);
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
    const response = await fetch(`${API_URL}/employees`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error(`Error creating comment for task ${taskId}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
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
