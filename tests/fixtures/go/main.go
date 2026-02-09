package main

import (
	"fmt"
	"os"
)

const Version = "1.0.0"

var Debug = false

type Config struct {
	Host string
	Port int
}

type Server struct {
	config *Config
}

func NewServer(cfg *Config) *Server {
	return &Server{config: cfg}
}

func (s *Server) Start() error {
	fmt.Printf("Starting server on %s:%d\n", s.config.Host, s.config.Port)
	return nil
}

func (s *Server) Stop() {
	fmt.Println("Stopping server")
}

func main() {
	cfg := &Config{Host: "localhost", Port: 8080}
	server := NewServer(cfg)
	if err := server.Start(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer server.Stop()
}
