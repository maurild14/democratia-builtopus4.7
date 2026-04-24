# 17 — Open Source and Contributor Structure

## License — AGPL-3.0

Chosen because it obligates any fork deployed as a service to publish its code under the same license. This protects the project from proprietary forks that capture value (e.g., a government forks the code and closes it) without contributing back.

## Issue labels

```
good-first-issue         # Issues prepared for new contributors (clear scope, context included)
help-wanted              # Issues where we need help
package:ui               # UI components
package:llm              # Prompts and LLM
package:geo              # Geographic data
package:clustering       # Algorithms
package:db               # Schema and migrations
feature:radar            # Civic Radar
feature:deliberation     # Deliberation pipeline
feature:moderation       # Moderation system
bug                      # Bug report
docs                     # Documentation
i18n                     # Translations
```

## Good-first-issues prepared for launch

To attract contributors from day 1, prepare these concrete, scoped issues **before publishing the repo:**

- Add swipe animation to statement cards (`packages/ui`)
- Implement dark-mode toggle (`apps/web`)
- Translate UI to Spanish (i18n)
- Add unit tests to the clustering module
- Document the public API with an OpenAPI spec
- Implement offensive-pseudonym validation
- Create pipeline-progress component (5 nodes)
- Implement infinite scroll on thread list

## CONTRIBUTING.md content

The root `CONTRIBUTING.md` must include:

- **Local setup** step-by-step (pnpm install, Supabase CLI, env vars, run dev).
- **Monorepo structure** with explanation of each package (point to [11-monorepo-structure.md](11-monorepo-structure.md)).
- **How to contribute to each area:** frontend, prompts, geo, clustering, i18n.
- **Code conventions:** TypeScript strict, conventional commits, no-any policy.
- **PR review process:** CODEOWNERS review, CI must pass, at least one approval.
- **How to add a new country/city:** create `packages/geo/sources/<country>.ts` following the existing shape, register in the seed script, open a PR with a sample query confirming zones loaded.
- **How to propose a new prompt version:** create `packages/llm/prompts/v2/<prompt>.ts`, add evals, run `pnpm eval:llm`, ensure >95% pass rate.

## Documentation site

A separate Astro Starlight or Docusaurus site in `apps/docs/`. Publishes:
- Architecture overview (this documents/ folder rewritten for outside audiences).
- Public API reference (OpenAPI → docs generator).
- Prompt catalog (what each prompt does, input/output shape, eval scores).
- Deployment guide for self-hosters.

Starlight vs. Docusaurus choice: [19-open-questions.md Q3](19-open-questions.md).

## Governance

Commit rights to `main` restricted to core maintainers. All changes go through PRs. CODEOWNERS defines reviewers per directory (e.g., LLM changes require LLM owner approval).

## Code of Conduct

Based on Contributor Covenant v2.1.
