


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
    'CLASS J/I',
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


CREATE TYPE "public"."ONLINE_STATUS" AS ENUM (
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE "public"."ONLINE_STATUS" OWNER TO "postgres";


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
    'PICK_UP_TRUCK',
    'BOX_TRUCK',
    'FLATBED_TRUCK',
    'VAN_TRUCK',
    'TIPPER_TRUCK',
    'CONTAINER_TRUCK'
);


ALTER TYPE "public"."VEHICLE_TYPE" OWNER TO "postgres";


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
    'VEHICLE_SIDE_PHOTO_INVALID'
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
    'VEHICLE_CAPACITY'
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

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Driver" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "birthday" "text" NOT NULL,
    "driver_img_key" "text",
    "online_status" "public"."ONLINE_STATUS" DEFAULT 'OFFLINE'::"public"."ONLINE_STATUS" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pending_driver_img_key" "text",
    "pending_driver_img_key_at" "text"
);


ALTER TABLE "public"."Driver" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_number" "text" NOT NULL,
    "document_img_key" "text",
    "document_type" "public"."DRIVER_DOCUMENT_TYPE" NOT NULL,
    "expiry_date" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "status" "public"."VERIFICATION_STATUS" DEFAULT 'PENDING'::"public"."VERIFICATION_STATUS" NOT NULL,
    "pending_document_img_key" "text",
    "pending_document_img_key_at" "text",
    "license_class" "public"."DRIVER_LICENSE_CLASS",
    "pending_expiry_date" "text",
    "pending_license_class" "public"."DRIVER_LICENSE_CLASS",
    CONSTRAINT "expiry_date_matches_document_type" CHECK (((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("expiry_date" IS NOT NULL)) OR (("document_type" <> 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("expiry_date" IS NULL)))),
    CONSTRAINT "license_class_matches_document_type" CHECK (((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("license_class" IS NOT NULL)) OR (("document_type" <> 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") AND ("license_class" IS NULL)))),
    CONSTRAINT "pending_fields_match_document_type" CHECK ((("document_type" = 'DRIVER_LICENSE'::"public"."DRIVER_DOCUMENT_TYPE") OR (("pending_license_class" IS NULL) AND ("pending_expiry_date" IS NULL))))
);


ALTER TABLE "public"."Driver_Documents" OWNER TO "postgres";


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
    "verification_status" "public"."VERIFICATION_STATUS",
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
    "vehicle_capacity" numeric NOT NULL
);


ALTER TABLE "public"."Vehicle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "document_type" "public"."DRIVER_DOCUMENT_TYPE" NOT NULL,
    "document_number" "text",
    "vehicle_document_img_key" "text" NOT NULL,
    "expiry_date" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Vehicle_Documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "vehicle_photos_keys" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Vehicle_Photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Verification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "vehicle_manufacturer" "text",
    "vehicle_model" "text",
    "vehicle_color" "text",
    "verification_status" "public"."VERIFICATION_STATUS" NOT NULL,
    "vehicle_year" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Vehicle_Verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Verification_Audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_verification_id" "uuid" NOT NULL,
    "verifier_id" "uuid" NOT NULL,
    "verified_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decision" "public"."VERIFICATION_STATUS" NOT NULL
);


ALTER TABLE "public"."Vehicle_Verification_Audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Verification_Issues" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "section" "public"."VERIFICATION_ISSUES_SECTION",
    "field" "public"."VERIFICATION_ISSUES_FIELD",
    "ISSUES_CODE" "public"."VERIFICATION_ISSUES_CODE"
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
    ADD CONSTRAINT "Vehicle_Documents_vehicle_document_img_key_key" UNIQUE ("vehicle_document_img_key");



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



CREATE OR REPLACE TRIGGER "driver_documents_update_field_guard" BEFORE UPDATE ON "public"."Driver_Documents" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_driver_documents_update_fields"();



CREATE OR REPLACE TRIGGER "driver_update_field_guard" BEFORE UPDATE ON "public"."Driver" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_driver_update_fields"();



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



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "Vehicle_Verification_Audit_vehicle_verification_id_fkey" FOREIGN KEY ("vehicle_verification_id") REFERENCES "public"."Driver_Verification"("id") ON DELETE CASCADE;



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
  WHERE (("d"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("status" = 'PENDING'::"public"."VERIFICATION_STATUS") AND ("document_img_key" IS NULL) AND ("pending_document_img_key" IS NULL) AND ("pending_document_img_key_at" IS NULL) AND ("pending_expiry_date" IS NULL) AND ("pending_license_class" IS NULL)));



CREATE POLICY "Auth Staff can insert Driver verification audits" ON "public"."Driver_Verification_Audit" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth Staff can update verification_status" ON "public"."Driver_Verification" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."STAFF"
  WHERE (("STAFF"."staff_id" = "auth"."uid"()) AND ("STAFF"."active_status" = true) AND ("STAFF"."role" = ANY (ARRAY['STAFF'::"public"."STAFF_ROLES", 'SUPER_ADMIN'::"public"."STAFF_ROLES"]))))));



CREATE POLICY "Auth User can insert into own Driver table" ON "public"."Driver" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'DRIVER'::"public"."USER_ROLES")))) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))) AND ("online_status" = 'OFFLINE'::"public"."ONLINE_STATUS") AND ("driver_img_key" IS NULL) AND ("pending_driver_img_key" IS NULL) AND ("pending_driver_img_key_at" IS NULL)));



CREATE POLICY "Auth User can insert into own User_Account_Status" ON "public"."User_Account_Status" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User"
  WHERE ("User"."id" = "auth"."uid"()))) AND ("account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")));



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



CREATE POLICY "Auth user can create own shipper profile" ON "public"."Shipper" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."User" "u"
     JOIN "public"."User_Account_Status" "uas" ON (("uas"."user_id" = "u"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth user can delete own User table" ON "public"."User" FOR DELETE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User_Account_Status" "uas"
  WHERE (("uas"."user_id" = "auth"."uid"()) AND ("uas"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth user can insert to User" ON "public"."User" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select Driver" ON "public"."Driver" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select own User table" ON "public"."User" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Auth user can select own User_Account_Status" ON "public"."User_Account_Status" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."Driver" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Online_Status_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Verification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Verification_Audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."STAFF" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Shipper" ENABLE ROW LEVEL SECURITY;


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



GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_driver_documents_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_driver_update_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_timestamp_columns"() TO "service_role";



GRANT ALL ON TABLE "public"."Driver" TO "anon";
GRANT ALL ON TABLE "public"."Driver" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Documents" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Documents" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Online_Status_Audit" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Verification" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."Driver_Verification" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Verification" TO "service_role";



GRANT UPDATE("verification_status") ON TABLE "public"."Driver_Verification" TO "authenticated";



GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Verification_Audit" TO "service_role";



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
GRANT ALL ON TABLE "public"."Vehicle" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "service_role";



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







