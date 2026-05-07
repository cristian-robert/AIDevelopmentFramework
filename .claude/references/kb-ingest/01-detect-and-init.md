# /kb-ingest — Phase 1: Detect Path + Init Structure

## Detect KB

Per `_shared/kb-detect.md`. If KB is off → blocker: "Knowledge base not configured. Add a `## Knowledge Base` section with `Path: <directory>` to CLAUDE.md."

## Init missing structure

Resolve `<kb-path>` and verify it exists. If not, create:

```
<kb-path>/
├── raw/
│   ├── articles/
│   ├── papers/
│   ├── docs/
│   ├── repos/
│   └── sessions/
├── wiki/
└── _search/
```

## Init missing meta-files

`raw/_manifest.md`:
```markdown
# Raw Ingestion Manifest

| Source | Date | Type | Raw File | Status | Wiki Article |
|--------|------|------|----------|--------|--------------|
```

`wiki/_index.md`:
```markdown
# Wiki Index

| Slug | Title | Tags | Status |
|------|-------|------|--------|
```

`wiki/_tags.md`:
```markdown
# Tag Index

| Tag | Articles |
|-----|----------|
```
