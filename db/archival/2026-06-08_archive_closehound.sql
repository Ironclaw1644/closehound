-- ============================================================================
-- Phase 0d — Archive the abandoned CloseHound lead-gen schema
-- ============================================================================
-- Applied to the shared "WalkPerro" Supabase project (ref kflzqkuioiiyfrvlvcvl)
-- on 2026-06-08 via the Supabase MCP `apply_migration` tool (migration name:
-- `archive_closehound_leadgen`).
--
-- IMPORTANT: This project hosts 8+ live products in separate schemas. The local
-- supabase/migrations/ directory is OUT OF SYNC with the remote migration
-- history, so this archival is applied via apply_migration, NOT `supabase db
-- push`. Do not `db push` against this project.
--
-- Effect: takes the legacy closehound.com operator dashboard offline (intended,
-- the product is abandoned). NON-DESTRUCTIVE and fully reversible — every row is
-- preserved under closehound_legacy. walkperro / athome_family_services_llc /
-- summer / draftdispute / countime / bayoubids / tinta / sunbiz and public.*
-- shared tables are untouched. Pre-flight confirmed zero cross-schema deps.
--
-- Note on the stale public.template_image_candidates (13 rows, superseded by the
-- 117-row copy already inside the schema): only its PRIMARY KEY *index* collides
-- with the same-named index already in closehound_legacy (indexes are
-- schema-scoped relations). Check/FK constraint names are per-table in Postgres,
-- so they don't collide. We rename just the pkey index, then move the table in.
-- ============================================================================

-- ---- UP -------------------------------------------------------------------
ALTER SCHEMA closehound RENAME TO closehound_legacy;

ALTER INDEX public.template_image_candidates_pkey
  RENAME TO template_image_candidates_legacy_public_pkey;
ALTER TABLE public.template_image_candidates
  RENAME TO template_image_candidates_legacy_public;
ALTER TABLE public.template_image_candidates_legacy_public
  SET SCHEMA closehound_legacy;

-- ---- DOWN (run via apply_migration if you ever need to restore) ------------
-- ALTER TABLE closehound_legacy.template_image_candidates_legacy_public SET SCHEMA public;
-- ALTER INDEX public.template_image_candidates_legacy_public_pkey RENAME TO template_image_candidates_pkey;
-- ALTER TABLE public.template_image_candidates_legacy_public RENAME TO template_image_candidates;
-- ALTER SCHEMA closehound_legacy RENAME TO closehound;
