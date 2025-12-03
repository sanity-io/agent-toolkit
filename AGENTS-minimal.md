## Sanity Development

This project uses Sanity.io for content management. The Sanity MCP server provides best practice rules.

### Before Starting Any Sanity Task

1. **Call `list_sanity_rules`** to see available guidance and which rules to load
2. **Load relevant rules** based on the task-to-rules mapping in the response
3. **Explore existing schemas** before implementing - look for patterns like pageBuilder to extend

### Quick Reference

- Use `defineType`, `defineField`, `defineArrayMember` for schemas
- Use `defineQuery` for all GROQ queries
- **SCREAMING_SNAKE_CASE** for query constants (e.g., `POSTS_QUERY`, not `postsQuery`)
- Run `npx sanity schema deploy` after schema changes, before MCP content operations
- Handle stega correctly: use `stegaClean` for logic (classNames, IDs), never clean rendered text

### Example: Feature Implementation

For a feature task (schema + query + component), load multiple rules in one call:

```
get_sanity_rules({ rules: ["sanity-schema", "sanity-groq", "sanity-nextjs", "sanity-visual-editing"] })
```
