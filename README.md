# Sanity AI Developer Toolkit

**Build faster with Sanity.io.** This toolkit equips your AI coding assistant with expert knowledge, interactive skills, and context-aware rules for building structured content platforms.

Supported environments: **Claude Code**, **Cursor**, **Windsurf**, and any editor compatible with `.mdc` rules.

---

## ✨ Features

- **Agentic Skills:** Interactive workflows that automate complex tasks like schema scaffolding, visual editing setup, and type generation.
- **Expert Context:** A comprehensive library of `.mdc` rules covering GROQ optimization, portable text, and framework integrations.
- **MCP Integration:** Direct access to the Sanity Content Lake for querying, creating, and updating content without leaving your chat.
- **Framework Agnostic:** Dedicated rules for **Next.js**, **React Router**, **Nuxt**, **SvelteKit**, and **Astro**.

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
> "Get started with Sanity"
> "Scaffold a new 'project' document type with a slug and image."
> "Setup Visual Editing for my Remix app."

### For Cursor & Windsurf Users

Install the context rules locally to teach your editor Sanity best practices.

**Option A: Automated Install (via Claude Code)**
If you have the plugin installed, just ask:
> "Install Sanity rules locally."

**Option B: Manual Install**
1. Create a rules directory: `mkdir -p .cursor/rules`
2. Copy the contents of the `rules/` folder to your project's `.cursor/rules/` directory.
3. (Recommended) Copy `AGENTS.md` to your project root to act as a master router.

---

## 🧠 Capabilities

### Slash Commands (Claude Code)

| Command | What it does |
| :--- | :--- |
| `/sanity` | List available skills and help topics |
| `/review` | Review code for Sanity best practices |
| `/typegen` | Run TypeGen and troubleshoot issues |
| `/deploy-schema` | Deploy schema with verification |

### Interactive Skills (Claude Code)

Skills guide the AI through multi-step workflows in your codebase.

| Skill | What it does | Example Trigger |
| :--- | :--- | :--- |
| **Schema Scaffolder** | Creates strict, well-typed schema definitions using best-practice templates. | "Create a blog post schema" |
| **Visual Editing Setup** | Detects your framework and configures loaders, stega, and overlays. | "Configure preview mode" |
| **Schema Manager** | Handles the full lifecycle: scaffolding, safe deprecation, and migrations. | "Deprecate the 'body' field" |
| **GROQ Assistant** | Writes optimized queries using `defineQuery` and proper projections. | "Write a query for recent posts" |
| **TypeGen Fixer** | Diagnoses and fixes TypeScript generation issues. | "Why are my types missing?" |

### Getting Started Flow

The onboarding guide follows three phases:

1. **Studio & Schema** — Set up Sanity Studio and define your content model
2. **Content** — Import existing content or generate placeholder content via MCP
3. **Frontend** — Integrate with your application (framework-specific)

Just say: "Get started with Sanity" to begin.

### Context Rules (Cursor/Windsurf)

These files provide passive knowledge to the AI, ensuring generated code follows Sanity standards.

<details>
<summary><strong>Core Fundamentals</strong></summary>

- **`sanity-schema.mdc`**: The "Data > Presentation" philosophy, `defineType` syntax, and shared fields.
- **`sanity-groq.mdc`**: Performance rules, fragment reuse, and the "Golden Rule" of projections.
- **`sanity-visual-editing.mdc`**: Implementation of Content Source Maps (Stega) and Presentation Tool.
- **`sanity-mcp.mdc`**: Guidelines for using MCP tools for content operations.
- **`sanity-get-started.mdc`**: Interactive 3-phase onboarding guide.
</details>

<details>
<summary><strong>Framework Rules</strong></summary>

- **`sanity-nextjs.mdc`**: App Router, `defineLive`, and metadata handling.
- **`sanity-remix.mdc`**: React Router loaders and data fetching patterns.
- **`sanity-svelte.mdc`**: SvelteKit hooks and loaders.
- **`sanity-nuxt.mdc`**: Nuxt modules and `useSanityQuery`.
- **`sanity-astro.mdc`**: Astro content collections and islands.
</details>

<details>
<summary><strong>Best Practices</strong></summary>

- **`sanity-migration.mdc`**: Strategies for importing HTML/Markdown from legacy CMSs.
- **`sanity-image.mdc`**: Hotspots, LQIP, and the `urlFor` builder.
- **`sanity-structure.mdc`**: Organizing the Desk tool (singletons, groupings).
- **`sanity-portable-text.mdc`**: Rendering rich text with custom components.
- **`sanity-i18n.mdc`**: Internationalization patterns.
- **`sanity-seo.mdc`**: Metadata, sitemaps, and Open Graph.
</details>

---

## 🔌 MCP Server

This toolkit uses the **Sanity MCP Server** (`https://mcp.sanity.io`) for live data access.

When installed via Claude Code, the plugin automatically configures this connection. This allows the AI to:
- **Inspect Data:** `query_documents` to see real content structure.
- **Modify Content:** `create_document` and `patch_document` for atomic updates.
- **Manage Project:** `list_datasets`, `create_dataset`, `get_schema`, etc.

**For Cursor users:** [Add Sanity MCP →](cursor://anysphere.cursor-deeplink/mcp/install?name=Sanity&config=eyJ1cmwiOiJodHRwczovL21jcC5zYW5pdHkuaW8iLCJ0eXBlIjoiaHR0cCJ9Cg==)

---

## 📂 Repository Structure

```text
sanity-io/ai-toolkit/
├── AGENTS.md                      # Knowledge router & agent behavior
├── README.md                      # This file
├── rules/                         # Context rules (.mdc)
│   ├── sanity-schema.mdc          # Schema design patterns
│   ├── sanity-get-started.mdc     # 3-phase onboarding guide
│   ├── sanity-nextjs.mdc          # Next.js integration
│   ├── sanity-remix.mdc           # React Router integration
│   └── ...                        # Additional rules
└── sanity-plugin/                 # Claude Code plugin
    ├── commands/                  # Slash commands
    │   ├── sanity.md              # /sanity help
    │   ├── review.md              # /review
    │   ├── typegen.md             # /typegen
    │   └── deploy-schema.md       # /deploy-schema
    └── skills/                    # Interactive workflows
        ├── sanity-scaffold/
        ├── sanity-visual-editing-setup/
        └── ...
```

---

## 📚 Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Language Reference](https://www.sanity.io/docs/groq)
- [Visual Editing Guide](https://www.sanity.io/docs/visual-editing)
- [Sanity TypeGen](https://www.sanity.io/docs/sanity-typegen)

---

## Contributing

Found a better pattern? Missing a framework?
1. Fork the repo.
2. Update the relevant `.mdc` file in `rules/`.
3. Submit a PR.

---

**License:** MIT
