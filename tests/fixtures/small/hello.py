#!/usr/bin/env python3
"""
Hello World - A simple Python file for testing.
"""


def hello():
    """Say hello."""
    print("Hello, World!")


class Greeter:
    """A simple greeter class."""

    def __init__(self, name: str):
        self.name = name

    def greet(self) -> str:
        return f"Hello, {self.name}!"


if __name__ == "__main__":
    hello()
    g = Greeter("User")
    print(g.greet())
