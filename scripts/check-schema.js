/**
 * Schema Check Script
 * Compares the schema in shared/schema.ts with the actual database schema in Neon
 * Identifies missing columns or tables that need to be added
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

// Function to get all tables from database
async function getDatabaseTables() {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  return result.rows.map(row => row.table_name);
}

// Function to get columns for a specific table
async function getTableColumns(tableName) {
  const result = await pool.query(`
    SELECT 
      column_name, 
      data_type, 
      is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows;
}

// Function to extract information from local schema file
function parseLocalSchema() {
  try {
    // Path to schema.ts
    const schemaPath = path.join(__dirname, '..', 'shared', 'schema.ts');
    
    // Read schema file
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract table definitions using regex
    const tableRegex = /export const (\w+) = pgTable\(['"](\w+)['"], {([^}]+)}\)/gs;
    const columnRegex = /(\w+):\s*(\w+)\(['"](\w+)['"]\)/g;
    
    const tables = {};
    let tableMatch;
    
    while ((tableMatch = tableRegex.exec(schemaContent)) !== null) {
      const tableName = tableMatch[2];
      const tableContent = tableMatch[3];
      
      const columns = {};
      let columnMatch;
      
      // Reset lastIndex to start from beginning of the tableContent
      columnRegex.lastIndex = 0;
      
      while ((columnMatch = columnRegex.exec(tableContent)) !== null) {
        const columnName = columnMatch[1];
        const columnType = columnMatch[2];
        
        columns[columnName] = {
          type: columnType
        };
      }
      
      tables[tableName] = {
        columns
      };
    }
    
    return tables;
  } catch (error) {
    console.error('Error parsing local schema:', error.message);
    return {};
  }
}

// Main function to check schema
async function checkSchema() {
  try {
    console.log('🔍 Checking schema differences...');
    
    // Get tables from database
    const dbTables = await getDatabaseTables();
    console.log(`📋 Found ${dbTables.length} tables in database`);
    
    // Parse local schema
    const localSchema = parseLocalSchema();
    const localTables = Object.keys(localSchema);
    console.log(`📋 Found ${localTables.length} tables in local schema`);
    
    // Compare tables
    console.log('\n📊 Comparing tables...');
    
    // Tables in database but not in local schema
    const missingTables = dbTables.filter(table => !localTables.includes(table));
    if (missingTables.length > 0) {
      console.log('\n⚠️ Tables in database but not defined in local schema:');
      for (const table of missingTables) {
        if (!table.includes('_') && !table.includes('session') && !table.includes('migrations')) {
          console.log(`   - ${table}`);
        }
      }
    } else {
      console.log('✅ All database tables are defined in local schema');
    }
    
    // Tables in local schema but not in database
    const extraTables = localTables.filter(table => !dbTables.includes(table));
    if (extraTables.length > 0) {
      console.log('\n⚠️ Tables in local schema but not in database:');
      for (const table of extraTables) {
        console.log(`   - ${table}`);
      }
    } else {
      console.log('✅ All local schema tables exist in database');
    }
    
    // Check columns for tables that exist in both
    console.log('\n📊 Checking columns for shared tables...');
    
    const commonTables = dbTables.filter(table => localTables.includes(table));
    
    for (const tableName of commonTables) {
      // Skip system tables
      if (tableName.includes('_') || tableName.includes('session') || tableName.includes('migrations')) {
        continue;
      }
      
      const dbColumns = await getTableColumns(tableName);
      const localColumns = localSchema[tableName]?.columns || {};
      
      // Convert database columns to a map for easier comparison
      const dbColumnMap = {};
      for (const col of dbColumns) {
        dbColumnMap[col.column_name] = col;
      }
      
      // Check for columns in database but not in local schema
      const missingColumns = dbColumns.filter(col => 
        !Object.keys(localColumns).includes(col.column_name)
      );
      
      // Check for columns in local schema but not in database
      const extraColumns = Object.keys(localColumns).filter(col => 
        !Object.keys(dbColumnMap).includes(col)
      );
      
      if (missingColumns.length > 0 || extraColumns.length > 0) {
        console.log(`\n⚠️ Schema mismatch for table '${tableName}':`);
        
        if (missingColumns.length > 0) {
          console.log(`   Columns in database but missing in local schema:`);
          for (const col of missingColumns) {
            console.log(`     - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
          }
        }
        
        if (extraColumns.length > 0) {
          console.log(`   Columns in local schema but missing in database:`);
          for (const col of extraColumns) {
            console.log(`     - ${col}`);
          }
        }
      } else {
        console.log(`✅ Table '${tableName}' schema matches`);
      }
    }
    
    console.log('\n📝 Schema check completed');
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    pool.end();
  }
}

// Run the schema check
checkSchema().catch(console.error);