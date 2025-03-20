// stateManager.js

class AppState {
  constructor() {
    // Initialize the state; load filters from persistence if available
    this.state = {
      tasks: [],
      employees: [],
      filters: {},
      statuses: [],
      comments: [],
      // Add additional state properties as needed
    };

    this.subscribers = [];
  }

  // State getters and setters
  getState() {
    return { ...this.state };
  }

  setState(newState) {
    // Update the state and persist if necessary
    this.state = { ...this.state, ...newState };

    // If filters are updated, persist them
    if (newState.filters !== undefined) {
      this.saveToStorage("filters", this.state.filters);
    }
    // Add additional persistence logic here if needed

    this.notifySubscribers();
  }

  // Subscription for state changes (for reactive UI updates)
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.getState()));
  }
}

// Export a single instance (Singleton pattern) for global access
export const appState = new AppState();
