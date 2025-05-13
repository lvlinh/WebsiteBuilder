/**
 * Schema Dump Script
 * Extracts the current schema from Neon database and generates Drizzle schema file
 */

import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neon database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Output file path
const outputPath = path.join(__dirname, '..', 'shared', 'schema.dump.ts');

// Function to get all tables
async function getTables() {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  return result.rows.map(row => row.table_name);
}

// Function to get table columns
async function getTableColumns(tableName) {
  const result = await pool.query(`
    SELECT 
      column_name, 
      data_type, 
      character_maximum_length,
      is_nullable, 
      column_default,
      (
        SELECT pg_get_constraintdef(pg_constraint.oid) 
        FROM pg_constraint
        WHERE pg_constraint.conrelid = (
          SELECT oid FROM pg_class WHERE relname = $1
        )
        AND pg_constraint.contype = 'p'
        AND array_position(pg_constraint.conkey, cols.ordinal_position) IS NOT NULL
      ) as primary_key
    FROM information_schema.columns cols
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows;
}

// Function to get foreign keys
async function getTableForeignKeys(tableName) {
  const result = await pool.query(`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
  `, [tableName]);
  
  return result.rows;
}

// Function to convert PostgreSQL type to Drizzle type
function pgTypeToDrizzleType(pgType, maxLength) {
  switch (pgType.toLowerCase()) {
    case 'integer':
      return 'integer';
    case 'bigint':
      return 'bigint';
    case 'character varying':
      return maxLength ? `varchar(${maxLength})` : 'text';
    case 'text':
      return 'text';
    case 'boolean':
      return 'boolean';
    case 'timestamp with time zone':
    case 'timestamp without time zone':
      return 'timestamp';
    case 'date':
      return 'date';
    case 'jsonb':
    case 'json':
      return 'json';
    case 'uuid':
      return 'uuid';
    case 'double precision':
      return 'doublePrecision';
    case 'real':
      return 'real';
    case 'numeric':
      return 'numeric';
    default:
      return 'text';
  }
}

// Function to generate Drizzle schema
async function generateDrizzleSchema() {
  try {
    console.log('📊 Starting schema extraction...');
    
    const tables = await getTables();
    console.log(`📋 Found ${tables.length} tables`);
    
    // Start building the schema file
    let schemaContent = `
import { pgTable, serial, text, integer, boolean, timestamp, varchar, bigint, json, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Generated schema from existing database
// Generated on: ${new Date().toISOString()}
`;
    
    // Process each table
    for (const tableName of tables) {
      console.log(`🔍 Processing table: ${tableName}`);
      
      const columns = await getTableColumns(tableName);
      const foreignKeys = await getTableForeignKeys(tableName);
      
      // Skip session tables and other system tables
      if (tableName.includes('session') || tableName.includes('migrations') || tableName.includes('_')) {
        console.log(`⏭️ Skipping system table: ${tableName}`);
        continue;
      }
      
      // Generate table definition
      schemaContent += `\n// ${tableName} table\n`;
      schemaContent += `export const ${tableName} = pgTable('${tableName}', {\n`;
      
      // Add columns
      for (const column of columns) {
        const { column_name, data_type, character_maximum_length, is_nullable, column_default, primary_key } = column;
        
        // Convert PostgreSQL type to Drizzle type
        const drizzleType = pgTypeToDrizzleType(data_type, character_maximum_length);
        
        // Check if column is primary key
        const isPrimaryKey = primary_key && primary_key.includes('PRIMARY KEY');
        
        // Generate column definition
        let columnDef = '';
        
        if (column_name === 'id' && isPrimaryKey && data_type === 'integer') {
          columnDef = `  ${column_name}: serial('${column_name}').primaryKey()`;
        } else {
          columnDef = `  ${column_name}: ${drizzleType}('${column_name}')`;
          
          // Add nullable if applicable
          if (is_nullable === 'YES') {
            columnDef += '.notNull(false)';
          } else {
            columnDef += '.notNull()';
          }
          
          // Add primary key if applicable
          if (isPrimaryKey) {
            columnDef += '.primaryKey()';
          }
          
          // Add default if applicable
          if (column_default && !column_default.includes('nextval')) {
            let defaultValue = column_default;
            
            // Clean up default value
            if (defaultValue.startsWith('\'') && defaultValue.endsWith('\'')) {
              defaultValue = defaultValue.substring(1, defaultValue.length - 1);
              columnDef += `.default('${defaultValue}')`;
            } else if (defaultValue === 'true' || defaultValue === 'false') {
              columnDef += `.default(${defaultValue})`;
            } else if (defaultValue === 'CURRENT_TIMESTAMP') {
              columnDef += `.default(sql\`CURRENT_TIMESTAMP\`)`;
            } else if (!isNaN(Number(defaultValue))) {
              columnDef += `.default(${defaultValue})`;
            }
          }
        }
        
        schemaContent += `${columnDef},\n`;
      }
      
      schemaContent += '});\n';
      
      // Generate relations if foreign keys exist
      if (foreignKeys.length > 0) {
        schemaContent += `\n// Relations for ${tableName}\n`;
        schemaContent += `export const ${tableName}Relations = relations(${tableName}, ({ one, many }) => ({\n`;
        
        for (const fk of foreignKeys) {
          const { column_name, foreign_table_name, foreign_column_name } = fk;
          
          // Generate relation name (singular for one-to-many)
          const relationName = foreign_table_name.endsWith('s') 
            ? foreign_table_name.slice(0, -1) 
            : foreign_table_name;
          
          schemaContent += `  ${relationName}: one(${foreign_table_name}, {\n`;
          schemaContent += `    fields: [${tableName}.${column_name}],\n`;
          schemaContent += `    references: [${foreign_table_name}.${foreign_column_name}],\n`;
          schemaContent += `  }),\n`;
        }
        
        schemaContent += '}));\n';
      }
      
      // Generate Zod schemas
      schemaContent += `\n// Zod schema for ${tableName}\n`;
      schemaContent += `export const insert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema = createInsertSchema(${tableName});\n`;
      schemaContent += `export type Insert${tableName.charAt(0).toUpperCase() + tableName.slice(1)} = z.infer<typeof insert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema>;\n`;
      schemaContent += `export type ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} = typeof ${tableName}.$inferSelect;\n`;
    }
    
    // Write schema to file
    fs.writeFileSync(outputPath, schemaContent);
    console.log(`\n✅ Schema successfully extracted and saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating Drizzle schema:', error.message);
  } finally {
    pool.end();
  }
}

// Run the generator
generateDrizzleSchema().catch(console.error);