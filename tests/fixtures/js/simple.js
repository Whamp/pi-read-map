// Simple JavaScript fixture for testing

class UserManager {
  constructor() {
    this.users = new Map();
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  getUser(id) {
    return this.users.get(id);
  }
}

function formatUser(user) {
  return `${user.name} <${user.email}>`;
}

const DEFAULT_CONFIG = {
  maxUsers: 100,
  timeout: 5000,
};

module.exports = {
  UserManager,
  formatUser,
  DEFAULT_CONFIG,
};
