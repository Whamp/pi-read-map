/**
 * Processes incoming HTTP requests and routes them.
 * This is a multi-line docstring — only the first line should be extracted.
 */
export function handleRequest(req: Request): Response {
  return new Response("ok");
}

/** A user in the system. */
export interface User {
  id: number;
  name: string;
}

/**
 * Service for managing user accounts.
 * Handles creation, deletion, and updates.
 */
export class UserService {
  /** The internal user store. */
  private users: Map<number, User> = new Map();

  /** Creates a new user in the system. */
  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  /**
   * Retrieves a user by their ID.
   * Returns undefined if not found.
   */
  getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  // No JSDoc on this method
  deleteUser(id: number): boolean {
    return this.users.delete(id);
  }
}

/** Maximum number of retries for failed operations. */
export const MAX_RETRIES = 3;

/** Supported log levels. */
export enum LogLevel {
  Debug = "debug",
  Info = "info",
  Error = "error",
}

/** A type alias for handler functions. */
export type Handler = (req: Request) => Response;

// No JSDoc on this function
export function noDoc(): void {}
