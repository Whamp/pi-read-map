/// A configuration for the application.
pub struct Config {
    pub host: String,
    pub port: u16,
}

/// Start the server with the given config.
///
/// This will bind to the specified host and port
/// and begin accepting connections.
pub fn start_server(config: &Config) -> bool {
    true
}

fn internal_helper() -> i32 {
    42
}

/// Represents a running service instance.
pub enum ServiceState {
    Running,
    Stopped,
}

/// A trait for processable items.
pub trait Processable {
    fn process(&self);
}
