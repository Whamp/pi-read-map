#include <stdio.h>

void public_func(int x) {
    printf("%d\n", x);
}

static void private_helper(void) {
    // internal linkage
}

static int internal_counter = 0;

struct PublicStruct {
    int value;
};
