# Cross-cutting deprecations

Not tied to a single boundary. Check these on any span.

---

## 1. Scheduled publishing, `studioHost`, and deploy hostnames

Not tied to a boundary, but worth checking on any span.

**Scheduled publishing** was deprecated in October 2025 and remains gated behind `scheduledPublishing: {enabled: true}`. If a project still uses it, migrating to Scheduled drafts or Content Releases is separate work and should be scoped separately rather than folded into a version upgrade.

**`studioHost` naming collision.** Two different things share this name, and conflating them causes unnecessary refactors:

- `studioHost` and `metadata.externalStudioHost` as **read** fields on the project information API response are deprecated, because a project can now host multiple Studios and a single field cannot represent them all. There is currently no public replacement for listing studio deployments programmatically. If a project reads either field from the projects API, that genuinely needs attention.
- `studioHost` as a **write** option in `defineCliConfig`, which tells `sanity deploy` which hostname to target, is a different surface. It is used throughout the hosting and deployment documentation, including the recommended pattern of configuring `projectId`, `dataset`, and `studioHost` via environment variables for building multiple Studios from one codebase. `sanity undeploy` also targets the host from CLI config.

Note that `studioHost` does not appear in the CLI configuration reference's property table while the deployment documentation uses it. That inconsistency is worth flagging to the reader as something to confirm, but it is not itself evidence that the CLI option is being removed. Describe the current documented state and do not speculate about future releases.

`deployment.appId` is **not** a replacement for `studioHost`. `appId` identifies an already-deployed Studio and exists to enable fine-grained auto-update version selection. The two are complementary, and `appId` provides little benefit while `autoUpdates` is `false`.

**Deploying and hostname assignment.** Hostname assignment happens through the CLI. A first `sanity deploy` prompts for a hostname interactively. `sanity deploy --url <hostname>` sets it non-interactively, `--title` names a newly created studio, and `--dry-run` reports what would be created without creating it, which is useful when rolling out across many deployments. Renaming, hiding from Dashboard, and removing a studio are available on the project's Studios tab in Sanity Manage.
