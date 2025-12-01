# Sanity AI Developer Toolkit

**Build faster with Sanity.io.** This toolkit equips your AI coding assistant with expert knowledge, interactive skills, and context-aware rules for building structured content platforms.

Supported environments: **Claude Code**, **Cursor**, **Windsurf**, and any editor compatible with `.mdc` rules.

---

## ✨ Features

- **Agentic Skills:** Interactive workflows that automate complex tasks like schema scaffolding, visual editing setup, and type generation.
- **Expert Context:** A comprehensive library of `.mdc` rules covering GROQ optimization, portable text, and framework integrations.
- **MCP Integration:** Direct access to the Sanity Content Lake for querying data, managing datasets, and running migrations without leaving your chat.
- **Framework Ready:** Dedicated guides for **Next.js**, **Remix**, **Nuxt**, **Svelte**, and **Astro**.

---

## 🚀 Quick Start

### For Claude Code Users

The toolkit is available as a plugin that connects seamlessly to the Sanity MCP Server.

**1. Install the Plugin**
```bash
/plugin install https://github.com/sanity-io/ai-toolkit/tree/main/sanity-plugin
```

**2. Explore Capabilities**
Run the help command to see what the agent can do:
```bash
/sanity
```

**3. Try a Prompt**
> "Scaffold a new 'project' document type with a slug and image."
> "Setup Visual Editing for my Remix app."
> "Optimize this GROQ query for performance."

### For Cursor & VS Code Users

You can install the context rules locally to teach your editor Sanity best practices.

**Option A: Automated Install (via Claude Code)**
If you have the plugin installed, just ask:
> "Install Sanity rules locally."

**Option B: Manual Install**
1.  Create a rules directory: `mkdir -p .cursor/rules`
2.  Copy the contents of the `rules/` folder in this repo to your project's `.cursor/rules/` directory.
3.  (Recommended) Copy `agents.md` to `.cursor/rules/agents.md` to act as a master router.

---

## 🧠 Capabilities

### Interactive Skills (Claude Code)

Skills allow the AI to perform multi-step actions in your codebase.

| Skill | What it does | Example Trigger |
| :--- | :--- | :--- |
| **Schema Scaffolder** | Creates strict, well-typed schema definitions using best-practice templates. | "Create a generic page schema" |
| **Visual Editing Setup** | Detects your framework (Next.js, Svelte, etc.) and configures loaders, stega, and overlays. | "Configure preview mode" |
| **Schema Manager** | Handles the full lifecycle: scaffolding, safe deprecation patterns, and migration scripts. | "Deprecate the 'body' field" |
| **GROQ Assistant** | Writes optimized queries using `defineQuery` and syntax highlighting standards. | "Write a query for recent posts" |
| **TypeGen Fixer** | Diagnoses and fixes TypeScript generation issues (`sanity-typegen.json`, scripts). | "Why are my types missing?" |

### Context Rules (Cursor/Copilot)

These files provide passive knowledge to the AI, ensuring generated code follows Sanity standards.

<details>
<summary><strong>Core Fundamentals</strong></summary>

- **`sanity-schema.mdc`**: The "Data > Presentation" philosophy, `defineType` syntax, and shared fields.
- **`sanity-groq.mdc`**: Performance rules, fragment reuse, and the "Golden Rule" of projections.
- **`sanity-visual-editing.mdc`**: Implementation of Content Source Maps (Stega) and Presentation Tool.
- **`sanity-mcp.mdc`**: Guidelines for using MCP tools for content operations instead of manual scripts.
</details>

<details>
<summary><strong>Framework Guides</strong></summary>

- **`sanity-nextjs.mdc`**: App Router, `defineLive`, and metadata handling.
- **`sanity-remix.mdc`**: React Router loaders and `@sanity/react-loader`.
- **`sanity-svelte.mdc`**: SvelteKit hooks and loaders.
- **`sanity-nuxt.mdc`**: Nuxt modules and `useSanityQuery`.
- **`sanity-astro.mdc`**: Astro islands and view transitions.
</details>

<details>
<summary><strong>Best Practices</strong></summary>

- **`sanity-migration.mdc`**: Strategies for importing HTML/Markdown from legacy CMSs.
- **`sanity-image.mdc`**: Hotspots, LQIP, and the `urlFor` builder.
- **`sanity-structure.mdc`**: Organizing the Desk tool (Singletons, groupings).
</details>

---

## 🔌 MCP Server

This toolkit relies on the **Sanity Remote MCP Server** (`https://mcp.sanity.io`) for live data access.

When installed via Claude Code, the plugin automatically configures this connection. This allows the AI to:
- **Inspect Data:** `query_documents` to see real content structure.
- **Modify Content:** `create_document` and `patch_document` for atomic updates.
- **Manage Project:** `list_datasets`, `create_dataset`, etc.

---

## 📂 Repository Structure

```text
sanity-io/ai-toolkit/
├── README.md
├── agents.md                   # System Prompt / Router
├── rules/                      # Context Rules (.mdc)
│   ├── sanity-schema.mdc       # Modeling patterns
│   ├── sanity-visual-editing.mdc # Preview logic
│   ├── sanity-nextjs.mdc       # Next.js specifics
│   └── ... (frameworks & patterns)
└── sanity-plugin/              # Claude Code Plugin
    ├── .claude-plugin/         # Metadata
    ├── commands/               # Slash commands (/sanity)
    └── skills/                 # Interactive workflows
        ├── sanity-scaffold/
        ├── sanity-visual-editing-setup/
        └── ...
```

## Contributing

Found a better pattern? Missing a framework?
1.  Fork the repo.
2.  Update the relevant `.mdc` file in `rules/`.
3.  Submit a PR.

---

**License:** MIT
