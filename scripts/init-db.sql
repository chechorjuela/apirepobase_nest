-- Database initialization script for api-base-project
-- This script will be executed when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE api_base_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas if needed
-- CREATE SCHEMA IF NOT EXISTS app;
-- CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE api_base_db TO api_user;

-- Create audit table for tracking changes (optional)
-- CREATE TABLE IF NOT EXISTS audit.audit_log (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     table_name VARCHAR(255) NOT NULL,
--     operation VARCHAR(10) NOT NULL,
--     old_values JSONB,
--     new_values JSONB,
--     changed_by VARCHAR(255),
--     changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Set default timezone
SET timezone = 'UTC';

-- Log the completion
SELECT 'Database initialization completed successfully!' AS message;
