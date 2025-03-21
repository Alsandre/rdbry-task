export function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.style.cursor = "pointer";
  card.style.border = `1px solid ${getStatusColor(task.status.name)}`;

  // On click, redirect to task preview page with task ID in URL
  card.addEventListener("click", () => {
    window.location.href = `/task/task.html?id=${task.id}`;
  });

  // --- Row 1: Priority, Department, Due Date ---
  const row1 = document.createElement("div");
  row1.className = "card-row row1";

  const row1Left = document.createElement("div");
  row1Left.className = "row1-left";
  // Priority pill
  const priorityPill = document.createElement("div");
  priorityPill.className = "priority-pill";
  const priorityImg = document.createElement("img");
  priorityImg.src = task.priority.icon;
  priorityImg.alt = task.priority.name;
  priorityPill.appendChild(priorityImg);
  const priorityName = document.createElement("span");
  priorityName.textContent = task.priority.name;
  priorityPill.appendChild(priorityName);
  priorityPill.style.border = `1px solid ${getPriorityColor(task.priority.name)}`;
  priorityPill.style.color = getPriorityColor(task.priority.name);
  // Department label (as a pill)
  const deptPill = document.createElement("span");
  deptPill.className = "department-pill";
  deptPill.textContent = task.department.name; // assuming string
  row1Left.appendChild(priorityPill);
  row1Left.appendChild(deptPill);

  const row1Right = document.createElement("div");
  row1Right.className = "row1-right";
  const dueDate = new Date(task.due_date);
  row1Right.textContent = formatDueDateCard(dueDate);

  row1.appendChild(row1Left);
  row1.appendChild(row1Right);

  // --- Row 2: Title and Description ---
  const row2 = document.createElement("div");
  row2.className = "card-row row2";
  const titleEl = document.createElement("h3");
  titleEl.className = "task-title";
  titleEl.textContent = task.name;
  const descEl = document.createElement("p");
  descEl.className = "task-description";
  // Shorten description if needed
  descEl.textContent = task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description;
  row2.appendChild(titleEl);
  row2.appendChild(descEl);

  // --- Row 3: Assignee Avatar and Comments Count ---
  const row3 = document.createElement("div");
  row3.className = "card-row row3";

  const row3Left = document.createElement("div");
  row3Left.className = "row3-left";
  if (task.employee) {
    const avatarImg = document.createElement("img");
    avatarImg.className = "assignee-avatar";
    avatarImg.src = task.employee.avatar;
    avatarImg.alt = `${task.employee.firstName} ${task.employee.lastName}`;
    row3Left.appendChild(avatarImg);
  }

  const row3Right = document.createElement("div");
  row3Right.className = "row3-right";
  // Assume task.commentsCount holds the number of comments
  const commentsCount = task.commentsCount !== undefined ? task.commentsCount : 0;
  const commentIcon = document.createElement("img");
  commentIcon.src = "./assets/comment-icon.png";
  commentIcon.alt = "comment";
  row3Right.appendChild(commentIcon);
  const commentCount = document.createElement("span");
  commentCount.textContent = commentsCount;
  row3Right.appendChild(commentCount);

  row3.appendChild(row3Left);
  row3.appendChild(row3Right);

  // Append rows to card
  card.appendChild(row1);
  card.appendChild(row2);
  card.appendChild(row3);

  return card;
}

export function formatDueDate(date) {
  // Format: "Monday - dd/mm/yyyy"
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${weekday} - ${dd}/${mm}/${yyyy}`;
}
export function formatDueDateCard(date) {
  // Georgian abbreviated months
  const georgianMonths = ["იანვ", "თებ", "მარტ", "აპრ", "მაის", "ივნ", "ივლ", "აგვ", "სექტ", "ოქტ", "ნოე", "დეკ"];

  const day = date.getDate();
  const monthAbbrev = georgianMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${monthAbbrev}, ${year}`;
}

export function getStatusColor(status) {
  switch (status) {
    case "დასაწყები":
      return "#F7BC30";
    case "პროგრესში":
      return "#FB5607";
    case "მზად ტესტირებისთვის":
      return "#FF006E";
    case "დასრულებული":
      return "#3A86FF";
    default:
      return "#8338EC";
  }
}
export function getPriorityColor(priority) {
  switch (priority) {
    case "მაღალი":
      return "#FA4D4D";
    case "დაბალი":
      return "#08A508";
    case "საშუალო":
      return "#FFBE0B";
    default:
      return "#8338EC";
  }
}
