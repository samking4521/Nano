


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."ACCOUNT_STATUS" AS ENUM (
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE "public"."ACCOUNT_STATUS" OWNER TO "postgres";


CREATE TYPE "public"."DRIVER_DOCUMENT_TYPE" AS ENUM (
    'NIN',
    'DRIVER_LICENSE',
    'VEHICLE_REGISTRATION_CERTIFICATE'
);


ALTER TYPE "public"."DRIVER_DOCUMENT_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."DRIVER_LICENSE_CLASS" AS ENUM (
    'CLASS A',
    'CLASS B',
    'CLASS C',
    'CLASS D',
    'CLASS E',
    'CLASS F',
    'CLASS G',
    'CLASS H',
    'CLASS J',
    'CLASS V'
);


ALTER TYPE "public"."DRIVER_LICENSE_CLASS" OWNER TO "postgres";


CREATE TYPE "public"."DRIVER_VERIFICATION_AUDIT_TYPE" AS ENUM (
    'NIN',
    'DRIVER_LICENSE',
    'PROFILE_PHOTO',
    'GENERAL',
    'UPDATED_NIN_PHOTO',
    'UPDATED_DRIVER_LICENSE_PHOTO',
    'UPDATED_PROFILE_PHOTO',
    'UPDATED_FIRSTNAME',
    'UPDATED_LASTNAME',
    'UPDATED_LICENSE_EXPIRY_DATE',
    'UPDATED_LICENSE_CLASS',
    'UPDATED_DRIVER_LICENSE_STATUS'
);


ALTER TYPE "public"."DRIVER_VERIFICATION_AUDIT_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."GENDER_ROLES" AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE "public"."GENDER_ROLES" OWNER TO "postgres";


CREATE TYPE "public"."ONLINE_STATUS" AS ENUM (
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE "public"."ONLINE_STATUS" OWNER TO "postgres";


CREATE TYPE "public"."ORDER_ITEM_CATEGORY" AS ENUM (
    'BUILDING MATERIAL',
    'FOOD & BEVERAGES',
    'ELECTRONICS',
    'HOUSEHOLD & PERSONAL ITEMS',
    'MACHINERY & EQUIPMENT',
    'EVENT & COMMERCIAL EQUIPMENT',
    'FURNITURE & APPLIANCES',
    'AGRICULTURAL GOODS',
    'AUTOMOTIVE',
    'RETAIL & MERCHANDISE',
    'INDUSTRIAL MATERIALS',
    'OTHER'
);


ALTER TYPE "public"."ORDER_ITEM_CATEGORY" OWNER TO "postgres";


CREATE TYPE "public"."ORDER_OFFER_STATUS" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'NEGOTIATED',
    'EXPIRED'
);


ALTER TYPE "public"."ORDER_OFFER_STATUS" OWNER TO "postgres";


CREATE TYPE "public"."ORDER_STATUS" AS ENUM (
    'CREATED',
    'SEARCHING',
    'AWAITING_PAYMENT',
    'FUNDED',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
    'T0_PICKUP',
    'TO_STOP_1',
    'TO_STOP_2',
    'T0_STOP_3',
    'TO_DESTINATION'
);


ALTER TYPE "public"."ORDER_STATUS" OWNER TO "postgres";


CREATE TYPE "public"."STAFF_ROLES" AS ENUM (
    'STAFF',
    'SUPER_ADMIN'
);


ALTER TYPE "public"."STAFF_ROLES" OWNER TO "postgres";


CREATE TYPE "public"."USER_ROLES" AS ENUM (
    'SHIPPER',
    'DRIVER'
);


ALTER TYPE "public"."USER_ROLES" OWNER TO "postgres";


CREATE TYPE "public"."VEHICLE_TYPE" AS ENUM (
    'Pickup Truck',
    'Flatbed Truck',
    'Tipper Truck',
    'Box Truck',
    'Van Truck',
    'Container Truck'
);


ALTER TYPE "public"."VEHICLE_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."VEHICLE_VERIFICATION_AUDIT_TYPE" AS ENUM (
    'GENERAL',
    'UPDATED_PLATE_NUMBER',
    'UDPATED_VEHICLE_COLOR',
    'UPDATED_CURRENT_DRIVER',
    'UPDATED_VEHICLE_REG_CERTIFICATE_EXPIRY_DATE',
    'UDPATED_VEHICLE_REG_CERTIFICATE_PHOTO',
    'UPDATED_VEHICLE_PHOTOS'
);


ALTER TYPE "public"."VEHICLE_VERIFICATION_AUDIT_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."VERIFICATION_ISSUES_CODE" AS ENUM (
    'PROFILE_PHOTO_BLURRY',
    'PROFILE_PHOTO_INVALID',
    'PROFILE_PHOTO_MULTIPLE_PEOPLE',
    'FIRST_NAME_MISMATCH_NIN',
    'LAST_NAME_MISMATCH_NIN',
    'DATE_OF_BIRTH_MISMATCH_DRIVER_LICENSE',
    'NIN_PHOTO_BLURRY',
    'NIN_PHOTO_INVALID',
    'NIN_NUMBER_MISMATCH',
    'DRIVER_LICENSE_PHOTO_BLURRY',
    'DRIVER_LICENSE_PHOTO_INVALID',
    'DRIVER_LICENSE_NUMBER_MISMATCH',
    'DRIVER_LICENSE_EXPIRED',
    'VEHICLE_REGISTRATION_PHOTO_BLURRY',
    'VEHICLE_REGISTRATION_PHOTO_INVALID',
    'PLATE_NUMBER_MISMATCH',
    'VEHICLE_TYPE_INCORRECT',
    'VEHICLE_LOAD_CAPACITY_INCORRECT',
    'VEHICLE_FRONT_PHOTO_BLURRY',
    'VEHICLE_SIDE_PHOTO_BLURRY',
    'VEHICLE_FRONT_PHOTO_INVALID',
    'VEHICLE_SIDE_PHOTO_INVALID',
    'FIRST_NAME_MISMATCH_DRIVER_LICENSE',
    'LAST_NAME_MISMATCH_DRIVER_LICENSE',
    'FIRST_NAME_MISMATCH_IDENTITY_DOCUMENTS',
    'LAST_NAME_MISMATCH_IDENTITY_DOCUMENTS',
    'DRIVER_LICENSE_CLASS_MISMATCH',
    'DRIVER_LICENSE_EXPIRY_MISMATCH',
    'PENDING_PROFILE_PHOTO_BLURRY',
    'PENDING_PROFILE_PHOTO_INVALID',
    'PENDING_PROFILE_PHOTO_MULTIPLE_PEOPLE',
    'PENDING_DRIVER_LICENSE_CLASS_MISMATCH',
    'PENDING_DRIVER_LICENSE_EXPIRY_MISMATCH',
    'PENDING_DRIVER_LICENSE_CLASS_PHOTO_INVALID',
    'PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY'
);


ALTER TYPE "public"."VERIFICATION_ISSUES_CODE" OWNER TO "postgres";


CREATE TYPE "public"."VERIFICATION_ISSUES_FIELD" AS ENUM (
    'FIRST_NAME',
    'LAST_NAME',
    'BIRTH_DAY',
    'DRIVER_PHOTO',
    'NIN_NUMBER',
    'NIN_PHOTO',
    'DRIVER_LICENSE_NUMBER',
    'DRIVER_LICENSE_PHOTO',
    'VEHICLE_TYPE',
    'VEHICLE_PLATE_NUMBER',
    'VEHICLE_LICENSE_PHOTO',
    'VEHICLE_PHOTOS',
    'VEHICLE_CAPACITY',
    'DRIVER_LICENSE_CLASS',
    'DRIVER_LICENSE_EXPIRY_DATE',
    'PENDING_DRIVER_PHOTO',
    'PENDING_DRIVER_LICENSE_CLASS',
    'PENDING_DRIVER_LICENSE_EXPIRY_DATE',
    'PENDING_DRIVER_LICENSE_CLASS_PHOTO'
);


ALTER TYPE "public"."VERIFICATION_ISSUES_FIELD" OWNER TO "postgres";


CREATE TYPE "public"."VERIFICATION_ISSUES_SECTION" AS ENUM (
    'PERSONAL_INFO',
    'IDENTITY_INFO',
    'VEHICLE_INFO'
);


ALTER TYPE "public"."VERIFICATION_ISSUES_SECTION" OWNER TO "postgres";


CREATE TYPE "public"."VERIFICATION_STATUS" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE "public"."VERIFICATION_STATUS" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_pending_driver_photo"() RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_issues jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update "Driver"
  set pending_driver_img_key = null,
      pending_driver_img_key_at = null
  where id = v_user_id;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = 'PENDING_DRIVER_PHOTO'::"VERIFICATION_ISSUES_FIELD";

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION";

  return jsonb_build_object(
    'verification_issues', v_issues
  );
end;
$$;


