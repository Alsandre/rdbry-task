// employee-modal.js
import { fetchDepartments, createEmployee } from "../scripts/api.js";

class EmployeeModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._context = this.getAttribute("data-context") || "nav"; // default context is nav
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        :host(.open) {
          display: flex;
        }
        .backdrop {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .modal {
          position: relative;
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          z-index: 1001;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        h2 {
          margin-top: 0;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.3rem;
        }
        .form-group input[type="text"],
        .form-group input[type="file"],
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          box-sizing: border-box;
        }
        .hint {
          font-size: 0.8rem;
          color: #666;
        }
        .error-message {
          font-size: 0.8rem;
          color: red;
        }
        /* Avatar preview */
        .avatar-preview {
          margin-top: 0.5rem;
          position: relative;
          width: 100px;
          height: 100px;
        }
        .avatar-preview img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 50%;
          border: 1px solid #ccc;
        }
        .avatar-preview button {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #e74c3c;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .actions {
          text-align: right;
        }
        .actions button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          background: #007bff;
          color: #fff;
          cursor: pointer;
          border-radius: 4px;
        }
        .actions button:hover {
          background: #0056b3;
        }
      </style>
      <div class="backdrop"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <h2 id="modalTitle">თანამშრომლის შექმნა</h2>
        <form id="employeeForm" novalidate>
          <!-- First Name -->
          <div class="form-group">
            <label for="firstName">სახელი <span>*</span></label>
            <input type="text" id="firstName" name="firstName" required minlength="2" maxlength="255" pattern="^[A-Za-z\u10A0-\u10FF]+$" />
            <div class="hint">მინიმუმ 2 სიმბოლო, მაქსიმუმ 255 სიმბოლო</div>
            <div class="error-message" id="firstNameError"></div>
          </div>
          <!-- Last Name -->
          <div class="form-group">
            <label for="lastName">გვარი <span>*</span></label>
            <input type="text" id="lastName" name="lastName" required minlength="2" maxlength="255" pattern="^[A-Za-z\u10A0-\u10FF]+$" />
            <div class="hint">მინიმუმ 2 სიმბოლო, მაქსიმუმ 255 სიმბოლო</div>
            <div class="error-message" id="lastNameError"></div>
          </div>
          <!-- Avatar Upload -->
          <div class="form-group">
            <label for="avatar">Avatar <span>*</span></label>
            <input type="file" id="avatar" name="avatar" accept="image/*" required />
            <div class="avatar-preview" id="avatarPreviewContainer" hidden>
              <img id="avatarPreview" alt="Avatar Preview" />
              <button type="button" id="removeAvatar" title="Remove">×</button>
            </div>
            <div class="error-message" id="avatarError"></div>
          </div>
          <!-- Department -->
          <div class="form-group">
            <label for="department">განყოფილება <span>*</span></label>
            <select id="department" name="department" required>
              <option value="" disabled selected>აირჩიეთ განყოფილება</option>
            </select>
            <div class="error-message" id="departmentError"></div>
          </div>
          <div class="actions">
            <button type="button" id="cancelBtn">გაუქმება</button>
            <button type="submit" id="submitBtn">შექმნა</button>
          </div>
        </form>
      </div>
    `;
  }

  connectedCallback() {
    // Event listeners for backdrop click and Escape key
    this.shadowRoot.querySelector(".backdrop").addEventListener("click", () => this.close());
    document.addEventListener("keydown", this._handleEscape.bind(this));

    // Form and input elements
    this.form = this.shadowRoot.getElementById("employeeForm");
    this.firstNameInput = this.shadowRoot.getElementById("firstName");
    this.lastNameInput = this.shadowRoot.getElementById("lastName");
    this.avatarInput = this.shadowRoot.getElementById("avatar");
    this.avatarPreviewContainer = this.shadowRoot.getElementById("avatarPreviewContainer");
    this.avatarPreviewImg = this.shadowRoot.getElementById("avatarPreview");
    this.removeAvatarBtn = this.shadowRoot.getElementById("removeAvatar");
    this.departmentSelect = this.shadowRoot.getElementById("department");

    // Error elements
    this.firstNameError = this.shadowRoot.getElementById("firstNameError");
    this.lastNameError = this.shadowRoot.getElementById("lastNameError");
    this.avatarError = this.shadowRoot.getElementById("avatarError");
    this.departmentError = this.shadowRoot.getElementById("departmentError");

    // Buttons
    this.shadowRoot.getElementById("cancelBtn").addEventListener("click", () => this.close());
    this.form.addEventListener("submit", (e) => this._handleSubmit(e));
    this.avatarInput.addEventListener("change", (e) => this._handleAvatarChange(e));
    this.removeAvatarBtn.addEventListener("click", () => this._removeAvatar());

    // Real-time validation for name fields
    this.firstNameInput.addEventListener("input", () => this._validateName(this.firstNameInput, this.firstNameError));
    this.lastNameInput.addEventListener("input", () => this._validateName(this.lastNameInput, this.lastNameError));

    // Load departments when modal opens
    this._loadDepartments();

    // Listen for the global event
    document.addEventListener("open-employee-modal", (e) => {
      // You can optionally pass context data via e.detail
      this.open(e.detail && e.detail.context ? e.detail.context : "nav");
    });
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._handleEscape);
  }

  // Public method to open the modal
  open(context = "nav") {
    this._context = context; // Set context: 'nav' or 'task'
    this.classList.add("open");
    // Reset form and clear previous errors
    this.form.reset();
    this._clearErrors();
    this.avatarPreviewContainer.hidden = true;
    // Focus on first field
    this.firstNameInput.focus();
  }

  // Public method to close the modal
  close() {
    this.classList.remove("open");
  }

  _handleEscape(e) {
    if (e.key === "Escape" && this.classList.contains("open")) {
      this.close();
    }
  }

  _validateName(input, errorElem) {
    const value = input.value.trim();
    let errorMsg = "";
    if (value.length < 2) {
      errorMsg = "მინიმუმ 2 სიმბოლო";
    } else if (value.length > 255) {
      errorMsg = "მაქსიმუმ 255 სიმბოლო";
    } else if (!/^[A-Za-z\u10A0-\u10FF]+$/.test(value)) {
      errorMsg = "გთხოვთ გამოიყენოთ მხოლოდ ასოები";
    }
    errorElem.textContent = errorMsg;
    input.setCustomValidity(errorMsg);
  }

  _handleAvatarChange(e) {
    const file = this.avatarInput.files[0];
    this.avatarError.textContent = "";
    if (file) {
      if (!file.type.startsWith("image/")) {
        this.avatarError.textContent = "მხოლოდ სურათის ფორმატი";
        this.avatarInput.setCustomValidity("Invalid file type");
        return;
      }
      if (file.size > 600 * 1024) {
        this.avatarError.textContent = "ფაილი უნდა იყოს 600KB-ზე ნაკლები";
        this.avatarInput.setCustomValidity("File too large");
        return;
      }
      // If valid, show preview
      this.avatarInput.setCustomValidity("");
      const imgUrl = URL.createObjectURL(file);
      this.avatarPreviewImg.src = imgUrl;
      this.avatarPreviewContainer.hidden = false;
    } else {
      this.avatarPreviewContainer.hidden = true;
    }
  }

  _removeAvatar() {
    this.avatarInput.value = "";
    this.avatarPreviewContainer.hidden = true;
  }

  _clearErrors() {
    this.firstNameError.textContent = "";
    this.lastNameError.textContent = "";
    this.avatarError.textContent = "";
    this.departmentError.textContent = "";
  }

  async _loadDepartments() {
    try {
      const departments = await fetchDepartments();
      // Clear current options except the placeholder
      this.departmentSelect.innerHTML = '<option value="" disabled selected>აირჩიეთ განყოფილება</option>';
      departments.forEach((dept) => {
        const opt = document.createElement("option");
        opt.value = dept.id;
        opt.textContent = dept.name;
        this.departmentSelect.appendChild(opt);
      });
    } catch (error) {
      console.error("Error loading departments:", error);
      this.departmentError.textContent = "გაფრთხილება: განყოფილების დატვირთვა ვერ მოხერხდა";
    }
  }

  async _handleSubmit(e) {
    e.preventDefault();
    // Final validation check
    this._validateName(this.firstNameInput, this.firstNameError);
    this._validateName(this.lastNameInput, this.lastNameError);
    if (!this.avatarInput.files[0]) {
      this.avatarError.textContent = "გთხოვთ აირჩიოთ avatar";
      this.avatarInput.setCustomValidity("Avatar required");
    }
    if (!this.departmentSelect.value) {
      this.departmentError.textContent = "გთხოვთ აირჩიოთ განყოფილება";
      this.departmentSelect.setCustomValidity("Department required");
    }
    if (!this.form.checkValidity()) {
      return;
    }
    // Prepare employee data
    const employeeData = {
      firstName: this.firstNameInput.value.trim(),
      lastName: this.lastNameInput.value.trim(),
      departmentId: parseInt(this.departmentSelect.value),
      // For simplicity, assume API accepts avatar as Base64 encoded string.
      // In production, you might need to handle file uploads differently.
      avatar: await this._fileToBase64(this.avatarInput.files[0]),
    };

    try {
      const newEmployee = await createEmployee(employeeData);
      if (newEmployee) {
        // Dispatch event to notify new employee creation
        this.dispatchEvent(
          new CustomEvent("employee-created", {
            detail: newEmployee,
            bubbles: true,
          })
        );
        this.close();
      } else {
        alert("თანამშრომლის შექმნა ვერ მოხერხდა");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("შეცდომა თანამშრომლის შექმნისას");
    }
  }

  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error("Error reading file."));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
}

customElements.define("employee-modal", EmployeeModal);
