# Report template

Write to `SANITY-UPGRADE-PLAN.md` in the repository root unless the user names a different path.

## Rules for filling it in

**R1 to R7 in `SKILL.md` apply to everything below** and are not restated here. The rules in this file are the ones specific to writing the document.

**Omit sections that have no content.** An empty "Custom code" heading is noise. The structure below is a menu, not a form to complete.

**State what is already satisfied.** Requirements the project already meets belong in section 2 as one-liners. It is what tells the reader the upgrade is smaller than they feared, and it stops them re-checking what you checked.

**Section 2 carries the highest cost per error in the document**, because of that last clause: everywhere else a mistake is something the reader trips over, here it is an instruction not to look. The bar for "no change needed" is higher than for a finding, not lower. R7 is the one that bites here.

**Never include an item you could not evaluate.** It goes in the questions section. A finding implies you found something.

**Never assert plugin compatibility you did not verify**, in either direction. Ownership decides the path when something is incompatible, not whether it is.

**Mark an unverified API shape at the snippet, not in the prose around it.** Format is `// VERIFY: <what to check> - <where to check it>`, inline, immediately above or beside the code. A hedge two sentences later does not travel: the snippet gets copied out of the document and the caveat stays behind. See section 8 below.

**Weight findings by severity, and never let the format flatten them.** Severity is likelihood of breaking something multiplied by how hard it is to notice, so silent failures outrank loud ones: a build error gets fixed in ten minutes, a stylesheet that silently stops applying ships to production. Group by what the reader has to do, put silent failures at the top of their group, and demote no-action items out of the main tables.

**Stay inside the upgrade.** Unused dependencies, stale type packages that block nothing, and tidiness in trees the Studio does not deploy from are not upgrade findings. Leave them out or give the whole set one closing line. A plan that drifts into code review spends the reader's attention on things that do not gate the work.

**Describe the state of the tree, not the decisions that produced it.** "The deploy pipeline builds from the caret ranges rather than the lockfile" and "whoever set up CI misconfigured it" carry the same information; only one gets acted on. Reserve "you" for what to do next. This is about attribution, not certainty: keep the evidence and the severity exactly as strong as they are.

**One tree per plan.** Name the lockfile every version came from in the header and take all of them from that tree. A version read from a sibling tree looks authoritative and describes a different install.

**Length is a symptom, not a target.** Never trim a finding that carries file-level evidence to hit a word count. Two checks cut the length that should not be there:

- **A finding without file-level evidence is changelog leakage.** If "applies because" names no file, line, script, or grep result, applicability was never tested. Remove it or move it to the questions.
- **More than roughly fifteen action rows on a three-boundary span** means re-test applicability before accepting the number.

**Link sources.** Every non-obvious claim carries a link to the changelog entry or doc it came from.

---

## Template

````markdown
# Sanity Studio upgrade plan

**Repository:** <path or name>
**Planning for:** <the tree this plan covers, e.g. `studio/` via `studio/pnpm-lock.yaml`. Name the lockfile every version below came from. If the repository has other trees, list them and their `sanity` versions here too.>
**Generated:** <date>
**Current:** sanity <resolved version, from that lockfile>
**Target:** sanity <version> <`latest`, with its publish date. Recommend `latest` unless the reader has stated a constraint; if they have, say so and give the pin a review date. Add one clause naming the fallback so they can overrule you, without building out a second plan for it. **If `latest` published within the last few days, give the date rather than "recently", state what differs in the previous minor, and put the soak-time choice in section 9** rather than leaving it as a header aside. See section 5 of `version-lookup.md`.>
**Span:** <n> major boundaries: <list them>

> Version data retrieved from the npm registry on <date>. Re-verify before acting on this plan if significant time has passed.

## Start here

<**Required, and it must fit on one screen.** Everything below this block is reference material to be read section by section as the work reaches it. This block is the plan.

It contains four things and nothing else:

1. **The sequence**, one line per stop: the version, and the three-to-six-word reason for the stop. No detail; section 10 has it.
2. **Anything that invalidates the plan if skipped**, stated first if it exists. A deploy pipeline that builds a different tree, an unreachable stop, a blocking plugin. One line each.
3. **The changes that fail silently**, by name. These are the reason this block exists: they are the items a reader most easily misses in a table and most expensively discovers in production.
4. **What needs a decision from a human before the work starts**, as a pointer to section 9 with the count. Not the questions themselves.

Introduce nothing here that is not covered below, and repeat nothing here that does not need to be seen first. If this block cannot be written in a screen, the plan has not decided what matters.>

## 1. Summary