ALTER FUNCTION "public"."clear_pending_driver_photo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_pending_license_data"("p_field" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_issue_fields "VERIFICATION_ISSUES_FIELD"[];
  v_other_field_value text;
  v_cleared_photo boolean := false;
  v_updated jsonb;
  v_issues jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_field = 'license_class' then
    select pending_expiry_date::text into v_other_field_value
    from "Driver_Documents"
    where driver_id = v_user_id and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";

    if v_other_field_value is null then
      update "Driver_Documents"
      set pending_license_class = null,
          pending_document_img_key = null,
          pending_document_img_key_at = null
      where driver_id = v_user_id
        and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
      v_cleared_photo := true;
    else
      update "Driver_Documents"
      set pending_license_class = null
      where driver_id = v_user_id
        and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    end if;

    v_issue_fields := array[
      'PENDING_DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'PENDING_DRIVER_LICENSE_CLASS_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

  elsif p_field = 'expiry_date' then
    select pending_license_class::text into v_other_field_value
    from "Driver_Documents"
    where driver_id = v_user_id and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";

    if v_other_field_value is null then
      update "Driver_Documents"
      set pending_expiry_date = null,
          pending_document_img_key = null,
          pending_document_img_key_at = null
      where driver_id = v_user_id
        and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
      v_cleared_photo := true;
    else
      update "Driver_Documents"
      set pending_expiry_date = null
      where driver_id = v_user_id
        and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    end if;

    v_issue_fields := array[
      'PENDING_DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'PENDING_DRIVER_LICENSE_CLASS_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

  else
    raise exception 'Invalid field: %', p_field;
  end if;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = any(v_issue_fields);

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION";

  select jsonb_build_object('pending_license_class', pending_license_class, 'pending_expiry_date', pending_expiry_date)
    into v_updated
  from "Driver_Documents"
  where driver_id = v_user_id and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";

  return jsonb_build_object(
    'updated', v_updated,
    'verification_issues', v_issues,
    'cleared_photo', v_cleared_photo
  );
end;
$$;


ALTER FUNCTION "public"."delete_pending_license_data"("p_field" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."driver_before_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_uid          uuid := auth.uid();
  v_is_staff     boolean;
  v_is_driver    boolean;
  v_actor        text;
  v_verification "VERIFICATION_STATUS";
  v_allowed      text[];
BEGIN
  -- ------------------------------------------------------------------------
  -- DB owner / service role: full bypass, no restrictions of any kind.
  -- Must be the very first thing checked, before any other logic.
  -- ------------------------------------------------------------------------
  IF current_user IN ('postgres', 'service_role') THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- ------------------------------------------------------------------------
  -- Columns nobody may ever change via a normal update
  -- ------------------------------------------------------------------------
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id cannot be updated';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at cannot be updated';
  END IF;

  -- ------------------------------------------------------------------------
  -- Determine actor (see assumption B3)
  -- ------------------------------------------------------------------------
  v_is_staff := EXISTS (
    SELECT 1
    FROM "STAFF"
    WHERE "STAFF".staff_id = v_uid
      AND "STAFF".active_status = true
      AND "STAFF".role = ANY (ARRAY['STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES"])
  );

  v_is_driver := (
    NOT v_is_staff
    AND OLD.id = v_uid
    AND EXISTS (
      SELECT 1
      FROM "User" u
      JOIN "User_Account_Status" uas ON uas.user_id = u.id
      WHERE u.id = v_uid
        AND u.active_role = 'DRIVER'::"USER_ROLES"
        AND uas.account_status = 'ACTIVE'::"ACCOUNT_STATUS"
    )
  );

  IF v_is_staff THEN
    v_actor := 'staff';
  ELSIF v_is_driver THEN
    v_actor := 'driver';
  ELSE
    RAISE EXCEPTION 'Not authorized to update Driver';
  END IF;

  -- ------------------------------------------------------------------------
  -- Look up the driver's verification_status (1 row per driver, guaranteed
  -- to exist)
  -- ------------------------------------------------------------------------
  SELECT dv.verification_status
  INTO v_verification
  FROM "Driver_Verification" dv
  WHERE dv.driver_id = OLD.id;

  -- ------------------------------------------------------------------------
  -- Work out which columns are allowed to change
  -- ------------------------------------------------------------------------
  IF v_actor = 'driver' THEN

    IF v_verification = 'PENDING'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['firstname', 'lastname', 'birthday', 'driver_img_key'];

    ELSIF v_verification = 'REJECTED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['firstname', 'lastname', 'birthday'];

    ELSIF v_verification = 'APPROVED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['pending_driver_img_key', 'pending_driver_img_key_at', 'online_status'];
    END IF;

  ELSIF v_actor = 'staff' THEN

    IF v_verification = 'PENDING'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];

    ELSIF v_verification = 'REJECTED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];

    ELSIF v_verification = 'APPROVED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['pending_driver_img_key', 'pending_driver_img_key_at'];

      -- Staff may only CLEAR these to NULL, never set a new value
      IF NEW.pending_driver_img_key IS DISTINCT FROM OLD.pending_driver_img_key
         AND NEW.pending_driver_img_key IS NOT NULL THEN
        RAISE EXCEPTION 'pending_driver_img_key may only be updated to NULL by staff';
      END IF;

      IF NEW.pending_driver_img_key_at IS DISTINCT FROM OLD.pending_driver_img_key_at
         AND NEW.pending_driver_img_key_at IS NOT NULL THEN
        RAISE EXCEPTION 'pending_driver_img_key_at may only be updated to NULL by staff';
      END IF;
    END IF;

  END IF;

  -- ------------------------------------------------------------------------
  -- Generic lock-down: any column NOT in v_allowed must be unchanged.
  -- Written out explicitly, one column at a time, for easy auditing.
  -- ------------------------------------------------------------------------
  IF NOT ('firstname' = ANY (v_allowed))
     AND NEW.firstname IS DISTINCT FROM OLD.firstname THEN
    RAISE EXCEPTION 'firstname is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  IF NOT ('lastname' = ANY (v_allowed))
     AND NEW.lastname IS DISTINCT FROM OLD.lastname THEN
    RAISE EXCEPTION 'lastname is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  IF NOT ('birthday' = ANY (v_allowed))
     AND NEW.birthday IS DISTINCT FROM OLD.birthday THEN
    RAISE EXCEPTION 'birthday is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  -- driver_img_key: allowed while PENDING (per v_allowed above), but only
  -- ever as a one-time NULL -> value bootstrap set, never an overwrite of
  -- an already-set value. Locked entirely outside PENDING.
  IF NOT ('driver_img_key' = ANY (v_allowed))
     AND NEW.driver_img_key IS DISTINCT FROM OLD.driver_img_key THEN
    RAISE EXCEPTION 'driver_img_key is not directly updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  IF ('driver_img_key' = ANY (v_allowed))
     AND NEW.driver_img_key IS DISTINCT FROM OLD.driver_img_key
     AND NOT (OLD.driver_img_key IS NULL AND NEW.driver_img_key IS NOT NULL) THEN
    RAISE EXCEPTION 'driver_img_key can only be set once, transitioning from NULL to a value';
  END IF;

  IF NOT ('online_status' = ANY (v_allowed))
     AND NEW.online_status IS DISTINCT FROM OLD.online_status THEN
    RAISE EXCEPTION 'online_status is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  IF NOT ('pending_driver_img_key' = ANY (v_allowed))
     AND NEW.pending_driver_img_key IS DISTINCT FROM OLD.pending_driver_img_key THEN
    RAISE EXCEPTION 'pending_driver_img_key is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  IF NOT ('pending_driver_img_key_at' = ANY (v_allowed))
     AND NEW.pending_driver_img_key_at IS DISTINCT FROM OLD.pending_driver_img_key_at THEN
    RAISE EXCEPTION 'pending_driver_img_key_at is not updatable (verification_status=%, actor=%)', v_verification, v_actor;
  END IF;

  -- ------------------------------------------------------------------------
  -- Housekeeping (assumption B6) — remove if handled elsewhere
  -- ------------------------------------------------------------------------
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."driver_before_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."driver_documents_before_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_is_staff  boolean;
  v_is_driver boolean;
  v_allowed   text[];
  v_actor     text;
BEGIN
  -- ------------------------------------------------------------------------
  -- DB owner / service role: full bypass, no restrictions of any kind.
  -- Must be the very first thing checked, before any other logic.
  -- ------------------------------------------------------------------------
  IF current_user IN ('postgres', 'service_role') THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- ------------------------------------------------------------------------
  -- Columns nobody may ever change via a normal update
  -- ------------------------------------------------------------------------
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id cannot be updated';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at cannot be updated';
  END IF;

  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id THEN
    RAISE EXCEPTION 'driver_id cannot be updated';
  END IF;

  IF NEW.document_type IS DISTINCT FROM OLD.document_type THEN
    RAISE EXCEPTION 'document_type cannot be updated';
  END IF;

  -- ------------------------------------------------------------------------
  -- Determine actor (see assumption A1)
  -- ------------------------------------------------------------------------
  v_is_staff := EXISTS (
    SELECT 1
    FROM "STAFF"
    WHERE "STAFF".staff_id = v_uid
      AND "STAFF".active_status = true
      AND "STAFF".role = ANY (ARRAY['STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES"])
  );

  v_is_driver := (
    NOT v_is_staff
    AND OLD.driver_id = v_uid
    AND EXISTS (
      SELECT 1
      FROM "Driver" d
      JOIN "User" u ON u.id = d.id
      JOIN "User_Account_Status" uas ON uas.user_id = u.id
      WHERE d.id = v_uid
        AND u.active_role = 'DRIVER'::"USER_ROLES"
        AND uas.account_status = 'ACTIVE'::"ACCOUNT_STATUS"
    )
  );

  IF v_is_staff THEN
    v_actor := 'staff';
  ELSIF v_is_driver THEN
    v_actor := 'driver';
  ELSE
    RAISE EXCEPTION 'Not authorized to update Driver_Documents';
  END IF;

  -- ------------------------------------------------------------------------
  -- Work out which columns are allowed to change, given
  -- document_type / OLD.status / actor
  -- ------------------------------------------------------------------------

  -- ===================== NIN =====================
  IF OLD.document_type = 'NIN'::"DRIVER_DOCUMENT_TYPE" THEN

    IF v_actor = 'driver' THEN

      IF OLD.status = 'PENDING'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['document_number', 'document_img_key'];

      ELSIF OLD.status = 'REJECTED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['document_number', 'document_img_key', 'status'];

        IF NEW.status IS DISTINCT FROM OLD.status
           AND NEW.status IS DISTINCT FROM 'PENDING'::"VERIFICATION_STATUS" THEN
          RAISE EXCEPTION 'Driver may only move a REJECTED NIN document back to PENDING';
        END IF;

      ELSIF OLD.status = 'APPROVED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY[]::text[];
      END IF;

    ELSIF v_actor = 'staff' THEN

      IF OLD.status = 'PENDING'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['status', 'document_owner_name', 'gender', 'birthday'];
      ELSE
        -- REJECTED or APPROVED: staff cannot touch anything
        v_allowed := ARRAY[]::text[];
      END IF;

    END IF;

  -- ================= DRIVER_LICENSE =================
  ELSIF OLD.document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE" THEN

    IF v_actor = 'driver' THEN

      IF OLD.status = 'PENDING'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['document_number', 'document_img_key', 'expiry_date', 'license_class'];

      ELSIF OLD.status = 'REJECTED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['document_number', 'document_img_key', 'status', 'expiry_date', 'license_class'];

        IF NEW.status IS DISTINCT FROM OLD.status
           AND NEW.status IS DISTINCT FROM 'PENDING'::"VERIFICATION_STATUS" THEN
          RAISE EXCEPTION 'Driver may only move a REJECTED license back to PENDING';
        END IF;

      ELSIF OLD.status = 'APPROVED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['pending_document_img_key', 'pending_document_img_key_at',
                            'pending_expiry_date', 'pending_license_class'];
      END IF;

    ELSIF v_actor = 'staff' THEN

      IF OLD.status = 'PENDING'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['document_owner_name', 'gender', 'birthday', 'status'];

      ELSIF OLD.status = 'REJECTED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY[]::text[];

      ELSIF OLD.status = 'APPROVED'::"VERIFICATION_STATUS" THEN
        v_allowed := ARRAY['pending_document_img_key', 'pending_document_img_key_at',
                            'pending_license_class', 'pending_expiry_date',
                            'license_class', 'expiry_date'];

        -- pending_* fields may only be CLEARED to NULL by staff here
        IF NEW.pending_document_img_key IS DISTINCT FROM OLD.pending_document_img_key
           AND NEW.pending_document_img_key IS NOT NULL THEN
          RAISE EXCEPTION 'pending_document_img_key may only be updated to NULL';
        END IF;

        IF NEW.pending_document_img_key_at IS DISTINCT FROM OLD.pending_document_img_key_at
           AND NEW.pending_document_img_key_at IS NOT NULL THEN
          RAISE EXCEPTION 'pending_document_img_key_at may only be updated to NULL';
        END IF;

        IF NEW.pending_license_class IS DISTINCT FROM OLD.pending_license_class
           AND NEW.pending_license_class IS NOT NULL THEN
          RAISE EXCEPTION 'pending_license_class may only be updated to NULL';
        END IF;

        IF NEW.pending_expiry_date IS DISTINCT FROM OLD.pending_expiry_date
           AND NEW.pending_expiry_date IS NOT NULL THEN
          RAISE EXCEPTION 'pending_expiry_date may only be updated to NULL';
        END IF;

        -- license_class may only change if a pending value existed, and
        -- (per assumption A2) must be set to exactly that pending value
        IF NEW.license_class IS DISTINCT FROM OLD.license_class THEN
          IF OLD.pending_license_class IS NULL THEN
            RAISE EXCEPTION 'license_class may only be updated when pending_license_class is set';
          ELSIF NEW.license_class IS DISTINCT FROM OLD.pending_license_class THEN
            RAISE EXCEPTION 'license_class must be set to the pending_license_class value';
          END IF;
        END IF;

        -- expiry_date may only change if a pending value existed, and
        -- (per assumption A2) must be set to exactly that pending value
        IF NEW.expiry_date IS DISTINCT FROM OLD.expiry_date THEN
          IF OLD.pending_expiry_date IS NULL THEN
            RAISE EXCEPTION 'expiry_date may only be updated when pending_expiry_date is set';
          ELSIF NEW.expiry_date IS DISTINCT FROM OLD.pending_expiry_date THEN
            RAISE EXCEPTION 'expiry_date must be set to the pending_expiry_date value';
          END IF;
        END IF;

      END IF;

    END IF;

  ELSE
    RAISE EXCEPTION 'Unknown document_type on Driver_Documents row';
  END IF;

  -- ------------------------------------------------------------------------
  -- Generic lock-down: any column NOT in v_allowed must be unchanged.
  -- Written out explicitly, one column at a time, so it's easy to audit.
  -- ------------------------------------------------------------------------
  IF NOT ('document_number' = ANY (v_allowed))
     AND NEW.document_number IS DISTINCT FROM OLD.document_number THEN
    RAISE EXCEPTION 'document_number is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('document_img_key' = ANY (v_allowed))
     AND NEW.document_img_key IS DISTINCT FROM OLD.document_img_key THEN
    RAISE EXCEPTION 'document_img_key is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('status' = ANY (v_allowed))
     AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'status is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('expiry_date' = ANY (v_allowed))
     AND NEW.expiry_date IS DISTINCT FROM OLD.expiry_date THEN
    RAISE EXCEPTION 'expiry_date is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('pending_document_img_key' = ANY (v_allowed))
     AND NEW.pending_document_img_key IS DISTINCT FROM OLD.pending_document_img_key THEN
    RAISE EXCEPTION 'pending_document_img_key is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('pending_document_img_key_at' = ANY (v_allowed))
     AND NEW.pending_document_img_key_at IS DISTINCT FROM OLD.pending_document_img_key_at THEN
    RAISE EXCEPTION 'pending_document_img_key_at is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('license_class' = ANY (v_allowed))
     AND NEW.license_class IS DISTINCT FROM OLD.license_class THEN
    RAISE EXCEPTION 'license_class is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('pending_license_class' = ANY (v_allowed))
     AND NEW.pending_license_class IS DISTINCT FROM OLD.pending_license_class THEN
    RAISE EXCEPTION 'pending_license_class is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('pending_expiry_date' = ANY (v_allowed))
     AND NEW.pending_expiry_date IS DISTINCT FROM OLD.pending_expiry_date THEN
    RAISE EXCEPTION 'pending_expiry_date is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('document_owner_name' = ANY (v_allowed))
     AND NEW.document_owner_name IS DISTINCT FROM OLD.document_owner_name THEN
    RAISE EXCEPTION 'document_owner_name is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('gender' = ANY (v_allowed))
     AND NEW.gender IS DISTINCT FROM OLD.gender THEN
    RAISE EXCEPTION 'gender is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  IF NOT ('birthday' = ANY (v_allowed))
     AND NEW.birthday IS DISTINCT FROM OLD.birthday THEN
    RAISE EXCEPTION 'birthday is not updatable (document_type=%, status=%, actor=%)',
      OLD.document_type, OLD.status, v_actor;
  END IF;

  -- ------------------------------------------------------------------------
  -- Housekeeping (assumption A4) — remove if handled elsewhere
  -- ------------------------------------------------------------------------
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."driver_documents_before_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."driver_verification_before_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_uid       uuid := auth.uid();
  v_is_staff  boolean;
  v_is_driver boolean;
  v_actor     text;
  v_allowed   text[];
BEGIN
  -- ------------------------------------------------------------------------
  -- DB owner / service role: full bypass, no restrictions of any kind.
  -- Must be the very first thing checked, before any other logic.
  -- ------------------------------------------------------------------------
  IF current_user IN ('postgres', 'service_role') THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- ------------------------------------------------------------------------
  -- Columns nobody may ever change via a normal update
  -- ------------------------------------------------------------------------
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id cannot be updated';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at cannot be updated';
  END IF;

  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id THEN
    RAISE EXCEPTION 'driver_id cannot be updated';
  END IF;

  -- ------------------------------------------------------------------------
  -- Determine actor (see assumption C1)
  -- ------------------------------------------------------------------------
  v_is_staff := EXISTS (
    SELECT 1
    FROM "STAFF"
    WHERE "STAFF".staff_id = v_uid
      AND "STAFF".active_status = true
      AND "STAFF".role = ANY (ARRAY['STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES"])
  );

  v_is_driver := (
    NOT v_is_staff
    AND OLD.driver_id = v_uid
    AND EXISTS (
      SELECT 1
      FROM "Driver" d
      JOIN "User" u ON u.id = d.id
      JOIN "User_Account_Status" uas ON uas.user_id = u.id
      WHERE d.id = v_uid
        AND u.active_role = 'DRIVER'::"USER_ROLES"
        AND uas.account_status = 'ACTIVE'::"ACCOUNT_STATUS"
    )
  );

  IF v_is_staff THEN
    v_actor := 'staff';
  ELSIF v_is_driver THEN
    v_actor := 'driver';
  ELSE
    RAISE EXCEPTION 'Not authorized to update Driver_Verification';
  END IF;

  -- ------------------------------------------------------------------------
  -- Work out which columns are allowed to change
  -- ------------------------------------------------------------------------
  IF v_actor = 'driver' THEN

    IF OLD.verification_status = 'PENDING'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];

    ELSIF OLD.verification_status = 'REJECTED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['verification_status'];

      IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
         AND NEW.verification_status IS DISTINCT FROM 'PENDING'::"VERIFICATION_STATUS" THEN
        RAISE EXCEPTION 'Driver may only move a REJECTED verification back to PENDING';
      END IF;

    ELSIF OLD.verification_status = 'APPROVED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];
    END IF;

  ELSIF v_actor = 'staff' THEN

    IF OLD.verification_status = 'PENDING'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY['verification_status'];

    ELSIF OLD.verification_status = 'REJECTED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];

    ELSIF OLD.verification_status = 'APPROVED'::"VERIFICATION_STATUS" THEN
      v_allowed := ARRAY[]::text[];
    END IF;

  END IF;

  -- ------------------------------------------------------------------------
  -- Generic lock-down: any column NOT in v_allowed must be unchanged.
  -- ------------------------------------------------------------------------
  IF NOT ('verification_status' = ANY (v_allowed))
     AND NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'verification_status is not updatable (verification_status=%, actor=%)',
      OLD.verification_status, v_actor;
  END IF;

  -- ------------------------------------------------------------------------
  -- Housekeeping (assumption C3) — remove if handled elsewhere
  -- ------------------------------------------------------------------------
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."driver_verification_before_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_driver_documents_update_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_status "VERIFICATION_STATUS";
  v_is_staff boolean;
  v_is_privileged boolean;
  v_reviewer uuid;
begin
  v_is_privileged := (current_user in ('postgres', 'service_role'));

  if not v_is_privileged then
    select exists (
      select 1 from "STAFF"
      where staff_id = auth.uid()
      and active_status = true
      and role in ('STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES")
    ) into v_is_staff;
  end if;

  select verification_status into v_status
  from "Driver_Verification"
  where driver_id = old.driver_id;

  -- === PRIVILEGED / STAFF PATH ===
  if v_is_privileged or v_is_staff then
    v_reviewer := case when v_is_staff then auth.uid() else null end;

    if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
      if new.document_number is distinct from old.document_number
        or new.document_img_key is distinct from old.document_img_key
        or new.document_type is distinct from old.document_type
        or new.expiry_date is distinct from old.expiry_date
        or new.license_class is distinct from old.license_class
        or new.pending_document_img_key is distinct from old.pending_document_img_key
        or new.pending_document_img_key_at is distinct from old.pending_document_img_key_at
        or new.pending_expiry_date is distinct from old.pending_expiry_date
        or new.pending_license_class is distinct from old.pending_license_class then
        raise exception 'Staff can only update status while verification is %', v_status;
      end if;

      return new;
    end if;

    if v_status = 'APPROVED'::"VERIFICATION_STATUS" then
      if new.document_number is distinct from old.document_number
        or new.document_img_key is distinct from old.document_img_key
        or new.document_type is distinct from old.document_type then
        raise exception 'This field cannot be updated by staff once approved';
      end if;

      if new.expiry_date is distinct from old.expiry_date then
        if old.pending_expiry_date is null then
          raise exception 'No pending expiry date to approve';
        end if;

        insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
        values ('UPDATED_LICENSE_EXPIRY_DATE'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.driver_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer);

        new.pending_expiry_date := null;
      end if;

      if new.status is distinct from old.status then
        if old.document_type is distinct from 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE" then
          raise exception 'status can only be updated for DRIVER_LICENSE documents';
        end if;

        insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
        values ('UPDATED_DRIVER_LICENSE_STATUS'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.driver_id, new.status, v_reviewer);
      end if;

      if new.license_class is distinct from old.license_class then
        if old.pending_license_class is null then
          raise exception 'No pending license class to approve';
        end if;

        insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
        values ('UPDATED_LICENSE_CLASS'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.driver_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer);

        new.pending_license_class := null;
      end if;

      if old.pending_document_img_key is not null and new.pending_document_img_key is null then
        insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
        values (
          case when old.document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE"
            then 'UPDATED_DRIVER_LICENSE_PHOTO'::"DRIVER_VERIFICATION_AUDIT_TYPE"
            else 'UPDATED_NIN_PHOTO'::"DRIVER_VERIFICATION_AUDIT_TYPE"
          end,
          old.driver_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer
        );
      end if;
    end if;

    return new;
  end if;

  -- === DRIVER SELF-UPDATE PATH ===
  if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
    if new.document_type is distinct from old.document_type
      or new.status is distinct from old.status
      or new.pending_document_img_key is distinct from old.pending_document_img_key
      or new.pending_document_img_key_at is distinct from old.pending_document_img_key_at
      or new.pending_expiry_date is distinct from old.pending_expiry_date
      or new.pending_license_class is distinct from old.pending_license_class then
      raise exception 'Cannot update this field while verification is %', v_status;
    end if;
    -- document_number, document_img_key, expiry_date, license_class remain freely editable here

  elsif v_status = 'APPROVED'::"VERIFICATION_STATUS" then
    if new.document_number is distinct from old.document_number
      or new.document_img_key is distinct from old.document_img_key
      or new.document_type is distinct from old.document_type
      or new.expiry_date is distinct from old.expiry_date
      or new.status is distinct from old.status
      or new.license_class is distinct from old.license_class then
      raise exception 'Cannot update locked fields once approved';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_driver_documents_update_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_driver_update_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_status "VERIFICATION_STATUS";
  v_is_staff boolean;
  v_is_privileged boolean;
  v_reviewer uuid;
  v_has_pending_nin boolean;
begin
  v_is_privileged := (current_user in ('postgres', 'service_role'));

  if not v_is_privileged then
    select exists (
      select 1 from "STAFF"
      where staff_id = auth.uid()
      and active_status = true
      and role in ('STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES")
    ) into v_is_staff;
  end if;

  select verification_status into v_status
  from "Driver_Verification"
  where driver_id = old.id;

  -- === PRIVILEGED / STAFF PATH ===
  if v_is_privileged or v_is_staff then
    if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
      raise exception 'Staff cannot update Driver while verification is %', v_status;
    end if;

    if v_status = 'APPROVED'::"VERIFICATION_STATUS" then
      v_reviewer := case when v_is_staff then auth.uid() else null end;

      if new.birthday is distinct from old.birthday then
        raise exception 'birthday cannot be updated by staff';
      end if;

      if new.driver_img_key is distinct from old.driver_img_key then
        raise exception 'driver_img_key must not be changed directly — handled via storage';
      end if;

      if new.online_status is distinct from old.online_status then
        if new.online_status is distinct from 'OFFLINE'::"ONLINE_STATUS" then
          raise exception 'Staff can only set online_status to OFFLINE';
        end if;

        if not exists (
          select 1 from "User_Account_Status"
          where user_id = old.id
          and account_status = 'SUSPENDED'::"ACCOUNT_STATUS"
        ) then
          raise exception 'Can only force driver offline while account is SUSPENDED';
        end if;

        insert into "Driver_Online_Status_Audit" (driver_id, decision, changed_by)
        values (old.id, 'OFFLINE'::"ONLINE_STATUS", v_reviewer);
      end if;

      if new.firstname is distinct from old.firstname
        or new.lastname is distinct from old.lastname then

        select exists (
          select 1 from "Driver_Documents"
          where driver_id = old.id
          and document_type = 'NIN'::"DRIVER_DOCUMENT_TYPE"
          and pending_document_img_key is not null
        ) into v_has_pending_nin;

        if not v_has_pending_nin then
          raise exception 'No pending NIN document found for name change approval';
        end if;
      end if;
    end if;

    if new.firstname is distinct from old.firstname then
      insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
      values ('UPDATED_FIRSTNAME'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer);
    end if;

    if new.lastname is distinct from old.lastname then
      insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
      values ('UPDATED_LASTNAME'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer);
    end if;

    if old.pending_driver_img_key is not null and new.pending_driver_img_key is null then
      insert into "Driver_Verification_Audit" (type, driver_id, decision, reviewed_by)
      values ('UPDATED_PROFILE_PHOTO'::"DRIVER_VERIFICATION_AUDIT_TYPE", old.id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer);
    end if;

    return new;
  end if;

  -- === DRIVER SELF-UPDATE PATH ===
  if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
    if new.online_status = 'ONLINE'::"ONLINE_STATUS" then
      raise exception 'Cannot go online while verification is %', v_status;
    end if;

    if new.pending_driver_img_key is distinct from old.pending_driver_img_key
      or new.pending_driver_img_key_at is distinct from old.pending_driver_img_key_at then
      raise exception 'Cannot update pending image fields while verification is %', v_status;
    end if;

  elsif v_status = 'APPROVED'::"VERIFICATION_STATUS" then
    if new.firstname is distinct from old.firstname
      or new.lastname is distinct from old.lastname
      or new.birthday is distinct from old.birthday
      or new.driver_img_key is distinct from old.driver_img_key then
      raise exception 'Cannot update locked identity fields once approved';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_driver_update_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_timestamp_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_timestamp_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_vehicle_documents_update_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_status "VERIFICATION_STATUS";
  v_is_staff boolean;
  v_is_privileged boolean;
  v_reviewer uuid;
  v_vehicle_id uuid;
begin
  v_is_privileged := (current_user in ('postgres', 'service_role'));

  if not v_is_privileged then
    select exists (
      select 1 from "STAFF"
      where staff_id = auth.uid()
      and active_status = true
      and role in ('STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES")
    ) into v_is_staff;
  end if;

  v_vehicle_id := old.vehicle_id;

  select verification_status into v_status
  from "Vehicle_Verification"
  where vehicle_id = v_vehicle_id;

  -- === PRIVILEGED / STAFF PATH ===
  if v_is_privileged or v_is_staff then
    v_reviewer := case when v_is_staff then auth.uid() else null end;

    if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
      if new.document_type is distinct from old.document_type
        or new.document_number is distinct from old.document_number
        or new.document_img_key is distinct from old.document_img_key
        or new.expiry_date is distinct from old.expiry_date
        or new.pending_document_img_key is distinct from old.pending_document_img_key
        or new.pending_document_img_key_at is distinct from old.pending_document_img_key_at
        or new.pending_expiry_date is distinct from old.pending_expiry_date then
        raise exception 'Staff cannot update Vehicle_Documents while verification is %', v_status;
      end if;

      return new;
    end if;

    if v_status = 'APPROVED'::"VERIFICATION_STATUS" then
      if new.document_type is distinct from old.document_type
        or new.document_number is distinct from old.document_number
        or new.document_img_key is distinct from old.document_img_key then
        raise exception 'This field cannot be updated by staff once approved';
      end if;

      if new.expiry_date is distinct from old.expiry_date then
        insert into "Vehicle_Verification_Audit" (vehicle_id, decision, reviewed_by, type)
        values (v_vehicle_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer, 'UPDATED_VEHICLE_REG_CERTIFICATE_EXPIRY_DATE'::"VEHICLE_VERIFICATION_AUDIT_TYPE");
      end if;

      if old.pending_document_img_key is not null and new.pending_document_img_key is null then
        insert into "Vehicle_Verification_Audit" (vehicle_id, decision, reviewed_by, type)
        values (v_vehicle_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer, 'UDPATED_VEHICLE_REG_CERTIFICATE_PHOTO'::"VEHICLE_VERIFICATION_AUDIT_TYPE");
      end if;
    end if;

    return new;
  end if;

  -- === VEHICLE OWNER SELF-UPDATE PATH ===
  if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
    if new.document_type is distinct from old.document_type
      or new.pending_document_img_key is distinct from old.pending_document_img_key
      or new.pending_document_img_key_at is distinct from old.pending_document_img_key_at
      or new.pending_expiry_date is distinct from old.pending_expiry_date then
      raise exception 'Cannot update this field while verification is %', v_status;
    end if;

  elsif v_status = 'APPROVED'::"VERIFICATION_STATUS" then
    if new.document_type is distinct from old.document_type
      or new.document_number is distinct from old.document_number
      or new.document_img_key is distinct from old.document_img_key
      or new.expiry_date is distinct from old.expiry_date then
      raise exception 'Cannot update locked fields once approved';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_vehicle_documents_update_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_vehicle_photos_update_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_status "VERIFICATION_STATUS";
  v_is_staff boolean;
  v_is_privileged boolean;
  v_reviewer uuid;
begin
  v_is_privileged := (current_user in ('postgres', 'service_role'));

  if not v_is_privileged then
    select exists (
      select 1 from "STAFF"
      where staff_id = auth.uid()
      and active_status = true
      and role in ('STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES")
    ) into v_is_staff;
  end if;

  select verification_status into v_status
  from "Vehicle_Verification"
  where vehicle_id = old.vehicle_id;

  -- === PRIVILEGED / STAFF PATH ===
  if v_is_privileged or v_is_staff then
    v_reviewer := case when v_is_staff then auth.uid() else null end;

    if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
      if new.vehicle_photos_keys is distinct from old.vehicle_photos_keys
        or new.pending_vehicle_photos_keys is distinct from old.pending_vehicle_photos_keys then
        raise exception 'Staff cannot update Vehicle_Photos while verification is %', v_status;
      end if;

      return new;
    end if;

    if v_status = 'APPROVED'::"VERIFICATION_STATUS" then
      if new.vehicle_photos_keys is distinct from old.vehicle_photos_keys then
        raise exception 'vehicle_photos_keys cannot be updated by staff once approved';
      end if;

      if old.pending_vehicle_photos_keys is not null and new.pending_vehicle_photos_keys is null then
        insert into "Vehicle_Verification_Audit" (vehicle_id, decision, reviewed_by, type)
        values (old.vehicle_id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer, 'UPDATED_VEHICLE_PHOTOS'::"VEHICLE_VERIFICATION_AUDIT_TYPE");
      end if;
    end if;

    return new;
  end if;

  -- === VEHICLE OWNER SELF-UPDATE PATH ===
  if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
    if new.pending_vehicle_photos_keys is distinct from old.pending_vehicle_photos_keys then
      raise exception 'Cannot update pending_vehicle_photos_keys while verification is %', v_status;
    end if;

  elsif v_status = 'APPROVED'::"VERIFICATION_STATUS" then
    if new.vehicle_photos_keys is distinct from old.vehicle_photos_keys then
      raise exception 'Cannot update vehicle_photos_keys once approved';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_vehicle_photos_update_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_vehicle_update_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_status "VERIFICATION_STATUS";
  v_is_staff boolean;
  v_is_privileged boolean;
  v_reviewer uuid;
  v_has_pending_reg_cert boolean;
  v_new_driver_verified boolean;
begin
  v_is_privileged := (current_user in ('postgres', 'service_role'));

  if not v_is_privileged then
    select exists (
      select 1 from "STAFF"
      where staff_id = auth.uid()
      and active_status = true
      and role in ('STAFF'::"STAFF_ROLES", 'SUPER_ADMIN'::"STAFF_ROLES")
    ) into v_is_staff;
  end if;

  select verification_status into v_status
  from "Vehicle_Verification"
  where vehicle_id = old.id;

  -- === PRIVILEGED / STAFF PATH ===
  if v_is_privileged or v_is_staff then
    v_reviewer := case when v_is_staff then auth.uid() else null end;

    if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
      if new.owner_driver_id is distinct from old.owner_driver_id
        or new.current_driver_id is distinct from old.current_driver_id
        or new.plate_number is distinct from old.plate_number
        or new.vehicle_type is distinct from old.vehicle_type
        or new.vehicle_capacity is distinct from old.vehicle_capacity
        or new.vehicle_year is distinct from old.vehicle_year
        or new.pending_plate_number is distinct from old.pending_plate_number
        or new.pending_vehicle_color is distinct from old.pending_vehicle_color then
        raise exception 'Staff can only update manufacturer, model, or color while verification is %', v_status;
      end if;

      return new;
    end if;

    if v_status = 'APPROVED'::"VERIFICATION_STATUS" then
      if new.vehicle_year is distinct from old.vehicle_year
        or new.vehicle_type is distinct from old.vehicle_type
        or new.vehicle_manufacturer is distinct from old.vehicle_manufacturer
        or new.vehicle_model is distinct from old.vehicle_model then
        raise exception 'This field cannot be updated once approved';
      end if;

      if new.current_driver_id is distinct from old.current_driver_id then
        if new.current_driver_id is not null then
          raise exception 'Staff can only clear current_driver_id to null';
        end if;

        if not exists (
          select 1 from "User_Account_Status"
          where user_id = old.current_driver_id
          and account_status = 'SUSPENDED'::"ACCOUNT_STATUS"
        ) then
          raise exception 'Can only clear current_driver_id while that driver is SUSPENDED';
        end if;
      end if;

      if new.plate_number is distinct from old.plate_number
        or new.pending_plate_number is distinct from old.pending_plate_number
        or new.vehicle_color is distinct from old.vehicle_color
        or new.pending_vehicle_color is distinct from old.pending_vehicle_color then

        select exists (
          select 1 from "Vehicle_Documents"
          where vehicle_id = old.id
          and document_type = 'VEHICLE_REGISTRATION_CERTIFICATE'::"VEHICLE_DOCUMENT_TYPE"
          and pending_document_img_key is not null
        ) into v_has_pending_reg_cert;

        if not v_has_pending_reg_cert then
          raise exception 'No pending vehicle registration certificate found';
        end if;

        if new.plate_number is distinct from old.plate_number then
          insert into "Vehicle_Verification_Audit" (vehicle_id, decision, reviewed_by, type)
          values (old.id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer, 'UPDATED_PLATE_NUMBER'::"VEHICLE_VERIFICATION_AUDIT_TYPE");
        end if;

        if new.vehicle_color is distinct from old.vehicle_color then
          insert into "Vehicle_Verification_Audit" (vehicle_id, decision, reviewed_by, type)
          values (old.id, 'APPROVED'::"VERIFICATION_STATUS", v_reviewer, 'UPDATED_VEHICLE_COLOR'::"VEHICLE_VERIFICATION_AUDIT_TYPE");
        end if;
      end if;
    end if;

    return new;
  end if;

  -- === DRIVER (OWNER) SELF-UPDATE PATH ===
  if v_status in ('PENDING'::"VERIFICATION_STATUS", 'REJECTED'::"VERIFICATION_STATUS") then
    if new.current_driver_id is distinct from old.current_driver_id
      or new.vehicle_manufacturer is distinct from old.vehicle_manufacturer
      or new.vehicle_model is distinct from old.vehicle_model
      or new.vehicle_color is distinct from old.vehicle_color
      or new.pending_vehicle_color is distinct from old.pending_vehicle_color
      or new.pending_plate_number is distinct from old.pending_plate_number then
      raise exception 'Cannot update this field while verification is %', v_status;
    end if;

  elsif v_status = 'APPROVED'::"VERIFICATION_STATUS" then
    if new.vehicle_year is distinct from old.vehicle_year
      or new.plate_number is distinct from old.plate_number
      or new.vehicle_type is distinct from old.vehicle_type
      or new.vehicle_manufacturer is distinct from old.vehicle_manufacturer
      or new.vehicle_model is distinct from old.vehicle_model
      or new.vehicle_color is distinct from old.vehicle_color then
      raise exception 'Cannot update locked fields once approved';
    end if;

    if new.current_driver_id is distinct from old.current_driver_id then
      select exists (
        select 1 from "Driver_Verification"
        where driver_id = new.current_driver_id
        and verification_status = 'APPROVED'::"VERIFICATION_STATUS"
      ) into v_new_driver_verified;

      if not v_new_driver_verified then
        raise exception 'current_driver_id must reference a driver with APPROVED verification';
      end if;
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_vehicle_update_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_driver_photo_issue"() RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_remaining_count int;
  v_issues jsonb;
  v_verification_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = 'DRIVER_PHOTO'::"VERIFICATION_ISSUES_FIELD";

  select count(*) into v_remaining_count
  from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION";

  if v_remaining_count = 0 then
    update "Driver_Verification"
    set verification_status = 'PENDING'
    where driver_id = v_user_id;
  end if;

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION";

  select verification_status into v_verification_status
  from "Driver_Verification"
  where driver_id = v_user_id;

  return jsonb_build_object(
    'verification_issues', v_issues,
    'verification_status', v_verification_status
  );
end;
$$;


ALTER FUNCTION "public"."resolve_driver_photo_issue"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_identity_photo_issue"("p_document_type" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_document_type "DRIVER_DOCUMENT_TYPE";
  v_field_enum "VERIFICATION_ISSUES_FIELD";
  v_status_fields "VERIFICATION_ISSUES_FIELD"[];
  v_remaining_count int;
  v_issues jsonb;
  v_nin_status text;
  v_license_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_document_type = 'nin' then
    v_document_type := 'NIN'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'NIN_PHOTO'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'NIN_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'NIN_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];
  elsif p_document_type = 'license' then
    v_document_type := 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'DRIVER_LICENSE_PHOTO'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'DRIVER_LICENSE_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];
  else
    raise exception 'Invalid document type: %', p_document_type;
  end if;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = v_field_enum;

  select count(*) into v_remaining_count
  from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = any(v_status_fields);

  if v_remaining_count = 0 then
    update "Driver_Documents"
    set status = 'PENDING'
    where driver_id = v_user_id
      and document_type = v_document_type;
  end if;

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION";

  select status into v_nin_status
  from "Driver_Documents"
  where driver_id = v_user_id and document_type = 'NIN'::"DRIVER_DOCUMENT_TYPE";

  select status into v_license_status
  from "Driver_Documents"
  where driver_id = v_user_id and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";

  return jsonb_build_object(
    'verification_issues', v_issues,
    'nin_verification_status', v_nin_status,
    'driver_license_verification_status', v_license_status
  );
end;
$$;


ALTER FUNCTION "public"."resolve_identity_photo_issue"("p_document_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_identity_info"("p_field" "text", "p_value" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_document_type "DRIVER_DOCUMENT_TYPE";
  v_field_enum "VERIFICATION_ISSUES_FIELD";
  v_status_fields "VERIFICATION_ISSUES_FIELD"[];
  v_remaining_count int;
  v_updated_document jsonb;
  v_issues jsonb;
  v_nin_status text;
  v_license_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_field = 'nin_no' then
    v_document_type := 'NIN'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'NIN_NUMBER'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'NIN_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'NIN_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

    update "Driver_Documents"
    set document_number = p_value
    where driver_id = v_user_id
      and document_type = v_document_type
    returning jsonb_build_object('document_number', document_number, 'expiry_date', expiry_date, 'license_class', license_class)
      into v_updated_document;

  elsif p_field = 'license_no' then
    v_document_type := 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'DRIVER_LICENSE_NUMBER'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'DRIVER_LICENSE_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

    update "Driver_Documents"
    set document_number = p_value
    where driver_id = v_user_id
      and document_type = v_document_type
    returning jsonb_build_object('document_number', document_number, 'expiry_date', expiry_date, 'license_class', license_class)
      into v_updated_document;

  elsif p_field = 'license_expiry_date' then
    v_document_type := 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'DRIVER_LICENSE_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

    update "Driver_Documents"
    set expiry_date = p_value::date
    where driver_id = v_user_id
      and document_type = v_document_type
    returning jsonb_build_object('document_number', document_number, 'expiry_date', expiry_date, 'license_class', license_class)
      into v_updated_document;

  elsif p_field = 'license_class' then
    v_document_type := 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";
    v_field_enum := 'DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD";
    v_status_fields := array[
      'DRIVER_LICENSE_NUMBER'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'DRIVER_LICENSE_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

    update "Driver_Documents"
    set license_class = p_value::"DRIVER_LICENSE_CLASS"
    where driver_id = v_user_id
      and document_type = v_document_type
    returning jsonb_build_object('document_number', document_number, 'expiry_date', expiry_date, 'license_class', license_class)
      into v_updated_document;

  else
    raise exception 'Invalid field: %', p_field;
  end if;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = v_field_enum;

  select count(*) into v_remaining_count
  from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = any(v_status_fields);

  if v_remaining_count = 0 then
    update "Driver_Documents"
    set status = 'PENDING'
    where driver_id = v_user_id
      and document_type = v_document_type;
  end if;

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION";

  select status into v_nin_status
  from "Driver_Documents"
  where driver_id = v_user_id and document_type = 'NIN'::"DRIVER_DOCUMENT_TYPE";

  select status into v_license_status
  from "Driver_Documents"
  where driver_id = v_user_id and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE";

  return jsonb_build_object(
    'updated', v_updated_document,
    'verification_issues', v_issues,
    'nin_verification_status', v_nin_status,
    'driver_license_verification_status', v_license_status
  );
end;
$$;


ALTER FUNCTION "public"."update_identity_info"("p_field" "text", "p_value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pending_driver_photo"("p_path" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_issues jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update "Driver"
  set pending_driver_img_key = p_path,
      pending_driver_img_key_at = now()
  where id = v_user_id;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = 'PENDING_DRIVER_PHOTO'::"VERIFICATION_ISSUES_FIELD";

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION";

  return jsonb_build_object(
    'verification_issues', v_issues
  );
end;
$$;


ALTER FUNCTION "public"."update_pending_driver_photo"("p_path" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pending_license_data"("p_field" "text", "p_value" "text", "p_photo_path" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_issue_fields "VERIFICATION_ISSUES_FIELD"[];
  v_updated jsonb;
  v_issues jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_field = 'license_class' then
    update "Driver_Documents"
    set pending_license_class = p_value::"DRIVER_LICENSE_CLASS",
        pending_document_img_key = p_photo_path,
        pending_document_img_key_at = now()
    where driver_id = v_user_id
      and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE"
    returning jsonb_build_object('pending_license_class', pending_license_class, 'pending_expiry_date', pending_expiry_date)
      into v_updated;

    v_issue_fields := array[
      'PENDING_DRIVER_LICENSE_CLASS'::"VERIFICATION_ISSUES_FIELD",
      'PENDING_DRIVER_LICENSE_CLASS_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

  elsif p_field = 'expiry_date' then
    update "Driver_Documents"
    set pending_expiry_date = p_value::date,
        pending_document_img_key = p_photo_path,
        pending_document_img_key_at = now()
    where driver_id = v_user_id
      and document_type = 'DRIVER_LICENSE'::"DRIVER_DOCUMENT_TYPE"
    returning jsonb_build_object('pending_license_class', pending_license_class, 'pending_expiry_date', pending_expiry_date)
      into v_updated;

    v_issue_fields := array[
      'PENDING_DRIVER_LICENSE_EXPIRY_DATE'::"VERIFICATION_ISSUES_FIELD",
      'PENDING_DRIVER_LICENSE_CLASS_PHOTO'::"VERIFICATION_ISSUES_FIELD"
    ];

  else
    raise exception 'Invalid field: %', p_field;
  end if;

  delete from "Verification_Issues"
  where driver_id = v_user_id
    and section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION"
    and field = any(v_issue_fields);

  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = 'IDENTITY_INFO'::"VERIFICATION_ISSUES_SECTION";

  return jsonb_build_object(
    'updated', v_updated,
    'verification_issues', v_issues
  );
end;
$$;


ALTER FUNCTION "public"."update_pending_license_data"("p_field" "text", "p_value" "text", "p_photo_path" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_field"("p_field" "text", "p_value" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_field_enum "VERIFICATION_ISSUES_FIELD";     
  v_section "VERIFICATION_ISSUES_SECTION";      
  v_remaining_count int;
  v_updated_fields jsonb;
  v_issues jsonb;
  v_verification_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_section := 'PERSONAL_INFO'::"VERIFICATION_ISSUES_SECTION";

  -- User table fields
  if p_field = 'email' then
    update "User" set email = p_value where id = v_user_id
    returning jsonb_build_object('email', email, 'phone', phone) into v_updated_fields;

  elsif p_field = 'phone' then
    update "User" set phone = p_value where id = v_user_id
    returning jsonb_build_object('email', email, 'phone', phone) into v_updated_fields;

  -- Driver table fields
  elsif p_field in ('firstname', 'lastname', 'birthday') then

    if p_field = 'firstname' then
      update "Driver" set firstname = p_value where id = v_user_id;
      v_field_enum := 'FIRST_NAME'::"VERIFICATION_ISSUES_FIELD";
    elsif p_field = 'lastname' then
      update "Driver" set lastname = p_value where id = v_user_id;
      v_field_enum := 'LAST_NAME'::"VERIFICATION_ISSUES_FIELD";
    else
      update "Driver" set birthday = p_value::date where id = v_user_id;
      v_field_enum := 'BIRTH_DAY'::"VERIFICATION_ISSUES_FIELD";
    end if;

    delete from "Verification_Issues"
    where driver_id = v_user_id
      and section = v_section
      and field = v_field_enum;

    select count(*) into v_remaining_count
    from "Verification_Issues"
    where driver_id = v_user_id
      and section = v_section;

    if v_remaining_count = 0 then
      update "Driver_Verification"
      set verification_status = 'PENDING'
      where driver_id = v_user_id;
    end if;

    select jsonb_build_object(
      'firstname', firstname,
      'lastname', lastname,
      'birthday', birthday
    ) into v_updated_fields
    from "Driver" where id = v_user_id;

  else
    raise exception 'Invalid field: %', p_field;
  end if;

  -- Always return current verification issues + status, regardless of which
  -- branch ran, so the client gets a consistent shape in one round trip
  select coalesce(jsonb_agg(vi), '[]'::jsonb) into v_issues
  from "Verification_Issues" vi
  where vi.driver_id = v_user_id
    and vi.section = v_section;

  select verification_status into v_verification_status
  from "Driver_Verification"
  where driver_id = v_user_id;

  return jsonb_build_object(
    'updated', v_updated_fields,
    'verification_issues', v_issues,
    'verification_status', v_verification_status
  );
end;
$$;


ALTER FUNCTION "public"."update_profile_field"("p_field" "text", "p_value" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Driver" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "birthday" "date" NOT NULL,
    "driver_img_key" "text",
    "online_status" "public"."ONLINE_STATUS" DEFAULT 'OFFLINE'::"public"."ONLINE_STATUS" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pending_driver_img_key" "text",
    "pending_driver_img_key_at" timestamp with time zone
);


ALTER TABLE "public"."Driver" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_number" "text" NOT NULL,
    "document_img_key" "text",
    "document_type" "public"."DRIVER_DOCUMENT_TYPE" NOT NULL,
    "expiry_date" "date",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "status" "public"."VERIFICATION_STATUS" DEFAULT 'PENDING'::"public"."VERIFICATION_STATUS" NOT NULL,
    "pending_document_img_key" "text",
    "pending_document_img_key_at" "text",
    "license_class" "public"."DRIVER_LICENSE_CLASS",
    "pending_expiry_date" "date",
    "pending_license_class" "public"."DRIVER_LICENSE_CLASS",
    "document_owner_name" "text",
    "gender" "public"."GENDER_ROLES",
    "birthday" "text",
    CONSTRAINT "expiry_date_matches_document_type" CHECK (((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("expiry_date" IS NOT NULL)) OR (("document_type" <> 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("expiry_date" IS NULL)))),
    CONSTRAINT "license_class_matches_document_type" CHECK (((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("license_class" IS NOT NULL)) OR (("document_type" <> 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("license_class" IS NULL)))),
    CONSTRAINT "pending_fields_match_document_type" CHECK ((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") OR (("pending_license_class" IS NULL) AND ("pending_expiry_date" IS NULL))))
);


ALTER TABLE "public"."Driver_Documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Location" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "driver_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Driver_Location" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Online_Status_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decision" "public"."ONLINE_STATUS" NOT NULL,
    "changed_by" "uuid" NOT NULL,
    "driver_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Driver_Online_Status_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Verification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verification_status" "public"."VERIFICATION_STATUS" DEFAULT 'PENDING'::"public"."VERIFICATION_STATUS" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Driver_Verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Verification_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."DRIVER_VERIFICATION_AUDIT_TYPE" NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "decision" "public"."VERIFICATION_STATUS" NOT NULL,
    "reviewed_by" "uuid" NOT NULL
);


ALTER TABLE "public"."Driver_Verification_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Order" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "item_category" "public"."ORDER_ITEM_CATEGORY" NOT NULL,
    "item_desc" "text" NOT NULL,
    "vehicle_type" "public"."VEHICLE_TYPE" NOT NULL,
    "recipent_name" "text",
    "recipent_phone" "text",
    "photo_keys" "jsonb",
    "special_handling" "jsonb",
    "shipper_id" "uuid" NOT NULL,
    "pickup_address" "jsonb" NOT NULL,
    "destination_address" "jsonb" NOT NULL,
    "stops_address" "jsonb",
    "pickup_location" "jsonb" NOT NULL,
    "destination_location" "jsonb" NOT NULL,
    "stops_location" "jsonb" NOT NULL,
    "price" numeric,
    "driver_id" "uuid",
    "status" "public"."ORDER_STATUS" NOT NULL
);


ALTER TABLE "public"."Order" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Order_Offer_Views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."Order_Offer_Views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Order_Offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "driver_id" "uuid",
    "shipper_id" "uuid" NOT NULL,
    "price" numeric NOT NULL,
    "status" "public"."ORDER_OFFER_STATUS" DEFAULT 'PENDING'::"public"."ORDER_OFFER_STATUS" NOT NULL,
    "response_expires_at" timestamp with time zone NOT NULL,
    "actor" "public"."USER_ROLES" NOT NULL
);


ALTER TABLE "public"."Order_Offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Order_Status_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_status" "public"."ORDER_STATUS" NOT NULL
);


ALTER TABLE "public"."Order_Status_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."STAFF" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "staff_id" "uuid" NOT NULL,
    "active_status" boolean NOT NULL,
    "role" "public"."STAFF_ROLES" NOT NULL
);


ALTER TABLE "public"."STAFF" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Shipper" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "birthday" "text" NOT NULL,
    "business_name" "text",
    "profile_photo_key" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Shipper" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active_role" "public"."USER_ROLES" NOT NULL,
    "has_shipper_profile" boolean,
    "has_driver_profile" boolean,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "country_name" "text" NOT NULL,
    "country_code" "text" NOT NULL,
    "calling_code" "text" NOT NULL
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User_Account_Status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_status" "public"."ACCOUNT_STATUS" DEFAULT 'ACTIVE'::"public"."ACCOUNT_STATUS" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."User_Account_Status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User_Account_Status_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decision" "public"."ACCOUNT_STATUS",
    "changed_by" "uuid",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."User_Account_Status_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_driver_id" "uuid" NOT NULL,
    "current_driver_id" "uuid",
    "plate_number" "text" NOT NULL,
    "vehicle_type" "public"."VEHICLE_TYPE" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_capacity" numeric NOT NULL,
    "vehicle_manufacturer" "text",
    "vehicle_model" "text",
    "vehicle_color" "text",
    "vehicle_year" "text" NOT NULL,
    "pending_plate_number" "text",
    "pending_vehicle_color" "text"
);


ALTER TABLE "public"."Vehicle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "document_type" "public"."DRIVER_DOCUMENT_TYPE" NOT NULL,
    "document_number" "text" NOT NULL,
    "document_img_key" "text",
    "expiry_date" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pending_document_img_key" "text",
    "pending_document_img_key_at" "text",
    "pending_expiry_date" "text"
);


ALTER TABLE "public"."Vehicle_Documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "vehicle_photos_keys" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pending_vehicle_photos_keys" "jsonb"
);


ALTER TABLE "public"."Vehicle_Photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Verification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "verification_status" "public"."VERIFICATION_STATUS" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Vehicle_Verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Verification_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decision" "public"."VERIFICATION_STATUS" NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "reviewed_by" "uuid" NOT NULL,
    "type" "public"."VEHICLE_VERIFICATION_AUDIT_TYPE" NOT NULL
);


ALTER TABLE "public"."Vehicle_Verification_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Verification_Issues" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "section" "public"."VERIFICATION_ISSUES_SECTION" NOT NULL,
    "field" "public"."VERIFICATION_ISSUES_FIELD" NOT NULL,
    "ISSUES_CODE" "public"."VERIFICATION_ISSUES_CODE" NOT NULL
);


ALTER TABLE "public"."Verification_Issues" OWNER TO "postgres";


ALTER TABLE "public"."Verification_Issues" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Verification_Issues_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_document_img_key_key" UNIQUE ("document_img_key");



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_document_number_key" UNIQUE ("document_number");



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_pending_document_img_key_key" UNIQUE ("pending_document_img_key");



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver_Location"
    ADD CONSTRAINT "Driver_Location_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver_Online_Status_Audit"
    ADD CONSTRAINT "Driver_Online_Status_Audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver_Verification_Audit"
    ADD CONSTRAINT "Driver_Verification_Audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver_Verification"
    ADD CONSTRAINT "Driver_Verification_driver_id_key" UNIQUE ("driver_id");



ALTER TABLE ONLY "public"."Driver_Verification"
    ADD CONSTRAINT "Driver_Verification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_driver_img_key_key" UNIQUE ("driver_img_key");



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_pending_driver_img_key_key" UNIQUE ("pending_driver_img_key");



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order_Offer_Views"
    ADD CONSTRAINT "Order_Offer_Views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order_Offers"
    ADD CONSTRAINT "Order_Offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order_Status_Audit"
    ADD CONSTRAINT "Order_Status_Audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."STAFF"
    ADD CONSTRAINT "STAFF_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."STAFF"
    ADD CONSTRAINT "STAFF_staff_id_key" UNIQUE ("staff_id");



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_profile_photo_key_key" UNIQUE ("profile_photo_key");



ALTER TABLE ONLY "public"."User_Account_Status_Audit"
    ADD CONSTRAINT "User_Account_Status_Audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User_Account_Status"
    ADD CONSTRAINT "User_Account_Status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User_Account_Status"
    ADD CONSTRAINT "User_Account_Status_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle_Documents"
    ADD CONSTRAINT "Vehicle_Documents_document_number_key" UNIQUE ("document_number");



ALTER TABLE ONLY "public"."Vehicle_Documents"
    ADD CONSTRAINT "Vehicle_Documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle_Documents"
    ADD CONSTRAINT "Vehicle_Documents_vehicle_document_img_key_key" UNIQUE ("document_img_key");



ALTER TABLE ONLY "public"."Vehicle_Photos"
    ADD CONSTRAINT "Vehicle_Photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle_Photos"
    ADD CONSTRAINT "Vehicle_Photos_vehicle_id_key" UNIQUE ("vehicle_id");



ALTER TABLE ONLY "public"."Vehicle_Verification_Audit"
    ADD CONSTRAINT "Vehicle_Verification_Audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle_Verification"
    ADD CONSTRAINT "Vehicle_Verification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle_Verification"
    ADD CONSTRAINT "Vehicle_Verification_vehicle_id_key" UNIQUE ("vehicle_id");



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_current_driver_id_key" UNIQUE ("current_driver_id");



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_plate_number_key" UNIQUE ("plate_number");



ALTER TABLE ONLY "public"."Verification_Issues"
    ADD CONSTRAINT "Verification_Issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order_Offer_Views"
    ADD CONSTRAINT "order_offer_views_order_driver_unique" UNIQUE ("order_id", "driver_id");



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Driver" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Driver_Documents" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Driver_Verification" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Shipper" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."User" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."User_Account_Status" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Vehicle" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Vehicle_Documents" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Vehicle_Photos" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "enforce_timestamps" BEFORE INSERT OR UPDATE ON "public"."Vehicle_Verification" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_timestamp_columns"();



CREATE OR REPLACE TRIGGER "trg_driver_before_update" BEFORE UPDATE ON "public"."Driver" FOR EACH ROW EXECUTE FUNCTION "public"."driver_before_update"();



CREATE OR REPLACE TRIGGER "trg_driver_documents_before_update" BEFORE UPDATE ON "public"."Driver_Documents" FOR EACH ROW EXECUTE FUNCTION "public"."driver_documents_before_update"();



CREATE OR REPLACE TRIGGER "trg_driver_verification_before_update" BEFORE UPDATE ON "public"."Driver_Verification" FOR EACH ROW EXECUTE FUNCTION "public"."driver_verification_before_update"();



CREATE OR REPLACE TRIGGER "vehicle_documents_update_field_guard" BEFORE UPDATE ON "public"."Vehicle_Documents" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_vehicle_documents_update_fields"();



CREATE OR REPLACE TRIGGER "vehicle_photos_update_field_guard" BEFORE UPDATE ON "public"."Vehicle_Photos" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_vehicle_photos_update_fields"();



CREATE OR REPLACE TRIGGER "vehicle_update_field_guard" BEFORE UPDATE ON "public"."Vehicle" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_vehicle_update_fields"();



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver_Location"
    ADD CONSTRAINT "Driver_Location_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver_Online_Status_Audit"
    ADD CONSTRAINT "Driver_Online_Status_Audit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."STAFF"("staff_id");



ALTER TABLE ONLY "public"."Driver_Online_Status_Audit"
    ADD CONSTRAINT "Driver_Online_Status_Audit_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver_Verification_Audit"
    ADD CONSTRAINT "Driver_Verification_Audit_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver_Verification_Audit"
    ADD CONSTRAINT "Driver_Verification_Audit_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."STAFF"("staff_id");



ALTER TABLE ONLY "public"."Driver_Verification"
    ADD CONSTRAINT "Driver_Verification_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Order_Offer_Views"
    ADD CONSTRAINT "Order_Offer_Views_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id");



ALTER TABLE ONLY "public"."Order_Offer_Views"
    ADD CONSTRAINT "Order_Offer_Views_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Order_Offers"
    ADD CONSTRAINT "Order_Offers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id");



ALTER TABLE ONLY "public"."Order_Offers"
    ADD CONSTRAINT "Order_Offers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Order_Offers"
    ADD CONSTRAINT "Order_Offers_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "public"."Shipper"("id");



ALTER TABLE ONLY "public"."Order_Status_Audit"
    ADD CONSTRAINT "Order_Status_Audit_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Order"
    ADD CONSTRAINT "Order_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id");



ALTER TABLE ONLY "public"."Order"
    ADD CONSTRAINT "Order_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "public"."Shipper"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."STAFF"
    ADD CONSTRAINT "STAFF_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User_Account_Status_Audit"
    ADD CONSTRAINT "User_Account_Status_Audit_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."STAFF"("staff_id");



ALTER TABLE ONLY "public"."User_Account_Status_Audit"
    ADD CONSTRAINT "User_Account_Status_Audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User_Account_Status"
    ADD CONSTRAINT "User_Account_Status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Documents"
    ADD CONSTRAINT "Vehicle_Documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Photos"
    ADD CONSTRAINT "Vehicle_Photos_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Verification_Audit"
    ADD CONSTRAINT "Vehicle_Verification_Audit_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."STAFF"("staff_id");



ALTER TABLE ONLY "public"."Vehicle_Verification_Audit"
    ADD CONSTRAINT "Vehicle_Verification_Audit_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Verification"
    ADD CONSTRAINT "Vehicle_Verification_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_current_driver_id_fkey" FOREIGN KEY ("current_driver_id") REFERENCES "public"."Driver"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_owner_driver_id_fkey" FOREIGN KEY ("owner_driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Verification_Issues"
    ADD CONSTRAINT "Verification_Issues_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE SET NULL;



CREATE POLICY "Auth Driver can insert own Driver Documents" ON "public"."Driver_Documents" FOR INSERT TO "authenticated" WITH CHECK ((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("status" = 'PENDING'::"public"."VERIFICATION_STATUS") AND ("document_img_key" IS NULL) AND ("pending_document_img_key" IS NULL) AND ("pending_document_img_key_at" IS NULL) AND ("pending_expiry_date" IS NULL) AND ("pending_license_class" IS NULL) AND ("document_owner_name" IS NULL) AND ("gender" IS NULL)));



CREATE POLICY "Auth Driver or Auth Staff can select Verification Issues" ON "public"."Verification_Issues" FOR SELECT TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth Driver or Auth Staff can update Driver Verification" ON "public"."Driver_Verification" FOR UPDATE TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth Owner Vehicle can select Vehicle Verification" ON "public"."Vehicle_Verification" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Verification"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES")))));



CREATE POLICY "Auth Shipper can select own shipper profile" ON "public"."Shipper" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES"))))));



CREATE POLICY "Auth Staff can insert Driver verification audits" ON "public"."Driver_Verification_Audit" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth Staff can insert into STAFF" ON "public"."STAFF" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF" "STAFF_1"
  WHERE (("STAFF_1"."staff_id" = "auth"."uid"()) AND ("STAFF_1"."active_status" = true) AND ("STAFF_1"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth Staff only can insert Vehicle Verification Auditi" ON "public"."Vehicle_Verification_Audit" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth Staff or Auth Driver can delete verification issues" ON "public"."Verification_Issues" FOR DELETE TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth User can insert into own User_Account_Status" ON "public"."User_Account_Status" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User"
  WHERE ("User"."id" = "auth"."uid"()))) AND ("account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")));



