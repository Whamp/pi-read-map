// Simple TypeScript fixture for testing

export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService {
  private users: Map<number, User> = new Map();

  constructor() {
    // Initialize service
  }

  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  async fetchUser(id: number): Promise<User | null> {
    const user = this.users.get(id);
    return user ?? null;
  }
}

export function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  };
}

export const DEFAULT_USER: User = {
  id: 0,
  name: "Guest",
  email: "guest@example.com",
};
