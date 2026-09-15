# Episerver / Optimizely CMS to Sanity

Optimizely CMS (formerly Episerver) models content as typed pages, reusable
blocks, and — in the SaaS product — composed experiences. Remodel by editorial
meaning rather than by the old template tree.

## What to Determine First

- **Variant:** CMS (SaaS / headless) or traditional/self-hosted (CMS 12 or older
  Episerver). This decides which APIs and export formats exist.
- **Access:** admin UI, Content Management API, Optimizely Graph / Content Graph,
  or only an exported `.episerverdata` file / SQL Server dump.
- **Scope:** which content types (pages, blocks/components, media, experiences),
  language branches, drafts/unpublished versions, and assets are in scope.
- **Rich text:** how `XhtmlString` properties are used, and whether they embed
  blocks or dynamic/personalized content.
- **Composition:** whether the site uses `ContentArea` properties (blocks) and/or
  SaaS Visual Builder **Experiences** (sections/rows/columns/elements).
- **Relationships:** ContentReference/ContentLink properties, link collections,
  categories/taxonomies, and shared vs local blocks.

## Extraction Paths

Prefer the most structured source that covers the required scope. Snapshot all
raw responses/files to disk before transforming.

- **Manifest (content definitions):** `GET https://api.cms.optimizely.com/v1/manifest`
  returns `locales`, `contentTypes` (each with a `key` and `baseType` such as
  `_page`, `_component`, `_media`, `_experience`), `propertyGroups`, and
  `displayTemplates`. Use `?sections=contentTypes,propertyGroups` and
  `?includeReadOnly=true`. This is the fastest way to learn the model and design
  Sanity schema.
- **Episerver Data package (`.episerverdata`):** a compressed package
  (`application/vnd.optimizely.cms.episerverdata`) that can contain content,
  definitions, and assets. Export from the UI (**Settings > Export Data**);
  import/inspect via UI or the experimental `POST /v1/experimental/packages`
  endpoint. Best complete file-based snapshot. Unzip and parse the contained
  XML/JSON; extract binaries separately for large media (packages cap around
  500MB–2GB).
- **Content Management API (SaaS):** `api.cms.optimizely.com/v1` for content items
  with version/status, including drafts when authorized.
- **Optimizely Graph / Content Graph:** GraphQL endpoint (app key + secret) for
  fast bulk extraction of published content and frontend parity.
- **Content Delivery API (traditional):** REST JSON for published content on
  self-hosted CMS 12 and earlier.
- **SQL Server dump (traditional):** complete but requires joins across
  `tblContent`, `tblContentProperty`, and `tblWorkContent` (drafts). Use only when
  APIs/exports are unavailable.

See Optimizely's import/export documentation for the Manifest and Episerver Data
formats: <https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/import-and-export-data>.
Append `.md` to any Optimizely docs page for a markdown version.

## Content States and Locales

- **Status:** Optimizely tracks published vs draft (CommonDraft / work versions).
  Import published data to `<documentId>`; import draft-only or "changed" content
  to `drafts.<documentId>` when drafts are in scope. Published-only APIs (Content
  Delivery API, Graph without preview) omit drafts.
- **Language branches:** each locale is a language branch of the same content.
  Use document-level localization unless the project requires field-level:
  - Base document ID from the ContentGuid; translations as `<id>__i18n_<locale>`
    with `translation.<id>` metadata.
  - Create a translation document only when that locale has real values; do not
    copy language-fallback values into translations without recording it.
  - Determine the base/default locale from the manifest `locales`, not assumptions.

## Mapping to Sanity

Map by `baseType` and editorial meaning:

- `_page` maps to a Sanity `document` (a routable page, or a semantic entity such
  as `article`, `person`, or `product` when the page really represents one).
- `_component` (block): reused/shared blocks become referenceable documents;
  local/one-off blocks become embedded objects.
- `_media` maps to a Sanity image/file asset (with alt/description metadata where
  present).
- `_experience` (Visual Builder composition) maps to a page builder array; map
  sections/rows/columns/elements to named object types, or flatten to a section
  array when the grid is presentation-only.
