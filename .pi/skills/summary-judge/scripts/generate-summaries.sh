#!/usr/bin/env bash
# Generate summaries using both standard read and pi-read-map for comparison
# Usage: generate-summaries.sh <target-file>
#
# Outputs two files:
#   /tmp/summary-judge/summary-standard.md
#   /tmp/summary-judge/summary-mapped.md

set -euo pipefail

PROJECT_ROOT="/home/will/projects/pi-read-map"
EXTENSION_PATH="$PROJECT_ROOT/src/index.ts"
OUTPUT_DIR="/tmp/summary-judge"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <target-file>"
    exit 1
fi

TARGET_FILE="$1"

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "Error: File not found: $TARGET_FILE"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Get file stats
LINE_COUNT=$(wc -l < "$TARGET_FILE")
FILE_SIZE=$(ls -lh "$TARGET_FILE" | awk '{print $5}')
FILENAME=$(basename "$TARGET_FILE")

PROMPT="Read this file and create a detailed summary: $TARGET_FILE

Include:
- File overview and purpose
- Key components/classes/functions
- Notable patterns or architecture
- Use tables for method/function categorization if applicable"

echo "Target: $TARGET_FILE ($LINE_COUNT lines, $FILE_SIZE)"
echo ""

echo "=== Generating Standard Summary ==="
pi --no-extensions --no-skills --no-prompt-templates --print "$PROMPT" > "$OUTPUT_DIR/summary-standard.md" 2>/dev/null
echo "Done: $OUTPUT_DIR/summary-standard.md"

echo ""
echo "=== Generating pi-read-map Summary ==="
pi --no-extensions --extension "$EXTENSION_PATH" --no-skills --no-prompt-templates --print "$PROMPT" > "$OUTPUT_DIR/summary-mapped.md" 2>/dev/null
echo "Done: $OUTPUT_DIR/summary-mapped.md"

# Write metadata for the skill to use
cat > "$OUTPUT_DIR/metadata.json" << EOF
{
  "target_file": "$TARGET_FILE",
  "filename": "$FILENAME",
  "line_count": $LINE_COUNT,
  "file_size": "$FILE_SIZE",
  "generated_at": "$(date -Iseconds)"
}
EOF

echo ""
echo "=== Complete ==="
echo "Summaries ready at: $OUTPUT_DIR/"
