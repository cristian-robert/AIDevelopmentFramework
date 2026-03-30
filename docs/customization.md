# Customization Guide

## Adding Custom Rules

1. Copy `.claude/rules/_template.md` to `.claude/rules/your-domain.md`
2. Set the `globs` pattern to match your file paths
3. Add your conventions and skill chains
4. Rules auto-load when editing matching files

## Adding Custom Agents

1. Copy `.claude/agents/_template/AGENT.md` to `.claude/agents/your-agent/AGENT.md`
2. Define query types, tools, and response format
3. Add knowledge base files as needed
4. Reference the agent from your commands or rules

## Customizing Commands

Commands are markdown files in `.claude/commands/`. Edit existing commands or add new ones. Commands are invoked as `/command-name` in Claude Code.

## Customizing Hooks

Hooks are shell scripts in `.claude/hooks/`. Edit existing hooks or add new ones. Make sure hooks are executable (`chmod +x`).

## Overriding Rules per Project

Each project gets its own `.claude/` folder. Customize CLAUDE.md, rules, and agent knowledge bases per project. The framework's commands stay the same.

## Contributing

1. Fork the repository
2. Add your contribution
3. Submit a PR with description, usage, and testing notes
