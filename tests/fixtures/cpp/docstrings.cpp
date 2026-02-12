/// A request handler for the HTTP server.
class RequestHandler {
public:
    /// Process an incoming request.
    void handle(const char* path);

    /// Get the handler name.
    const char* name() const;

private:
    void log_internal();
};

/**
 * Compute the factorial of n.
 *
 * Uses iterative approach for efficiency.
 */
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

static void module_init() {
    // internal linkage
}

namespace Utils {
    /// Clamp a value to the given range.
    int clamp(int val, int lo, int hi) {
        if (val < lo) return lo;
        if (val > hi) return hi;
        return val;
    }
}
