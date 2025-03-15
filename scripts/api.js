const API_URL = "https://api.example.com";
const token = localStorage.getItem("authToken");

export async function fetchTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok ? await response.json() : [];
}

export async function createTask(taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  return response.ok ? await response.json() : null;
}
