# Boundary: into Studio v4

Covers the v3 to v4 crossing and everything inside the v4 line. Read this file only if the span crosses or lands in v4.

Within-line coverage for this file: **4.0.0 through 4.22.1**, verified 2026-09-04. The v3 line below 3.91.0 has no changelog source; `boundaries.md` explains why and what to report.

---

## 1. v3 to v4

A deliberately small boundary. The official guide describes it as requiring minimal, if any, application changes.

| Change | Applicability condition |
| --- | --- |
| **Node.js 20.19 becomes the minimum.** `engines.node` goes from `>=18` on the v3 line to `>=20.19` at 4.0.0. | Check `engines.node`, `.nvmrc`, CI runner images, and the build host. Applies if any run Node 18, or Node 20 earlier than 20.19. |

**The patch component is not a detail to round off.** The floor is 20.19, not 20. A project on Node 20.9 satisfies "Node 20" and still fails to install. Read the resolved Node version to its patch and compare it to the range, rather than comparing majors.

The boundary itself is otherwise additive. **But do not carry "everything else in v4 is additive" into the v4 line**, which is what the official guide's framing invites and what section 2 below exists to correct: the Node floor moves twice more inside the line, and several defaults change.

Source: `https://www.sanity.io/docs/help/v3-to-v4`

---

## 2. Within the v4 line

Shipped in minor releases. None of this carried a breaking-change label, and the boundary guide's "minimal, if any, application changes" framing does not cover it.

### The Node floor moves twice inside the line

This is the highest-value item in the section, because it breaks an upgrade that followed the boundary guide correctly. Verified two ways: the `engines.node` field read from the registry manifest for each release, then each range evaluated with `semver.satisfies` rather than by eye.

| Releases | `engines.node` | Accepts | Rejects |
| --- | --- | --- | --- |
| 4.0.0 to 4.3.x | `>=20.19` | 20.19 and newer | below 20.19, so Node 20.9 fails |
| **4.4.0 only** | `>=20.19 >=22.12.0` | **22.12 and newer, and nothing else** | 20.19, 21.x, 22.0 to 22.11 |
| 4.5.0 to 4.22.1, and the whole v5 line | `>=20.19 <22 \|\| >=22.12` | 20.19 through 21.x, plus 22.12 and newer | below 20.19, and **22.0 through 22.11** |

**4.4.0's range is an accident.** Two space-separated comparators are an AND in semver, so `>=20.19 >=22.12.0` collapses to `>=22.12.0` and the 20.19 clause is dead. A project on Node 20.19 installs 4.3.0 fine and cannot install 4.4.0. 4.5.0 fixed it.

Applicability: read the resolved Node version for local, CI, and the build host, then check it against the row for the stop being planned, not against the row for the target.

Two consequences worth stating in the plan:

- **A stop inside 4.4.0 is the wrong stop.** If a sequence lands there, move it to 4.5.0 or later. There is no reason to stop on the one release with a malformed range.
- **Node 22.0 through 22.11 is a dead band** from 4.5.0 all the way through the v5 line. It is easy to miss because it sits *above* the floor most people remember, so a team that upgraded Node to "22" to get ahead of the v6 requirement can land inside it and be rejected by releases that Node 21 installs fine. The fix is the same 22.12 move v6 needs anyway.

**Evaluate these ranges, do not read them.** `>=20.19 <22 || >=22.12` looks at a glance like it excludes Node 21, and it does not: `>=20.19 <22` accepts all of 21.x. Getting that backwards produces a confident, specific, wrong instruction to change a Node version that was already fine. One line settles it:

```sh
node -e "console.log(require('semver').satisfies('21.7.3','>=20.19 <22 || >=22.12'))"
```

### Defaults that changed

| Version | Change | Applicability condition |
| --- | --- | --- |
| 4.14.0 | **`scheduledDrafts` config option added, on by default.** | Applies to every project crossing this release. Relevant alongside the scheduled publishing deprecation in `deprecations.md`: a project that deliberately avoided scheduled publishing gets scheduled drafts switched on without asking. Confirm which behavior the team wants rather than assuming the default is fine. |
| 4.16.0 | **The `typography` plugin for Portable Text inputs was added and then disabled by default in the same release.** | Matters mainly as context for the v5 boundary, where the same behavior is turned **on** by default. See section 1 of `boundary.v5.md`. A project crossing 4.16 to 4.22 saw straight quotes preserved; the v5 bump silently reverses that. |
| 4.16.0, then 4.18.0 | **`enhancedObjectDialog` default flipped on, reverted, then made opt-out.** | Only if the config sets `beta.form.enhancedObjectDialog`. The end state matters more than the churn: 5.12.0 removes the option and makes the dialog unconditional, per section 2 of `boundary.v5.md`. So a project holding the flag at `false` should plan for the dialog arriving regardless. |

### Removals and type changes

| Version | Change | Applicability condition |
| --- | --- | --- |
| 4.12.0 | **`useRawPerspective` removed** in favour of `perspective`. | `grep -rn "useRawPerspective" src/` |
| 4.6.0 | The `'strike'` and `'strike-through'` decorator names were disambiguated in the types. | Applies to Portable Text schemas that declare a strikethrough decorator, and to any code matching on the decorator name. Grep for both spellings. |
| 4.5.0 | **`image` data marked as required for TypeGen.** | Only if TypeGen is in use. Generated types for image fields change shape, so expect new type errors in consumers, which are often in another repository. |
| 4.20.0 | Internal `ServerStyleSheet` usage removed. | No action here. The related item that needs a code change is the removal of the re-export from `sanity` at 5.2.0, in section 2 of `boundary.v5.md`. |

### Notes

**4.22.1 is the final v4 release**, published under the `maintenance-v4` dist-tag. It is the right intermediate stop before v5, and it is a patch above the last minor, so do not stop at 4.22.0.
