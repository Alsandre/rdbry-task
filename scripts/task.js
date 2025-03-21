import { fetchSingleTask, fetchStatuses, updateTask, fetchComments, createComment } from "./api.js";
import { formatDueDate } from "./utils.js";
import { appState } from "./state.js";

let currentTaskId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Extract taskId from URL, e.g. ?id=123
  const params = new URLSearchParams(window.location.search);
  currentTaskId = params.get("id");
  if (!currentTaskId) {
    alert("No task id provided in URL.");
    return;
  }

  try {
    // Fetch task details, statuses, and comments concurrently
    const [task, statuses, comments] = await Promise.all([
      fetchSingleTask(currentTaskId),
      fetchStatuses(),
      fetchComments(currentTaskId),
    ]);
    renderTaskDetails(task, statuses);
    renderComments(comments);
    setupCommentHandlers();
    appState.setState({ comments });
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
  priorityPill.textContent = task.priority.name;
  pillsContainer.appendChild(priorityPill);
  // Department pill
  const deptPill = document.createElement("span");
  deptPill.className = "pill";
  deptPill.textContent = task.department.name;
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
  const dueDate = new Date(task.due_date);
  dueDateDisplay.textContent = formatDueDate(dueDate);
}

function renderComments(comments) {
  const container = document.querySelector(".comments-container");
  container.innerHTML = "";

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sortedComments.forEach((comment) => {
    console.log(comment);
    const commentElement = createCommentElement(comment);
    container.appendChild(commentElement);
  });
}

function createCommentElement(comment) {
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";
  commentDiv.dataset.commentId = comment.id;

  // Comment content
  const contentDiv = document.createElement("div");
  contentDiv.className = "comment-content";
  contentDiv.textContent = comment.text;

  // Comment meta (author and date)
  const metaDiv = document.createElement("div");
  metaDiv.className = "comment-meta";
  const authorSpan = document.createElement("span");
  authorSpan.textContent = comment.author_nickname;
  const authorAvatar = document.createElement("img");
  authorAvatar.alt = comment.author_nickname;
  authorAvatar.src = comment.author_avatar;
  authorAvatar.className = "author-avatar";
  metaDiv.appendChild(authorAvatar);
  metaDiv.appendChild(authorSpan);

  // Comment actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "comment-actions";

  // Only show reply button for top-level comments (parent_id is null)
  if (comment.parent_id === null) {
    const replyBtn = document.createElement("button");
    replyBtn.className = "reply-btn";
    replyBtn.textContent = "უპასუხე";
    replyBtn.addEventListener("click", () => toggleReplyArea(commentDiv));
    actionsDiv.appendChild(replyBtn);

    // Reply area (initially hidden)
    const replyArea = document.createElement("div");
    replyArea.className = "reply-area";
    replyArea.style.display = "none";
    const replyTextarea = document.createElement("textarea");
    replyTextarea.placeholder = "დაწერეთ პასუხი...";
    const submitReplyBtn = document.createElement("button");
    submitReplyBtn.className = "submit-btn";
    submitReplyBtn.textContent = "პასუხის გაგზავნა";
    submitReplyBtn.disabled = true;

    // Handle reply submission
    submitReplyBtn.addEventListener("click", async () => {
      const replyContent = replyTextarea.value.trim();
      if (!replyContent) return;

      try {
        const newReply = await createComment(currentTaskId, {
          text: replyContent,
          parent_id: comment.id,
        });
        if (newReply) {
          // Refresh comments
          const comments = await fetchComments(currentTaskId);
          renderComments(comments);
          toggleReplyArea(commentDiv); // Hide reply area
        }
      } catch (error) {
        console.error("Error creating reply:", error);
        alert("Failed to create reply.");
      }
    });

    // Handle reply textarea input
    replyTextarea.addEventListener("input", () => {
      submitReplyBtn.disabled = !replyTextarea.value.trim();
    });

    replyArea.appendChild(replyTextarea);
    replyArea.appendChild(submitReplyBtn);
    commentDiv.appendChild(replyArea);
  }

  // Replies list (if any)
  const repliesList = document.createElement("div");
  repliesList.className = "replies-list";
  if (comment.sub_comments && comment.sub_comments.length > 0) {
    comment.sub_comments.forEach((reply) => {
      const replyElement = createCommentElement(reply);
      repliesList.appendChild(replyElement);
    });
  }

  // Assemble comment
  commentDiv.appendChild(metaDiv);
  commentDiv.appendChild(contentDiv);
  commentDiv.appendChild(actionsDiv);
  commentDiv.appendChild(repliesList);

  return commentDiv;
}

function toggleReplyArea(commentDiv) {
  const replyArea = commentDiv.querySelector(".reply-area");
  replyArea.style.display = replyArea.style.display === "none" ? "block" : "none";
}

function setupCommentHandlers() {
  const newCommentInput = document.getElementById("newCommentInput");
  const submitCommentBtn = document.getElementById("submitComment");

  // Handle new comment submission
  submitCommentBtn.addEventListener("click", async () => {
    const commentContent = newCommentInput.value.trim();
    if (!commentContent) return;

    try {
      console.log(commentContent);
      const newComment = await createComment(currentTaskId, {
        text: commentContent,
        parent_id: null,
      });
      if (newComment) {
        // Refresh comments
        const comments = await fetchComments(currentTaskId);
        renderComments(comments);
        // Clear input
        newCommentInput.value = "";
        submitCommentBtn.disabled = true;
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to create comment.");
    }
  });

  // Handle new comment input
  newCommentInput.addEventListener("input", () => {
    submitCommentBtn.disabled = !newCommentInput.value.trim();
  });
}
