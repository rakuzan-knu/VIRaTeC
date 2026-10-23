-- Up to three owners can exist at any time
DROP INDEX IF EXISTS "users_single_owner_idx";

CREATE OR REPLACE FUNCTION "enforce_owner_limit"() RETURNS trigger AS $$
BEGIN
  IF NEW."staffRole" = 'OWNER' AND (TG_OP = 'INSERT' OR OLD."staffRole" IS DISTINCT FROM 'OWNER') THEN
    PERFORM pg_advisory_xact_lock(hashtext('users_owner_limit'));
    IF (SELECT COUNT(*) FROM "users" WHERE "staffRole" = 'OWNER' AND "id" <> NEW."id") >= 3 THEN
      RAISE EXCEPTION 'At most 3 owners are allowed' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_owner_limit"
  BEFORE INSERT OR UPDATE OF "staffRole" ON "users"
  FOR EACH ROW EXECUTE FUNCTION "enforce_owner_limit"();
