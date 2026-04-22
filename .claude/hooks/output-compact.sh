#!/usr/bin/env bash
# .claude/hooks/output-compact.sh
# Stop hook — compact user-facing final message (caveman style).
#
# Contract:
#   - Reads stdin (plain text OR JSON envelope with .assistant_text/.message/.text/.content).
#   - Writes compacted text (or unmodified JSON with compacted field) to stdout.
#   - Preserves fenced code blocks, markdown tables, list items, headings, and
#     file:line paths. Strips hedging and redundant politeness from prose lines.
#
# Empty stdin / smoke-test safety:
#   - If stdin is a TTY (no data piped), exit 0 immediately.
#   - If piped input is empty, exit 0 silently.
#
# Opt-outs (any one bypasses compaction):
#   - Env var: CLAUDE_OUTPUT_COMPACT=off
#   - CLAUDE.md contains a "## Output Compaction" section whose body mentions "off"
#   - The input contains the literal marker "<!-- no-compact -->" anywhere
#
# Awk portability: we DO NOT use gawk-only \y word boundaries. The substitution
# patterns anchor on the canonical casing used in the compaction spec
# (.claude/references/output-compaction.md) and rely on BSD-awk-compatible ERE
# alternation. macOS default awk is BSD awk; Linux default is gawk — both work.

set -uo pipefail

# --- Empty stdin check -------------------------------------------------------
if [ -t 0 ]; then
  exit 0
fi

input="$(cat || true)"
if [ -z "$input" ]; then
  exit 0
fi

# --- Env var opt-out ---------------------------------------------------------
if [ "${CLAUDE_OUTPUT_COMPACT:-on}" = "off" ]; then
  printf '%s' "$input"
  exit 0
fi

# --- CLAUDE.md opt-out -------------------------------------------------------
if [ -f CLAUDE.md ]; then
  section="$(awk '
    /^## Output Compaction/ { inside=1; next }
    inside && /^## / { exit }
    inside { print }
  ' CLAUDE.md 2>/dev/null || true)"
  if [ -n "$section" ] && printf '%s' "$section" | grep -qi 'off'; then
    printf '%s' "$input"
    exit 0
  fi
fi

# --- No-compact marker bypass ------------------------------------------------
if printf '%s' "$input" | grep -q '<!-- no-compact -->'; then
  printf '%s' "$input"
  exit 0
fi

# --- JSON envelope detection -------------------------------------------------
# Weak heuristic: leading '{' and a known text field. If node is available,
# try to extract the field; on any failure, fall back to treating the input
# as plain text. Passing through valid JSON untouched is safer than mangling.
text="$input"
is_json=0
json_field=""

first_char="$(printf '%s' "$input" | head -c1)"
if [ "$first_char" = "{" ] && command -v node >/dev/null 2>&1; then
  for field in assistant_text message text content; do
    extracted="$(node -e '
      let d="";
      process.stdin.on("data",c=>d+=c);
      process.stdin.on("end",()=>{
        try {
          const j = JSON.parse(d);
          const f = process.argv[1];
          if (j && typeof j[f] === "string") process.stdout.write(j[f]);
          else process.exit(1);
        } catch (e) { process.exit(1); }
      });
    ' "$field" <<<"$input" 2>/dev/null)" || extracted=""
    if [ -n "$extracted" ]; then
      text="$extracted"
      is_json=1
      json_field="$field"
      break
    fi
  done
fi

# --- Compaction awk filter ---------------------------------------------------
# PRESERVE:
#   * fenced code blocks (toggle on lines beginning with ```),
#   * markdown tables (leading |),
#   * list items (leading -, *, or N.),
#   * headings (leading #),
#   * any line containing a file:line pattern (e.g. foo.ts:42).
# COMPACT prose lines:
#   * drop hedging phrases with optional trailing comma/space,
#   * drop redundant politeness ("Great!", etc.) with optional bang,
#   * collapse runs of spaces, trim leading whitespace.
compacted="$(printf '%s' "$text" | awk '
  BEGIN { in_fence = 0 }
  /^```/               { in_fence = !in_fence; print; next }
  in_fence              { print; next }
  /^\|/                 { print; next }
  /^[ \t]*([-*]|[0-9]+\.)[ \t]/ { print; next }
  /^#/                  { print; next }
  /[A-Za-z_.\/-]+\.[A-Za-z0-9]+:[0-9]+/ { print; next }
  {
    # Strip hedging (two passes for adjacent matches).
    gsub(/(It seems|I think|I believe|Essentially|Basically|As you can see)[,]?[ ]*/, "")
    gsub(/(it seems|i think|i believe|essentially|basically|as you can see)[,]?[ ]*/, "")
    # Strip redundant politeness, optional trailing !
    gsub(/(Great|Absolutely|Of course|Certainly)!?[ ]*/, "")
    # Collapse multiple spaces.
    gsub(/  +/, " ")
    # Trim leading whitespace (unless it is indentation we missed — rare).
    sub(/^[ \t]+/, "")
    print
  }
')"

# --- Emit --------------------------------------------------------------------
if [ "$is_json" = 1 ] && command -v node >/dev/null 2>&1; then
  # Re-serialize the envelope with the compacted field value. On any failure
  # fall back to raw compacted text — never emit malformed JSON.
  rewrapped="$(node -e '
    let d="";
    process.stdin.on("data",c=>d+=c);
    process.stdin.on("end",()=>{
      try {
        const j = JSON.parse(d);
        const f = process.argv[1];
        const v = process.argv[2];
        j[f] = v;
        process.stdout.write(JSON.stringify(j));
      } catch (e) { process.exit(1); }
    });
  ' "$json_field" "$compacted" <<<"$input" 2>/dev/null)" || rewrapped=""
  if [ -n "$rewrapped" ]; then
    printf '%s' "$rewrapped"
  else
    printf '%s' "$compacted"
  fi
else
  printf '%s' "$compacted"
fi
