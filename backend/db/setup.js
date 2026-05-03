const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, 'habittracker.db');
let db;

// Create database
db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }

  console.log('Setting up SQLite database...');
  
  // Enable foreign keys
  db.configure('busyTimeout', 5000);
  
  db.run('PRAGMA foreign_keys = ON', setupSchema);
});

function setupSchema(err) {
  if (err) {
    console.error('Error enabling foreign keys:', err);
    db.close();
    process.exit(1);
  }

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Use exec to run all statements at once
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error executing schema:', err);
        db.close();
        process.exit(1);
      }

      console.log('Database schema created successfully!');
      console.log('Database file created at:', dbPath);

      // Verify tables were created
      db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
        if (err) {
          console.error('Error listing tables:', err);
        } else if (tables && tables.length > 0) {
          console.log('Created tables:', tables.map(t => t.name).join(', '));
        } else {
          console.log('Warning: No tables found');
        }
        
        db.close((err) => {
          if (err) console.error('Error closing database:', err);
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error('Error reading schema file:', err);
    db.close();
    process.exit(1);
  }
}