<Two or three sentences of sizing, then the two or three things that make this more than a dependency bump. This is the narrative version for someone deciding whether to schedule the work, where the Start here block is the work list for whoever does it, so do not restate that block.

If the honest answer is "a dependency bump plus three edits," say that. If it is "a rewrite of the configuration layer," say that. Frame the hard parts as consequences rather than faults: "fix this first or every stop below is theoretical" says what is at stake without telling anyone they made a mistake.>

## 2. Already satisfied

<One line each, for requirements the project already meets. Include the evidence.>

- Node.js: requirement is >= X, project is on Y
- React: requirement is >= X, project resolves to Y
- No `auth` block in config, so the v6 auth provider change does not apply
- No `data-slate` references, so the 6.3.0 Portable Text DOM change does not apply

## 3. Needs attention before you start

<Open the section with one sentence saying why it is here, in the report itself and not only in this template: these conditions exist in the current tree before any version changes, they may already be causing behavior the team has noticed, and leaving them in place adds variables to every step below. Without that sentence the reader meets a list of faults with no stated purpose, which is the wrong first impression and the wrong reading of what the list is for.>

<Include only what affects the upgrade. Qualifying: duplicate majors of a shared package, a plugin already violating its own peers, a deploy pipeline building from a different manifest or lockfile than the tree being planned, undeclared imports resolving only through hoisting, relaxed peer resolution masking conflicts. Not qualifying: unused dependencies, stale type packages that block nothing, tidiness in a tree the Studio does not deploy from. Those can have one closing line between them, or none.>

<**Order by consequence and say which is load-bearing.** If one of these makes the rest of the plan theoretical when skipped, it goes first and says so plainly. The others follow. A flat list of seven equally weighted items reads as an audit; the same seven, with the one that gates everything named as such, reads as a plan.>

<For each: what the current state is, the evidence, and what it affects downstream. Describe the tree, not the decisions behind it. Give specific versions and what pulled each one in.>

## 4. Requirements to meet

<Hard floors that are not yet met. Node, React, TypeScript settings. Each with where it needs changing: engines, .nvmrc, CI, build host. A requirement the project already satisfies goes in section 2, not here.>

## 5. Breaking changes that apply

<**Group by what the reader has to do, not by which boundary the change came from.** Boundary is a column, not a heading. Grouping by boundary mirrors the changelog's structure rather than the work's, and it puts a build-breaking import next to a cosmetic default at identical weight, which is exactly how the important row gets missed. The boundary still matters for sequencing, so keep it visible per row and let section 10 order the work.>

<For each item: what changed, why it applies here (the evidence you found), what to do, and a source link. Include the failure mode when it is non-obvious.>

### Breaks the build or the Studio

<Loudest and cheapest to find, but still first because nothing else can be tested until these are done. Failures that are silent go at the top of this group and say so, since a silent failure outranks a loud one of the same size.>

| Change | Boundary | Applies because | Action |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

### Changes behavior, needs a decision

<Defaults that flipped, strategies that changed, anything that writes different data or shows editors something different. Each one needs an owner or a decision, not just an edit. Cross-reference section 9 where the decision belongs to a human.>

| Change | Boundary | Applies because | Decision |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

### Worth knowing, no action

<Everything that applies but requires no change: informational defaults, deprecations still functional at the target, items already covered by another section. **Keep these out of the tables above.** One line each, as a plain list, so they are on the record without competing for attention with work that has to happen.>

- <version, boundary> ... (informational)

## 6. Dependency changes

<A single code block the reader can diff against their package.json. Comment each changed line with the old value and the reason. Include additions for missing peer dependencies.>

```jsonc
"dependencies": {
  "sanity": "<version>",              // was <version>
  ...
}
```

<Then the dedupe verification command and what to expect from it.>

## 7. Plugins

<A row per plugin. The owner column states what the registry `repository` field showed, not a support level. Keep compatible plugins to one line each; they are routine.>

| Plugin | Installed | Latest | Peer `sanity` | Owner | Verdict |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | `sanity-io` / third party / private | compatible, bump to X / **blocked** / needs a decision |

<Then one short subsection per blocked plugin: what it is used for, why it blocks, and the recommended next step. Use a heading that makes ownership unambiguous, so a Sanity-maintained gap is not mistaken for the reader's homework.>

### Blocked on a Sanity-maintained plugin: <name>

<Installed version, latest version and publish date, its declared peer range, the target it does not accept, and what breaks without it. State that this is being raised with Sanity rather than implying a date. Give only the honest interim options.>

### Blocked on a third-party plugin: <name>

<The evidence: last publish date, peer range, whether the repo is archived, whether an issue or PR already tracks the target. Then the recommended step from the ladder, including whether the plugin is still needed at all.>

