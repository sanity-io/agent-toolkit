# Major boundary knowledge

```
LAST_VERIFIED:            2026-09-04
BOUNDARIES_COVERED:       v3→v4, v4→v5, v5→v6
WITHIN_LINE_VERIFIED_FROM: sanity 4.0.0
WITHIN_LINE_VERIFIED_THROUGH: sanity 6.12.0
UPSTREAM_CHANGELOG_STARTS: sanity 3.91.0   ← see "the v3 line" below
```

**This file has two edges, and both matter.** Treat it as a cache with known limits, not as a complete list.

**Above the upper bound.** Anything released after `WITHIN_LINE_VERIFIED_THROUGH` is unknown here. Fetch the changelog for that remainder. This edge decays continuously: a new `sanity` minor ships most weeks, so assume it is stale and check rather than trusting the date above.

**Below the lower bound.** The boundary files cover every crossing from v3 onward. Their **within-line** content starts at 4.0.0. A project starting below that is inside the v3 line, which this file does not curate release by release, for the reason in the next paragraph.

So if the current version is below `WITHIN_LINE_VERIFIED_FROM`, **fetch what you can for the range from the current version up to that lower bound**, and read the rest of this note before reporting the result. A project on 3.76 crossing to 6.12 needs one fetch at the bottom, 3.76 to 4.0.0, and none at the top while the upper bound is current.

**The v3 line, and why its gap is different from an ordinary gap.** The upstream `CHANGELOG.md` in `sanity-io/sanity` begins at 3.91.0. There is no consolidated machine-readable changelog for 3.0.0 through 3.90.x in that repository, and the tagged trees for those releases do not contain the file either. So for a project starting mid-v3, the fetch instruction above **will come back thin, and thin is not clean.**

This is the one place where an empty result must never be reported as a finding. Say plainly that the release-by-release history for that range is not available from the changelog, that the v3 to v4 boundary itself is verified (section 1 of `boundary.v4.md`) while the interior of the v3 line is not, and put the residual risk in the human questions section. A project crossing the whole v3 line to v6 is dominated by the boundary changes and the curated v4, v5 and v6 line items anyway, so this gap is survivable when it is declared. It is only dangerous when it is silent.

The failure this whole note prevents: without the lower bound declared, an agent trusts the file for a range it never examined and reports "nothing in this boundary applies," which reads as a verified finding and is actually an unexamined gap. **Never assert that a range is clean unless it falls inside the two bounds above or you fetched it yourself and got real content back.**

Fetch instructions are in `version-lookup.md`.

Each item carries an applicability condition. If the condition cannot be evaluated from the repository, the item belongs in the human questions section of the report, not in the findings.

## Which files to read

**This file is the index. The boundary content lives in one file per major**, so a span that crosses one boundary loads one file instead of all of them.

| Read | When |
| --- | --- |
| `boundary.v4.md` | The span crosses v3 to v4, or lands anywhere in the v4 line |
| `boundary.v5.md` | The span crosses v4 to v5, or lands anywhere in the v5 line |
| `boundary.v6.md` | The span crosses v5 to v6, or lands anywhere in the v6 line |
| `deprecations.md` | Always. It is short and not tied to a boundary |

Each boundary file contains the crossing *into* that major plus the undeclared changes *inside* that major's line, because a span that crosses a boundary almost always lands somewhere in the line above it and needs both.

Worked example: a project on 5.31.1 going to 6.12.0 reads this file, `boundary.v6.md` and `deprecations.md`. It does not read the v4 or v5 files, and loading them would only invite findings that do not apply.

Studio v2 is out of scope. See the scope section of `SKILL.md`; detection and the stop behavior live there and in `detect.md`.

---

## Why minor releases matter as much as majors

Across the whole span from 4.0.0 to 6.12.0, exactly three releases carried a formal breaking-change footer: 4.0.0, 5.0.0 and 6.0.0. Everything else in the per-boundary files shipped in a minor or patch release as a removal, a deprecation, or a changed default, without a breaking-change label.

The sharpest example is in section 2 of `boundary.v4.md`. The `engines.node` field changed shape four times inside the v4 line, and one of those changes made a minor release refuse to install on the Node version its own boundary guide told you to be on. Nothing about that carried a breaking-change label.

This is the single most useful thing these files contain, because nobody reads forty sets of minor release notes. When you fetch the changelog for the remainder of the span, look for the same pattern rather than only checking major boundaries.
