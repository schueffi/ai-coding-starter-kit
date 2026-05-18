-- ============================================================
-- Migration 004: Denormalized counts + Full-Text Search
-- PROJ-3: Idea Feed & Browse backend support
-- ============================================================

-- 1. Add denormalized count columns to ideas
ALTER TABLE ideas
  ADD COLUMN vote_count    integer NOT NULL DEFAULT 0,
  ADD COLUMN comment_count integer NOT NULL DEFAULT 0;

-- 2. Backfill counts from existing rows
UPDATE ideas SET
  vote_count    = (SELECT COUNT(*) FROM votes    WHERE idea_id = ideas.id),
  comment_count = (SELECT COUNT(*) FROM comments WHERE idea_id = ideas.id);

-- 3. Index for "Top" sort (most-voted first)
CREATE INDEX idx_ideas_vote_count_desc ON ideas (vote_count DESC);

-- 4. Trigger function: keep vote_count in sync
CREATE OR REPLACE FUNCTION update_idea_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET vote_count = vote_count + 1 WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_idea_vote_count() FROM PUBLIC;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_idea_vote_count();

-- 5. Trigger function: keep comment_count in sync
CREATE OR REPLACE FUNCTION update_idea_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET comment_count = comment_count + 1 WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_idea_comment_count() FROM PUBLIC;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_idea_comment_count();

-- 6. Full-text search vector column
ALTER TABLE ideas ADD COLUMN search_vector tsvector;

-- 7. Backfill search_vector for existing ideas
UPDATE ideas SET
  search_vector = to_tsvector('german',
    coalesce(title, '') || ' ' || coalesce(description, '')
  );

-- 8. GIN index for fast FTS lookups
CREATE INDEX idx_ideas_search_vector ON ideas USING GIN (search_vector);

-- 9. Trigger function: keep search_vector current on insert/update
CREATE OR REPLACE FUNCTION update_idea_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('german',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_idea_search_vector() FROM PUBLIC;

CREATE TRIGGER on_idea_upsert_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_idea_search_vector();
