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

// Local database connection configuration
// You need to change these parameters to connect to your local PostgreSQL database
const localConfig = {
  host: 'localhost',
  port: 5432,
  database: 'sjjs_local', // Change this to your local database name
  user: 'postgres',       // Change to your local PostgreSQL username
  password: 'postgres'    // Change to your local PostgreSQL password
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

// Function to get all tables from the source database
async function getAllTables() {
  try {
    const result = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'drizzle_%'
      AND table_name NOT LIKE 'session'
    `);
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('❌ Error getting table list:', error.message);
    return [];
  }
}

// Define a fallback list of tables in case we can't get them automatically
const fallbackTables = [
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

// Function to check if table exists in database
async function tableExists(pool, tableName) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  
  return result.rows[0].exists;
}

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
  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (error) {
    console.log(`⚠️ Error fetching data from ${tableName}: ${error.message}`);
    return [];
  }
}

// Function to create table in local database
async function createTable(schema, tableName) {
  try {
    // First, check if table exists in local database
    const exists = await tableExists(localPool, tableName);
    if (exists) {
      console.log(`ℹ️ Table ${tableName} already exists in local database. Dropping it first.`);
      await localPool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
    }
    
    const columns = schema.map(col => {
      let definition = `"${col.column_name}" ${col.data_type}`;
      
      if (col.character_maximum_length) {
        definition += `(${col.character_maximum_length})`;
      }
      
      if (col.is_nullable === 'NO') {
        definition += ' NOT NULL';
      }
      
      if (col.column_default) {
        // Handle sequence-based defaults by removing schema prefixes
        if (col.column_default.includes('nextval')) {
          definition += ` DEFAULT ${col.column_default.replace(/nextval\('[\w\.]*/, "nextval('")}`;
        } else {
          definition += ` DEFAULT ${col.column_default}`;
        }
      }
      
      return definition;
    }).join(', ');
    
    const createTableQuery = `CREATE TABLE ${tableName} (${columns})`;
    await localPool.query(createTableQuery);
    
    console.log(`✅ Created table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message);
    console.error(error);
  }
}

// Function to insert data into local database
async function insertData(data, tableName) {
  if (data.length === 0) {
    console.log(`ℹ️ No data to insert for table: ${tableName}`);
    return;
  }
  
  try {
    // Clear existing data - no need with our approach but keeping it just in case
    await localPool.query(`DELETE FROM ${tableName}`);
    
    // Get column names from the first row
    const columns = Object.keys(data[0]);
    
    // For larger datasets, we'll break them into batches of 100 rows
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    
    let totalInserted = 0;
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      // Prepare batch insert
      const valueParams = batch.map((row, rowIndex) => {
        const placeholders = columns.map((_, colIndex) => 
          `$${rowIndex * columns.length + colIndex + 1}`
        ).join(', ');
        return `(${placeholders})`;
      }).join(', ');
      
      // Flatten all values into a single array
      const values = batch.flatMap(row => 
        columns.map(col => row[col])
      );
      
      // Construct and execute INSERT query
      const insertQuery = `
        INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')})
        VALUES ${valueParams}
      `;
      
      await localPool.query(insertQuery, values);
      totalInserted += batch.length;
      console.log(`✅ Inserted batch ${batchIndex + 1}/${batches.length} (${batch.length} rows) into: ${tableName}`);
    }
    
    console.log(`✅ Inserted total ${totalInserted} rows into: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error inserting data into ${tableName}:`, error.message);
    console.error(error);
    
    // Save the data to a JSON file as a backup
    const backupPath = path.join(exportDir, `${tableName}_backup.json`);
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
    
    // Get all tables from the source database
    console.log('🔍 Retrieving tables from source database...');
    let tables = await getAllTables();
    
    if (tables.length === 0) {
      console.log('⚠️ No tables found in source database or could not retrieve them.');
      console.log('Using fallback table list instead.');
      tables = fallbackTables;
    }
    
    console.log(`ℹ️ Found ${tables.length} tables to synchronize: ${tables.join(', ')}`);
    
    // Process each table
    for (const tableName of tables) {
      console.log(`\n🔄 Processing table: ${tableName}`);
      
      // Since we already verified the table exists (if using getAllTables), 
      // we can skip this check for those tables
      if (tables === fallbackTables) {
        const exists = await tableExists(sourcePool, tableName);
        if (!exists) {
          console.log(`⚠️ Table ${tableName} does not exist in source database. Skipping.`);
          continue;
        }
      }
      
      // Get table schema
      const schema = await getTableSchema(sourcePool, tableName);
      if (schema.length === 0) {
        console.log(`⚠️ Could not retrieve schema for table ${tableName}. Skipping.`);
        continue;
      }
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
      if (data.length > 0) {
        await insertData(data, tableName);
      }
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

// Add a function to validate the database connection before proceeding
async function validateConnections() {
  let sourceValid = false;
  let localValid = false;
  
  try {
    await sourcePool.query('SELECT NOW()');
    sourceValid = true;
    console.log('✅ Source database connection is valid.');
  } catch (error) {
    console.error('❌ Error connecting to source database:', error.message);
    console.log('Make sure your DATABASE_URL environment variable is set correctly.');
  }
  
  try {
    await localPool.query('SELECT NOW()');
    localValid = true;
    console.log('✅ Local database connection is valid.');
  } catch (error) {
    console.error('❌ Error connecting to local database:', error.message);
    console.log('Make sure your local PostgreSQL server is running and the connection details are correct.');
    console.log('You may need to create the database first with: createdb sjjs_local');
  }
  
  return sourceValid && localValid;
}

// Ask for confirmation before proceeding
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// First validate connections, then ask for confirmation
validateConnections().then(connectionsValid => {
  if (!connectionsValid) {
    console.log('⚠️ Fix the database connection issues before proceeding.');
    rl.close();
    return;
  }
  
  rl.question('⚠️ This will overwrite data in your local database. Continue? (y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await syncDatabase();
    } else {
      console.log('Operation cancelled.');
    }
    rl.close();
  });
});