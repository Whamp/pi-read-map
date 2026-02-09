# Handoff: Generate Large Test Fixtures

## Context

The pi-read-map extension is complete with all 17 mappers working and 135 tests passing (118 unit + 17 E2E). The remaining work is generating large test fixtures for comprehensive cross-language E2E validation.

## Project Location

```
/home/will/projects/pi-read-map
```

## What Exists

Small fixtures (passthrough testing):
- `tests/fixtures/small/hello.py` ✅
- `tests/fixtures/small/hello.ts` ✅
- `tests/fixtures/small/hello.go` ✅

One large fixture:
- `tests/fixtures/large/processor.py` (4,500 lines, 137KB) ✅

## What's Needed

Generate realistic large files that will trigger file mapping (>2000 lines OR >50KB):

### 1. TypeScript Handler (`tests/fixtures/large/handler.ts`)

**Target**: 3,000+ lines

**Content pattern**: HTTP handler/controller style code with:
- Multiple interfaces for request/response types
- Multiple classes with constructor, async methods
- Type imports
- Decorators (optional)
- Generic types

**Example structure**:
```typescript
export interface Request1 { id: string; data: unknown; }
export interface Response1 { success: boolean; result: unknown; }

export class Handler1 {
  private config: Record<string, unknown>;
  
  constructor(config: Record<string, unknown>) {
    this.config = config;
  }
  
  async handle(req: Request1): Promise<Response1> {
    return { success: true, result: req.data };
  }
  
  async validate(req: Request1): Promise<boolean> {
    return Boolean(req.id);
  }
}
// Repeat pattern ~100 times to reach 3000+ lines
```

### 2. Go Server (`tests/fixtures/large/server.go`)

**Target**: 4,000+ lines

**Content pattern**: HTTP server with multiple services:
- Package main with imports
- Multiple struct types with fields
- Multiple methods on structs
- Standalone functions
- Interface definitions

**Example structure**:
```go
package main

import (
    "fmt"
    "net/http"
)

type Service1 struct {
    Name string
    Port int
}

func (s *Service1) Start() error {
    fmt.Printf("Starting %s on port %d\n", s.Name, s.Port)
    return nil
}

func (s *Service1) Handle(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
}
// Repeat pattern ~150 times to reach 4000+ lines
```

### 3. SQL Schema (`tests/fixtures/large/schema.sql`)

**Target**: 2,500+ lines

**Content pattern**: Database DDL with:
- CREATE TABLE statements with multiple columns
- CREATE INDEX statements
- CREATE VIEW statements
- CREATE FUNCTION/PROCEDURE (PostgreSQL style)
- ALTER TABLE statements
- Comments

**Example structure**:
```sql
-- Table: users_1
CREATE TABLE users_1 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_1_email ON users_1(email);

CREATE VIEW active_users_1 AS
    SELECT * FROM users_1 WHERE created_at > NOW() - INTERVAL '30 days';
-- Repeat pattern ~100 times
```

### 4. JSON Data (`tests/fixtures/large/data.json`)

**Target**: 100KB+ file size

**Content pattern**: Nested structure like an API response:
- Root object with multiple keys
- Arrays of objects
- 3+ levels of nesting
- Various data types

**Example structure**:
```json
{
  "users": [
    {
      "id": 1,
      "name": "User 1",
      "profile": {
        "bio": "...",
        "settings": { "theme": "dark", "notifications": true }
      },
      "posts": [
        { "id": 1, "title": "Post 1", "content": "..." }
      ]
    }
  ],
  "metadata": { ... }
}
```

### 5. Markdown Readme (`tests/fixtures/large/readme.md`)

**Target**: 3,000+ lines

**Content pattern**: Documentation with:
- Multiple heading levels (h1 → h6)
- Code blocks in various languages
- Lists (ordered and unordered)
- Tables
- Links and images (placeholder)

**Example structure**:
```markdown
# Project Documentation

## Overview

Description text...

### Installation

```bash
npm install
```

### API Reference

#### Module 1

##### Function 1

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name |

###### Examples
...
```

### 6. Pathological Fixtures (`tests/fixtures/pathological/`)

**many-symbols.py** (5,000+ functions):
```python
def function_0(x: int, y: str) -> bool:
    return True

def function_1(x: int, y: str) -> bool:
    return True
# ... 5000 functions
```

**deep-nesting.ts** (20 levels):
```typescript
export namespace Level0 {
  export namespace Level1 {
    export namespace Level2 {
      // ... 20 levels deep
      export class DeepClass {
        method(): void {}
      }
    }
  }
}
```

**no-symbols.txt** (100KB plain text):
```
Lorem ipsum dolor sit amet...
(repeated to reach 100KB, no code-like structure)
```

**binary.bin**:
```
(Small binary file, e.g., 1KB of random bytes or a minimal PNG)
```

## Generation Approach

Use Node.js scripts to generate the files programmatically:

```bash
cd /home/will/projects/pi-read-map
node scripts/generate-fixtures.js
```

Or generate inline with bash + node:

```bash
node -e "
const fs = require('fs');
const lines = [];
for (let i = 0; i < 100; i++) {
  lines.push(\`export interface Request\${i} { id: string; }\`);
  lines.push(\`export class Handler\${i} {\`);
  lines.push(\`  async handle(): Promise<void> {}\`);
  lines.push(\`}\`);
  lines.push('');
}
fs.writeFileSync('tests/fixtures/large/handler.ts', lines.join('\n'));
"
```

## Validation

After generating fixtures, verify:

1. Files exist and have correct sizes:
   ```bash
   ls -la tests/fixtures/large/
   wc -l tests/fixtures/large/*
   ```

2. Mappers produce output for each:
   ```bash
   npm test -- --grep "large"
   ```

3. E2E tests still pass:
   ```bash
   npm run test:e2e
   ```

## Commit

```bash
git add tests/fixtures/large/ tests/fixtures/pathological/
git commit -m "Add large and pathological test fixtures for cross-language validation"
```

## Success Criteria

- [ ] `handler.ts` exists with 3,000+ lines
- [ ] `server.go` exists with 4,000+ lines  
- [ ] `schema.sql` exists with 2,500+ lines
- [ ] `data.json` exists with 100KB+
- [ ] `readme.md` exists with 3,000+ lines
- [ ] Pathological fixtures exist (4 files)
- [ ] All tests still pass
- [ ] Each large file produces a file map when read
