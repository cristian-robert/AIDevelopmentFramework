# /execute — Step 5: Completion

## Marker teardown

Tear down the marker file so it can't poison a later session:

```bash
.claude/hooks/spec-reviewer-marker.sh clear
```

The helper is a no-op if the file is absent. (Hook also treats markers older than 10 minutes as stale, so a missed teardown degrades gracefully — but staleness should be the exception, not the norm.)

## Output (one line, per `_shared/output-contract.md`)

```
Executed N/M tasks · tests=<pass|N fail> lint=<pass|N> types=<pass|N> · Next: /validate
```

## Blocker (after 3 failed implementer attempts on a task)

```
Blocked at Task <N>: <reason>. Plan=<path>, last diff retained. Resolve and re-run /execute.
```

## Error handling

- Task fails + cannot be fixed in 3 attempts → stop, report, ask user.
- Plan has a bug (wrong file path, missing step) → fix the plan, continue.
- Dependency missing → install, continue.
- Never skip a failing test — fix the code or report the issue.
