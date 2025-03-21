// header-component.js
class AppHeader extends HTMLElement {
  constructor() {
    super();
    // Create a shadow root for encapsulation
    this.attachShadow({ mode: "open" });
    this.render();
  }

  render() {
    // Template for header
    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 88%;
            margin: 0 auto;
            padding: 30px 0;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 1.5rem;
            font-weight: bold;
          }
          .actions button,
          .actions a {
            margin-left: 1rem;
            padding: 0.5rem 1rem;
            border: none;
            text-decoration: none;
            cursor: pointer;
            border-radius: 4px;
            background: none;
          }
          .actions a {
            background: #8338EC;
            color: #fff;
          }
          .actions button {
            border:1px solid #8338EC;
          }
          .actions button:hover,
          .actions a:hover {
            background: #0056b3;
          }
          .create-task-btn {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        </style>
        <header class="header">
          <div class="header-container">
            <a href="/index.html" class="logo"><img src="/assets/logo.png" width="210" alt="logo" /></a>
            <div class="actions">
              <button id="createEmployeeBtn">თანამშრომლის შექმნა</button>
                <a href="/create-task/create-task.html" class="create-task-btn"> <img src="/assets/white-plus.png" alt="white-plus" /> შექმენი ახალი დავალება</a>
            </div>
          </div>
        </header>
      `;
  }

  connectedCallback() {
    // Add event listener for the Create Employee button.
    const btn = this.shadowRoot.getElementById("createEmployeeBtn");
    btn.addEventListener("click", () => {
      // Dispatch a custom event to open the employee modal.
      // The modal component will listen for this event.
      document.dispatchEvent(new CustomEvent("open-employee-modal", { bubbles: true }));
    });
  }
}

customElements.define("app-header", AppHeader);
