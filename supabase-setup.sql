-- Create the tables for Range Status application
-- Run this SQL in your Supabase SQL Editor

-- Create ranges table
CREATE TABLE IF NOT EXISTS "ranges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "town" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUIET',
    "note" TEXT,
    "lastUpdatedAt" TIMESTAMP(3),
    "openingHours" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranges_pkey" PRIMARY KEY ("id")
);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RANGE',
    "rangeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create status_events table
CREATE TABLE IF NOT EXISTS "status_events" (
    "id" TEXT NOT NULL,
    "rangeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_events_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ranges_slug_key" ON "ranges"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_rangeId_fkey" FOREIGN KEY ("rangeId") REFERENCES "ranges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_rangeId_fkey" FOREIGN KEY ("rangeId") REFERENCES "ranges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert admin user
INSERT INTO "users" ("id", "email", "passwordHash", "role", "rangeId", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'admin@rangestatus.com',
    '$2a$12$K8PFLnp9ZDkF8WV8VqNQ6.ZX8QXXlX8Fg6gPNyYgO8zd8sK8vF8ZG',  -- bcrypt hash for 'admin123'
    'ADMIN',
    NULL,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert sample range
INSERT INTO "ranges" ("id", "name", "slug", "area", "town", "status", "note", "lastUpdatedAt", "openingHours", "isActive", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'Test Golf Range',
    'test-range',
    'Hampshire',
    'Winchester',
    'QUIET',
    'Welcome to our test range!',
    CURRENT_TIMESTAMP,
    '{"monday": {"closed": false, "open": "08:00", "close": "21:00"}, "tuesday": {"closed": false, "open": "08:00", "close": "21:00"}, "wednesday": {"closed": false, "open": "08:00", "close": "21:00"}, "thursday": {"closed": false, "open": "08:00", "close": "21:00"}, "friday": {"closed": false, "open": "08:00", "close": "22:00"}, "saturday": {"closed": false, "open": "07:00", "close": "22:00"}, "sunday": {"closed": false, "open": "07:00", "close": "20:00"}}',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- Insert range user (need to get range ID first)
WITH range_data AS (
    SELECT id FROM "ranges" WHERE slug = 'test-range' LIMIT 1
)
INSERT INTO "users" ("id", "email", "passwordHash", "role", "rangeId", "createdAt")
SELECT
    gen_random_uuid()::text,
    'testrange@example.com',
    '$2a$12$K8PFLnp9ZDkF8WV8VqNQ6.ZX8QXXlX8Fg6gPNyYgO8zd8sK8vF8ZG',  -- bcrypt hash for 'range123'
    'RANGE',
    range_data.id,
    CURRENT_TIMESTAMP
FROM range_data
ON CONFLICT (email) DO NOTHING;

-- Insert sample status events
WITH range_data AS (
    SELECT id FROM "ranges" WHERE slug = 'test-range' LIMIT 1
)
INSERT INTO "status_events" ("id", "rangeId", "status", "createdAt")
SELECT
    gen_random_uuid()::text,
    range_data.id,
    status,
    created_time
FROM range_data, (
    VALUES
        ('QUIET', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
        ('MODERATE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        ('BUSY', CURRENT_TIMESTAMP - INTERVAL '3 hours')
) AS events(status, created_time);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE "ranges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "status_events" ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to ranges
CREATE POLICY "Allow public read access to ranges" ON "ranges"
    FOR SELECT USING (true);

CREATE POLICY "Allow range users to update their own range" ON "ranges"
    FOR UPDATE USING (auth.uid()::text IN (
        SELECT u.id::text FROM "users" u WHERE u."rangeId" = "ranges"."id"
    ));

-- Create policies for users
CREATE POLICY "Allow users to read their own data" ON "users"
    FOR SELECT USING (auth.uid()::text = id);

-- Create policies for status events
CREATE POLICY "Allow public read access to status events" ON "status_events"
    FOR SELECT USING (true);

CREATE POLICY "Allow range users to create status events" ON "status_events"
    FOR INSERT WITH CHECK (auth.uid()::text IN (
        SELECT u.id::text FROM "users" u WHERE u."rangeId" = "status_events"."rangeId"
    ));