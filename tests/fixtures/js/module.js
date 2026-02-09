// Test JavaScript module

export function greet(name) {
  return `Hello, ${name}!`;
}

export class Calculator {
  result = 0;

  add(n) {
    this.result += n;
    return this;
  }

  subtract(n) {
    this.result -= n;
    return this;
  }

  getResult() {
    return this.result;
  }
}

export default Calculator;
