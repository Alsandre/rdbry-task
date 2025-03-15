// storageService.js

const STORAGE_KEYS = {
  FILTERS: "filters",
  TASK_FORM: "taskFormData",
  // You can add more keys for other domain-specific data here
};

const storageService = {
  // Filters
  getFilters() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FILTERS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving filters from storage:", error);
      return null;
    }
  },
  setFilters(filters) {
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters to storage:", error);
    }
  },
  clearFilters() {
    try {
      localStorage.removeItem(STORAGE_KEYS.FILTERS);
    } catch (error) {
      console.error("Error clearing filters from storage:", error);
    }
  },

  // Task Form Data
  getTaskFormData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASK_FORM);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving task form data from storage:", error);
      return null;
    }
  },
  setTaskFormData(formData) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASK_FORM, JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving task form data to storage:", error);
    }
  },
  clearTaskFormData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASK_FORM);
    } catch (error) {
      console.error("Error clearing task form data from storage:", error);
    }
  },

  // You can add more domain-specific functions here if needed
};
