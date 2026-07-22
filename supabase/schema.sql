


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
    'CLASS D',
    'CLASS E',
    'CLASS F',
    'CLASS G',
    'CLASS H',
    'CLASS V'
);


ALTER TYPE "public"."DRIVER_LICENSE_CLASS" OWNER TO "postgres";


CREATE TYPE "public"."ONLINE_STATUS" AS ENUM (
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE "public"."ONLINE_STATUS" OWNER TO "postgres";


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

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Driver" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text" NOT NULL,
    "lastname" "text" NOT NULL,
    "birthday" "text" NOT NULL,
    "driver_img_key" "text" NOT NULL,
    "verification_status" "public"."VERIFICATION_STATUS" DEFAULT 'PENDING'::"public"."VERIFICATION_STATUS",
    "verified_by" "text",
    "verified_at" "text",
    "online_status" "public"."ONLINE_STATUS" DEFAULT 'OFFLINE'::"public"."ONLINE_STATUS" NOT NULL
);


ALTER TABLE "public"."Driver" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Driver_Documents" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_number" "text" NOT NULL,
    "document_img_key" "text" NOT NULL,
    "document_type" "public"."DRIVER_DOCUMENT_TYPE" NOT NULL,
    "expiry_date" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Driver_Documents" OWNER TO "postgres";


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
    "active_role" "public"."USER_ROLES",
    "has_shipper_profile" boolean,
    "has_driver_profile" boolean,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "account_status" "public"."ACCOUNT_STATUS" NOT NULL,
    "email" "text",
    "phone" "text"
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_driver_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "current_driver_id" "uuid" DEFAULT "gen_random_uuid"(),
    "plate_number" "text" NOT NULL,
    "vehicle_type" "public"."VEHICLE_TYPE" NOT NULL,
    "vehicle_manufacturer" "text",
    "vehicle_model" "text",
    "vehicle_year" "text",
    "vehicle_color" "text",
    "verification_status" "public"."VERIFICATION_STATUS" DEFAULT 'PENDING'::"public"."VERIFICATION_STATUS" NOT NULL,
    "verified_at" "text",
    "verified_by" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Vehicle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vehicle_Documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehicle_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
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


CREATE TABLE IF NOT EXISTS "public"."Verification_Issues" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "driver_id" "text",
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
    ADD CONSTRAINT "Driver_Documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_driver_img_key_key" UNIQUE ("driver_img_key");



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_profile_photo_key_key" UNIQUE ("profile_photo_key");



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



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_current_driver_id_key" UNIQUE ("current_driver_id");



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_plate_number_key" UNIQUE ("plate_number");



ALTER TABLE ONLY "public"."Verification_Issues"
    ADD CONSTRAINT "Verification_Issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Driver_Documents"
    ADD CONSTRAINT "Driver_Documents_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Driver"
    ADD CONSTRAINT "Driver_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Shipper"
    ADD CONSTRAINT "Shipper_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Documents"
    ADD CONSTRAINT "Vehicle_Documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle_Photos"
    ADD CONSTRAINT "Vehicle_Photos_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_current_driver_id_fkey" FOREIGN KEY ("current_driver_id") REFERENCES "public"."Driver"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Vehicle"
    ADD CONSTRAINT "Vehicle_owner_driver_id_fkey" FOREIGN KEY ("owner_driver_id") REFERENCES "public"."Driver"("id") ON DELETE CASCADE;



CREATE POLICY "Auth shipper can update own shipper profile" ON "public"."Shipper" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("u"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS")))))) WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("u"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



CREATE POLICY "Auth user can create own shipper profile" ON "public"."Shipper" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."User" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."active_role" = 'SHIPPER'::"public"."USER_ROLES") AND ("u"."account_status" = 'ACTIVE'::"public"."ACCOUNT_STATUS"))))));



ALTER TABLE "public"."Driver" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Driver_Documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Shipper" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Vehicle_Photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Verification_Issues" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."Driver" TO "anon";
GRANT ALL ON TABLE "public"."Driver" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver" TO "service_role";



GRANT ALL ON TABLE "public"."Driver_Documents" TO "anon";
GRANT ALL ON TABLE "public"."Driver_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Driver_Documents" TO "service_role";



GRANT ALL ON TABLE "public"."Shipper" TO "anon";
GRANT ALL ON TABLE "public"."Shipper" TO "authenticated";
GRANT ALL ON TABLE "public"."Shipper" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Documents" TO "service_role";



GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "anon";
GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "authenticated";
GRANT ALL ON TABLE "public"."Vehicle_Photos" TO "service_role";



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