CREATE POLICY "Auth Vehicle Owner can delete own Vehicle Documents" ON "public"."Vehicle_Documents" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Documents"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))));



CREATE POLICY "Auth Vehicle Owner can delete own vehicle photos" ON "public"."Vehicle_Photos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Photos"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))));



CREATE POLICY "Auth Vehicle Owner can insert Vehicle Documents" ON "public"."Vehicle_Documents" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Documents"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("document_img_key" IS NULL) AND ("pending_document_img_key" IS NULL) AND ("pending_document_img_key_at" IS NULL) AND ("pending_expiry_date" IS NULL)));



CREATE POLICY "Auth Vehicle Owner can select own vehicle" ON "public"."Vehicle" FOR SELECT TO "authenticated" USING (("owner_driver_id" = "auth"."uid"()));



CREATE POLICY "Auth Vehicle Owner or Staff can update vehicle" ON "public"."Vehicle" FOR UPDATE TO "authenticated" USING (((("owner_driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((("owner_driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth Vehicle owner can delete own Vehicle Verification" ON "public"."Vehicle_Verification" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Verification"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))));



CREATE POLICY "Auth Vehicle owner can delete own vehicle" ON "public"."Vehicle" FOR DELETE TO "authenticated" USING ((("owner_driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth Vehicle owner can insert Vehicle Verification" ON "public"."Vehicle_Verification" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Verification"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("verification_status" = 'PENDING'::"public"."VERIFICATION_STATUS")));



CREATE POLICY "Auth Vehicle owner can insert own Vehicle" ON "public"."Vehicle" FOR INSERT TO "authenticated" WITH CHECK ((("owner_driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("current_driver_id" IS NULL) AND ("vehicle_manufacturer" IS NULL) AND ("vehicle_model" IS NULL) AND ("vehicle_color" IS NULL) AND ("pending_plate_number" IS NULL) AND ("pending_vehicle_color" IS NULL)));



CREATE POLICY "Auth Vehicle owner can insert own Vehicle Photos" ON "public"."Vehicle_Photos" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Photos"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("vehicle_photos_keys" IS NULL) AND ("pending_vehicle_photos_keys" IS NULL)));



CREATE POLICY "Auth Vehicle owner can select own vehicle photos" ON "public"."Vehicle_Photos" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Photos"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))));



CREATE POLICY "Auth Vehicle owner or Staff can update Vehicle Documents" ON "public"."Vehicle_Documents" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Documents"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Documents"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth Vehicle owner or Staff can update vehicle photos" ON "public"."Vehicle_Photos" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Photos"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Photos"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth active user can update own User table" ON "public"."User" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))))) WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth driver can insert own driver verification row" ON "public"."Driver_Verification" FOR INSERT TO "authenticated" WITH CHECK ((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("verification_status" = 'PENDING'::"public"."VERIFICATION_STATUS")));



CREATE POLICY "Auth driver or Auth Staff can update driver row" ON "public"."Driver" FOR UPDATE TO "authenticated" USING (((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth driver or Staff can select Driver Documents" ON "public"."Driver_Documents" FOR SELECT TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth driver or Staff can select own driver verification" ON "public"."Driver_Verification" FOR SELECT TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth driver or Staff can update Driver Documents" ON "public"."Driver_Documents" FOR UPDATE TO "authenticated" USING (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))))) WITH CHECK (((("driver_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."Driver" "d"
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))) OR (EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))));



