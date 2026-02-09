// Hello World - A simple Go file for testing.
package main

import "fmt"

// Greeting represents a greeting message.
type Greeting struct {
	Message   string
	Recipient string
}

// Hello prints a hello message.
func Hello() {
	fmt.Println("Hello, World!")
}

// Greeter provides greeting functionality.
type Greeter struct {
	name string
}

// NewGreeter creates a new Greeter.
func NewGreeter(name string) *Greeter {
	return &Greeter{name: name}
}

// Greet returns a greeting.
func (g *Greeter) Greet() Greeting {
	return Greeting{
		Message:   fmt.Sprintf("Hello, %s!", g.name),
		Recipient: g.name,
	}
}

func main() {
	Hello()
	g := NewGreeter("User")
	fmt.Println(g.Greet().Message)
}
