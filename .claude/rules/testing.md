---
description: Testing rules — auto-loads when editing test files
globs: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**", "**/__tests__/**", "**/e2e/**"]
---

# Testing Rules

## Test Naming

- Describe behavior, not implementation: `it('returns 404 when user not found')` not `it('tests getUserById')`
- Group by feature/module with `describe` blocks

## Test Structure

- **Arrange** — set up test data and dependencies
- **Act** — call the function/endpoint under test
- **Assert** — verify the result

## What to Test

- Happy path (expected inputs → expected outputs)
- Edge cases (empty inputs, boundary values, null/undefined)
- Error cases (invalid inputs, network failures, permission denied)
- Do NOT test framework internals or third-party libraries

## Mock Policy

- Use real databases for integration tests where possible
- Mock external APIs and third-party services
- Never mock the module under test
- Prefer dependency injection over module mocking

## Coverage

- Critical business logic: aim for high coverage
- UI components: test behavior (clicks, form submissions), not rendering details
- Don't chase 100% — test what matters
