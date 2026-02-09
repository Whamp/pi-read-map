#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 100
#define VERSION "1.0.0"

typedef enum {
    STATE_IDLE,
    STATE_RUNNING,
    STATE_STOPPED
} State;

struct Config {
    char *host;
    int port;
};

typedef struct {
    struct Config config;
    State state;
} Server;

void init_server(Server *s, const char *host, int port) {
    s->config.host = (char *)host;
    s->config.port = port;
    s->state = STATE_IDLE;
}

int start_server(Server *s) {
    if (s->state != STATE_IDLE) {
        return -1;
    }
    printf("Starting server on %s:%d\n", s->config.host, s->config.port);
    s->state = STATE_RUNNING;
    return 0;
}

void stop_server(Server *s) {
    s->state = STATE_STOPPED;
    printf("Server stopped\n");
}

int main(int argc, char *argv[]) {
    Server server;
    init_server(&server, "localhost", 8080);
    
    if (start_server(&server) != 0) {
        fprintf(stderr, "Failed to start server\n");
        return 1;
    }
    
    stop_server(&server);
    return 0;
}
