-- Script to get detailed database schema information

-- List all tables with comments
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- List all columns with their types and constraints
SELECT t.table_name, c.column_name, c.data_type, c.is_nullable, c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- List all primary keys
SELECT tc.table_name, kc.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc ON kc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public';

-- List all foreign keys
SELECT tc.table_name as source_table, kcu.column_name as source_column,
       ccu.table_name AS target_table, ccu.column_name AS target_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- List constraints
SELECT tc.constraint_name, tc.table_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type; 