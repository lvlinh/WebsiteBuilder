/**
 * Database Sync Script
 * This script synchronizes database schema and content from Neon to local PostgreSQL
 */

import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configurations
const sourceConfig = {
  connectionString: process.env.DATABASE_URL, // Neon database connection string
};

const localConfig = {
  host: 'localhost',
  port: 5432,
  database: 'sjjs_local', // Change this to your local database name
  user: 'postgres',       // Change to your local PostgreSQL username
  password: 'postgres',   // Change to your local PostgreSQL password
};

// Create connection pools
const sourcePool = new Pool(sourceConfig);
const localPool = new Pool(localConfig);

// Get current timestamp for backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Create directory for exported data
const exportDir = path.join(__dirname, 'db-export-' + timestamp);
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Tables to synchronize - update this list based on your actual tables
const tables = [
  'users',
  'pages',
  'articles',
  'article_categories',
  'banner_slides',
  'events',
  'content_blocks',
  'quick_links',
  'student_users',
  'theme_settings',
  // Add any additional tables here
];

// Function to get table schema
async function getTableSchema(pool, tableName) {
  const result = await pool.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows;
}

// Function to get table data
async function getTableData(pool, tableName) {
  const result = await pool.query(`SELECT * FROM ${tableName}`);
  return result.rows;
}

// Function to create table in local database
async function createTable(schema, tableName) {
  try {
    const columns = schema.map(col => {
      let definition = `"${col.column_name}" ${col.data_type}`;
      
      if (col.character_maximum_length) {
        definition += `(${col.character_maximum_length})`;
      }
      
      if (col.is_nullable === 'NO') {
        definition += ' NOT NULL';
      }
      
      if (col.column_default) {
        definition += ` DEFAULT ${col.column_default}`;
      }
      
      return definition;
    }).join(', ');
    
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    await localPool.query(createTableQuery);
    
    console.log(`✅ Created table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message);
  }
}

// Function to insert data into local database
async function insertData(data, tableName) {
  if (data.length === 0) {
    console.log(`ℹ️ No data to insert for table: ${tableName}`);
    return;
  }
  
  try {
    // Clear existing data
    await localPool.query(`DELETE FROM ${tableName}`);
    
    // Get column names from the first row
    const columns = Object.keys(data[0]);
    
    // Prepare batch insert
    const valueParams = data.map((row, rowIndex) => {
      const placeholders = columns.map((_, colIndex) => 
        `$${rowIndex * columns.length + colIndex + 1}`
      ).join(', ');
      return `(${placeholders})`;
    }).join(', ');
    
    // Flatten all values into a single array
    const values = data.flatMap(row => 
      columns.map(col => row[col])
    );
    
    // Construct and execute INSERT query
    const insertQuery = `
      INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')})
      VALUES ${valueParams}
    `;
    
    await localPool.query(insertQuery, values);
    console.log(`✅ Inserted ${data.length} rows into: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error inserting data into ${tableName}:`, error.message);
    
    // Save the data to a JSON file as a backup
    const backupPath = path.join(exportDir, `${tableName}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved data backup to: ${backupPath}`);
  }
}

// Function to export data to JSON file
function exportToJson(data, tableName) {
  const filePath = path.join(exportDir, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Exported ${tableName} data to: ${filePath}`);
}

// Main function to synchronize database
async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Check source connection
    await sourcePool.query('SELECT NOW()');
    console.log('✅ Connected to source database');
    
    // Check local connection
    await localPool.query('SELECT NOW()');
    console.log('✅ Connected to local database');
    
    // Process each table
    for (const tableName of tables) {
      console.log(`\n🔄 Processing table: ${tableName}`);
      
      // Get table schema
      const schema = await getTableSchema(sourcePool, tableName);
      console.log(`ℹ️ Retrieved schema for: ${tableName}`);
      
      // Export schema to JSON
      exportToJson(schema, `${tableName}_schema`);
      
      // Create table in local database
      await createTable(schema, tableName);
      
      // Get table data
      const data = await getTableData(sourcePool, tableName);
      console.log(`ℹ️ Retrieved ${data.length} rows from: ${tableName}`);
      
      // Export data to JSON
      exportToJson(data, tableName);
      
      // Insert data into local database
      await insertData(data, tableName);
    }
    
    console.log('\n✅ Database synchronization completed successfully!');
    console.log(`💾 All data backed up to: ${exportDir}`);
    
  } catch (error) {
    console.error('\n❌ Database synchronization failed:', error.message);
  } finally {
    // Close pools
    sourcePool.end();
    localPool.end();
  }
}

// Ask for confirmation before proceeding
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️ This will overwrite data in your local database. Continue? (y/n) ', async (answer) => {
  if (answer.toLowerCase() === 'y') {
    await syncDatabase();
  } else {
    console.log('Operation cancelled.');
  }
  rl.close();
});