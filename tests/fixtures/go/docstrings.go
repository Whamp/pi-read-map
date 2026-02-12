package docstrings

import "fmt"

// ProcessData handles incoming data transformations.
// It supports multiple formats.
func ProcessData(data []byte) error {
	fmt.Println(data)
	return nil
}

// internalHelper is not exported.
func internalHelper() {}

// Config holds application configuration.
type Config struct {
	// Host is the server hostname.
	Host string
	Port int
}

// Handler processes HTTP requests.
type Handler interface {
	// ServeHTTP handles a single request.
	ServeHTTP()
}

// MaxRetries is the maximum number of retry attempts.
const MaxRetries = 3