CREATE POLICY "Auth shipper can update own shipper profile" ON "public"."Shipper" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))))) WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth staff only can insert in Verification Issues" ON "public"."Verification_Issues" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth user can create own shipper profile" ON "public"."Shipper" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth user can delete own User table" ON "public"."User" FOR DELETE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth user can insert into own driver table" ON "public"."Driver" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES")))) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("online_status" = 'OFFLINE'::"public"."ONLINE_STATUS") AND ("driver_img_key" IS NULL) AND ("pending_driver_img_key" IS NULL) AND ("pending_driver_img_key_at" IS NULL)));



CREATE POLICY "Auth user can insert to User" ON "public"."User" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select Driver" ON "public"."Driver" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select own User table" ON "public"."User" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select own User_Account_Status" ON "public"."User_Account_Status" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Auth vehicle owner can select own vehicle documents" ON "public"."Vehicle_Documents" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Documents"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))));



ALTER TABLE "public"."Driver" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Location" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Online_Status_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Verification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Verification_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Order_Offer_Views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Order_Offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Order_Status_Audit" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Owner can resubmit rejected vehicle verification" ON "public"."Vehicle_Verification" FOR UPDATE TO "authenticated" USING ((("verification_status" = 'REJECTED'::"public"."VERIFICATION_STATUS") AND (EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Verification"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))))) WITH CHECK ((("verification_status" = 'PENDING'::"public"."VERIFICATION_STATUS") AND (EXISTS ( SELECT 1
   FROM ((("public"."Vehicle" "v"
     JOIN "public"."Driver" "d" ON (("d"."id" = "v"."owner_driver_id")))
     JOIN "public"."User" "u" ON (("u"."id" = "d"."id")))
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("v"."id" = "Vehicle_Verification"."vehicle_id") AND ("v"."owner_driver_id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



ALTER TABLE "public"."STAFF" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Shipper" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Staff only can update vehicle verification" ON "public"."Vehicle_Verification" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User_Account_Status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User_Account_Status_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Verification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Verification_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Verification_Issues" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."clear_pending_driver_photo"() TO "anon";
GRANT ALL ON FUNCTION "public"."clear_pending_driver_photo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_pending_driver_photo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_pending_license_data"("p_field" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_pending_license_data"("p_field" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_pending_license_data"("p_field" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."driver_before_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."driver_before_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."driver_before_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."driver_documents_before_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."driver_documents_before_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."driver_documents_before_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."driver_verification_before_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."driver_verification_before_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."driver_verification_before_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_vehicle_documents_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_documents_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_documents_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_vehicle_photos_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_photos_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_photos_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_vehicle_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_vehicle_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_driver_photo_issue"() TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_driver_photo_issue"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_driver_photo_issue"() TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_identity_photo_issue"("p_document_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_identity_photo_issue"("p_document_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_identity_photo_issue"("p_document_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_identity_info"("p_field" "text", "p_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_identity_info"("p_field" "text", "p_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_identity_info"("p_field" "text", "p_value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pending_driver_photo"("p_path" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_pending_driver_photo"("p_path" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pending_driver_photo"("p_path" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pending_license_data"("p_field" "text", "p_value" "text", "p_photo_path" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_pending_license_data"("p_field" "text", "p_value" "text", "p_photo_path" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pending_license_data"("p_field" "text", "p_value" "text", "p_photo_path" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_field"("p_field" "text", "p_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_field"("p_field" "text", "p_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_field"("p_field" "text", "p_value" "text") TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,MAINTAIN,UPDATE ON TABLE "public"."Driver" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,MAINTAIN,UPDATE ON TABLE "public"."Driver_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Documents" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Location" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Location" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Location" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,MAINTAIN,UPDATE ON TABLE "public"."Driver_Verification" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Verification" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "service_role";



GRANT ALL ON TABLE "public"."Order" TO "anon";
GRANT ALL ON TABLE "public"."Order" TO "authenticated";
GRANT ALL ON TABLE "public"."Order" TO "service_role";



GRANT ALL ON TABLE "public"."Order_Offer_Views" TO "anon";
GRANT ALL ON TABLE "public"."Order_Offer_Views" TO "authenticated";
GRANT ALL ON TABLE "public"."Order_Offer_Views" TO "service_role";



GRANT ALL ON TABLE "public"."Order_Offers" TO "anon";
GRANT ALL ON TABLE "public"."Order_Offers" TO "authenticated";
GRANT ALL ON TABLE "public"."Order_Offers" TO "service_role";



GRANT ALL ON TABLE "public"."Order_Status_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Order_Status_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Order_Status_Audit" TO "service_role";



GRANT ALL ON TABLE "public"."STAFF" TO "anon";
GRANT ALL ON TABLE "public"."STAFF" TO "authenticated";
GRANT ALL ON TABLE "public"."STAFF" TO "service_role";



GRANT ALL ON TABLE "public"."Shipper" TO "anon";
GRANT ALL ON TABLE "public"."Shipper" TO "authenticated";
GRANT ALL ON TABLE "public"."Shipper" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";



GRANT ALL ON TABLE "public"."User_Account_Status" TO "anon";
GRANT ALL ON TABLE "public"."User_Account_Status" TO "authenticated";
GRANT ALL ON TABLE "public"."User_Account_Status" TO "service_role";



GRANT ALL ON TABLE "public"."User_Account_Status_Audit" TO "anon";
GRANT ALL ON TABLE "public"."User_Account_Status_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."User_Account_Status_Audit" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."Vehicle" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle" TO "service_role";



GRANT UPDATE("current_driver_id") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("plate_number") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_type") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_capacity") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_manufacturer") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_model") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_color") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("vehicle_year") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("pending_plate_number") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT UPDATE("pending_vehicle_color") ON TABLE "public"."Vehicle" TO "authenticated";



GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."Vehicle_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "service_role";



GRANT UPDATE("document_type") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("document_number") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("document_img_key") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("expiry_date") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("pending_document_img_key") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("pending_document_img_key_at") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT UPDATE("pending_expiry_date") ON TABLE "public"."Vehicle_Documents" TO "authenticated";



GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."Vehicle_Photos" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "service_role";



GRANT UPDATE("vehicle_photos_keys") ON TABLE "public"."Vehicle_Photos" TO "authenticated";



GRANT UPDATE("pending_vehicle_photos_keys") ON TABLE "public"."Vehicle_Photos" TO "authenticated";



GRANT ALL ON TABLE "public"."Vehicle_Verification" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Verification" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Verification" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle_Verification_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Verification_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Verification_Audit" TO "service_role";



GRANT ALL ON TABLE "public"."Verification_Issues" TO "anon";
GRANT ALL ON TABLE "public"."Verification_Issues" TO "authenticated";
GRANT ALL ON TABLE "public"."Verification_Issues" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Verification_Issues_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Verification_Issues_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Verification_Issues_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







