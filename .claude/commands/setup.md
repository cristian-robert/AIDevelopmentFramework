# /setup — Framework Health Check

Checks what external plugins, skills, and MCP servers are installed and reports any gaps.

## Process

### Step 1: Check Plugins

Verify each required plugin is installed. Present results as a checklist.

**Core Workflow (required):**

| Plugin | Install Command |
|--------|----------------|
| superpowers | `claude plugin install superpowers` |
| feature-dev | `claude plugin install feature-dev` |
| code-review | `claude plugin install code-review` |
| commit-commands | `claude plugin install commit-commands` |
| claude-md-management | `claude plugin install claude-md-management` |
| security-guidance | `claude plugin install security-guidance` |
| skill-creator | `claude plugin install skill-creator` |

**Framework Support (recommended):**

| Plugin | Install Command |
|--------|----------------|
| firecrawl | `claude plugin install firecrawl` |
| frontend-design | `claude plugin install frontend-design` |
| claude-code-setup | `claude plugin install claude-code-setup` |
| agent-sdk-dev | `claude plugin install agent-sdk-dev` |

**Stack-Specific (install what applies):**

| Plugin | When Needed | Install Command |
|--------|------------|----------------|
| context7 | Any framework/library project | `claude plugin install context7` |
| supabase | Supabase projects | `claude plugin install supabase` |
| typescript-lsp | TypeScript projects | `claude plugin install typescript-lsp` |
| expo-app-design | Expo/React Native projects | `claude plugin install expo-app-design --marketplace expo-plugins` |

### Step 2: Check MCP Servers

Verify project-level MCP server configuration if applicable:
- shadcn — for shadcn/ui component projects
- context7 — for documentation lookup
- supabase — for database operations
- mobile-mcp — for mobile testing

### Step 3: Check Framework Files

Verify .claude/ structure is complete:
- commands/ (10 files)
- agents/ (4 agents + template)
- rules/ (6 rules + template)
- references/ (5 templates)
- hooks/ (5 scripts)
- settings.local.json

### Step 4: Report

```
=== Framework Health Check ===

Plugins:
  [check] superpowers
  [check] feature-dev
  [missing] firecrawl — run: claude plugin install firecrawl

MCP Servers:
  [check] context7
  [missing] shadcn — add to .mcp.json if using shadcn/ui

Framework Files:
  [check] .claude/commands/ (10 commands)
  [check] .claude/agents/ (4 agents)
  [check] .claude/rules/ (6 rules)
  [check] .claude/references/ (5 templates)
  [check] .claude/hooks/ (5 hooks)

Status: Ready (install missing items above for full functionality)
```
