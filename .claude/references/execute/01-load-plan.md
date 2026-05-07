# /execute — Step 1: Load Plan

1. If `$ARGUMENTS` provided → read that file.
2. Otherwise search `docs/plans/` and `docs/superpowers/plans/`:
   - Match against current branch name.
   - If multiple found → ask the user which one (blocker).
3. Parse the plan into tasks and steps.

If no plan can be located → blocker: "No plan file found. Run `/plan-feature` first or pass an explicit path."