## 8. Code changes

<Only if there are any. File path, then the specific edit. Show before and after for anything mechanical. If there are many instances of one pattern, give the count and one example rather than listing all of them.>

<**Every snippet whose API shape you did not read from the package carries an inline marker.** Verified snippets carry nothing; the absence of a marker is the claim that you checked. Format:>

```ts
// VERIFY: export name and signature - check the plugin README and its
// package.json `exports` map before running this
import {someHelper} from 'some-plugin/subpath'
```

<Use `VERIFY` rather than `UNVERIFIED`. The information is identical and the imperative is more useful: it tells the reader what to do about it, and it does not read as a disclaimer about the document as a whole.>

<Do not replace the marker with a sentence in the surrounding paragraph. The snippet is what gets copied; the paragraph is not.>

## 9. Questions only you can answer

<The judgment half. Each question should say why it matters and what changes based on the answer. This section is the honest boundary of what static analysis can determine, and it is usually the most valuable part of the plan for whoever has to act on it.>

Typical entries:

- Which Node version runs in CI and on the build host? Detected <X> locally, which may not be the same.
- Do editors find documents by typing the name of a related record? The v6 search default change stops reference-traversed preview fields contributing to matching.
- <Any fact that was out of reach: a tsconfig extending outside the repo, a hoisted dependency, a CI config elsewhere. Name it specifically.>
- Is content consumed by anything that cannot be updated quickly, such as a mobile app or a partner integration? Two default changes write new characters and new marks into stored content.
- Are there plugins from a private registry not visible in the public dependency data?

## 10. Suggested sequence

<Numbered, with intermediate stops at the last release of each major and the reasoning for each stop. Include where to verify before proceeding. For multi-boundary spans, make the stops explicit; for a single boundary, this can be four lines.>

<**A stop that accepts a duplicate major has to show the version walk that justifies it.** Name the candidate versions checked and what each depends on. Without that, an accepted duplicate is indistinguishable from a plugin set that was taken at `latest` and rationalized, which is the most common defect in a multi-stop sequence. See section 5 of `plugins.md`.>

<**Do not schedule work that depends on a working Studio UI at a stop with a duplicate theming package.** A content migration, or any step verified by looking at the Studio, belongs at a stop with a single `@sanity/ui` major.>

<**Every stop needs its plugin versions named, or an explicit note that the stop is provisional.** A stop that says "bump plugins to versions that accept this major, check at execution time" is not a validated step: it hands back the hardest unanswered question in the plan. If you could not resolve a stop, label it provisional and say what needs checking. See section 5 of `plugins.md`.>

<**A skipped stop needs its cost stated, not just its justification.** Dropping a boundary whose only applicable change is a Node floor, or one that cannot be reached without a forced duplicate, is frequently the right call, and the evidence for it belongs here. But the hop that results crosses two majors at once, so add the consequence in the same breath: a failure in that hop could come from either boundary, and isolating it means bisecting rather than consulting this plan. Showing the evidence and omitting the cost makes the trade look free.>

## 11. Test checklist

<Derived from what this repository actually has, not a generic list. If there are no custom document actions, do not include a line about testing them. Split into build-and-types and functional.>

**Build and types**

- [ ] ...

**Functional**

- [ ] ...

## 12. Sources

<Every changelog entry, migration guide, and registry query the plan relied on. The reader should be able to check your work.>
````

---

## What a good report is not

**Not the changelog.** If the report contains items whose applicability was never tested, it has failed at its only real job. The reader can already read the changelog.

**Not padded with generic advice.** "Test thoroughly before deploying" adds nothing. "Publish a document that previously failed validation, because 6.7.0 changed URI validation with custom schemes" is worth reading.

**Not an audit of the repository.** The plan reports the current state only where it bears on the upgrade. Every finding that does not gate the work spends attention that the findings which do gate it needed, and a document that opens with a long list of everything wrong reads as a judgment on the team rather than a route through the work.

**Not flat.** A plan where every finding has the same visual weight has pushed the triage back onto the reader, which is the job it was supposed to do for them. If the most dangerous item in the document is not findable in the first thirty seconds, the structure has failed regardless of how accurate the content is.

**Not falsely reassuring.** If the project imports from `sanity/_internal`, or has forty `@sanity/ui` import sites, or crosses three majors, the report should say the upgrade is substantial. A plan that makes hard work look easy fails the reader more expensively than one that overestimates.

**Not silent about its own gaps.** If a registry lookup failed, if a tsconfig could not be resolved, if the CI config was not found, the report says so. The reader can fill a named gap; they cannot fill one they do not know about.
