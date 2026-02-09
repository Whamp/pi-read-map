/**
 * Hello World - A simple TypeScript file for testing.
 */

export interface Greeting {
  message: string;
  recipient: string;
}

export function hello(): void {
  console.log("Hello, World!");
}

export class Greeter {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(): Greeting {
    return {
      message: `Hello, ${this.name}!`,
      recipient: this.name,
    };
  }
}

if (import.meta.main) {
  hello();
  const g = new Greeter("User");
  console.log(g.greet().message);
}