- Property types:
  - `String` / `LongString` map to `string` / `text`.
  - `XhtmlString` maps to Portable Text (see Transformation Notes).
  - `ContentReference` / `ContentLink` (single) map to `reference`.
  - `ContentArea` maps to an array of references (shared blocks) and/or inline
    objects (local blocks), preserving order.
  - `Url` / `LinkCollection` map to link object(s) or an array of link objects.
  - `Date`/`DateTime` map to `datetime`; `Number`/`FloatNumber` map to `number`;
    `Boolean` maps to `boolean`.
  - Categories/tags used as taxonomy should be promoted to reference documents
    created before the content that references them.

Use `baseType` plus the content-type `key` as the discriminator for type mapping.
Preserve the ContentGuid, ContentReference id, and original URL in migration
metadata for identity, redirects, and debugging.

## Transformation Notes

- **Identity:** derive `_id` from the ContentGuid (stable across environments).
  Avoid the integer ContentReference id as canonical identity — it is
  environment-local. Use stable `_key`s for generated arrays.
- **XhtmlString to Portable Text:** convert HTML with `@portabletext/block-tools`
  and `JSDOM` and schema-aware deserializers. Preprocess TinyMCE artifacts: empty
  paragraphs, `&nbsp;` spacers, inline styles, `<span>` wrappers, tables, and
  double-encoded entities.
- **Embedded blocks in rich text:** XhtmlString can embed blocks or content
  fragments (for example `data-contentgroup` / dynamic content markup). Map each
  to a Portable Text custom object or a reference block, or record it as a skipped
  unsupported block — do not silently drop it.
- **ContentArea:** resolve each item to its target block; shared blocks become
  references, local blocks become inline objects. Keep source order.
- **Slugs/paths:** build slugs from `RouteSegment`; reconstruct hierarchical URLs
  from the parent tree and record legacy URLs for redirects.
- **Lookup maps:** build ContentGuid to Sanity `_id` and asset to Sanity asset
  maps before transforming documents that reference them.
- **Quality log:** track missing required fields, unresolved references, failed
  asset lookups, unknown content types, and rich-text conversion warnings.

## Load Order

1. Assets (or an asset manifest) from `_media` content and package binaries.
2. Taxonomies/categories and shared/reused blocks promoted to documents.
3. Page and experience documents with deterministic IDs and scalar fields.
4. References and ContentArea links (emit deterministic refs, or run a patch pass).
5. Translation metadata documents linking all language branches.

Import referenced documents before the documents that reference them; use
`sanity dataset import --replace` or `createOrReplace`/`createIfNotExists` so
reruns are idempotent.

## Gotchas

- **SaaS vs traditional divergence:** APIs, base types, and export capabilities
  differ. Confirm the variant before choosing an extraction route.
- **Not exported into SaaS:** personalized content, visitor groups/criteria, DDS
  data, categories, and frames do not import into CMS (SaaS). If the source is
  traditional and relies on these, plan explicit handling or an intentional drop.
- **Package limits:** `.episerverdata` has size and execution-time limits; export
  large media separately and verify binaries (non-zero size, correct type).
- **ContentReference instability:** integer content ids are environment-local;
  always key identity on ContentGuid.
- **Language fallbacks:** a language branch may render inherited default-language
  values. Detect identical values before treating a locale as truly translated.
- **Experimental endpoints:** the SaaS Packaging REST endpoints are experimental
  and may change; prefer the UI export for a reliable snapshot when unsure.
- **Rich text drift:** author-edited XhtmlString can contain layout tables,
  scripts, and arbitrary HTML needing manual cleanup and custom deserializers.

## Validation Checklist

- Compare content counts by `baseType`/content type, locale, and status against
  the source (manifest plus API/package).
- Confirm every Optimizely content type is mapped, consolidated, or intentionally
  skipped.
- Confirm all ContentReference/ContentArea targets resolve to existing Sanity
  document IDs.
- Spot-check XhtmlString conversions with embedded blocks, tables, lists, and
  links; verify `body` is a Portable Text array, not an HTML string.
- Verify shared blocks became single canonical documents referenced by all users.
- Verify every asset resolves to a Sanity asset (non-zero binaries, alt text).
- Verify language branches produce correct slugs, locale fields, and translation
  metadata.
- Crawl legacy Optimizely URLs and verify redirects and metadata on the new
  frontend.
