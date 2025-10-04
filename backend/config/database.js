// backend/config/database.js - Environment-based configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

// Database connection configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'item_exclusivity',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Connect to database and create pool
const connectDatabase = async () => {
  try {
    console.log('🔌 Connecting to database with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });

    // First, connect without database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`📂 Database '${dbConfig.database}' created or verified`);
    await tempConnection.end();

    // Now create the pool with the database
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    console.log('✅ Database connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('📋 Check your .env file configuration:');
    console.error(`   DB_HOST=${process.env.DB_HOST || 'not set'}`);
    console.error(`   DB_USER=${process.env.DB_USER || 'not set'}`);
    console.error(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '***set***' : 'not set'}`);
    console.error(`   DB_NAME=${process.env.DB_NAME || 'not set'}`);
    console.error(`   DB_PORT=${process.env.DB_PORT || 'not set'}`);
    throw error;
  }
};

// Get the pool instance
const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
};

// Initialize database tables and default data
const initializeDatabase = async () => {
  try {
    const pool = getPool();
    
    console.log('🔨 Initializing database tables...');
    
    // Create audit_logs table
    // await pool.execute(`
    //   CREATE TABLE audit_logs (
    //     id int(11) NOT NULL,
    //     entity_type varchar(50) NOT NULL,
    //     action varchar(50) NOT NULL,
    //     entity_name varchar(255) NOT NULL,
    //     user_id int(11) DEFAULT NULL,
    //     user_name varchar(100) DEFAULT NULL,
    //     details longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(details)),
    //     timestamp datetime DEFAULT current_timestamp()
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Create branches table
    // await pool.execute(`
    //   CREATE TABLE branches (
    //     branchCode varchar(20) NOT NULL,
    //     branchName varchar(100) NOT NULL,
    //     chainCode varchar(20) NOT NULL,
    //     lampsClass varchar(10) DEFAULT NULL,
    //     decorsClass varchar(10) DEFAULT NULL,
    //     clocksClass varchar(10) DEFAULT NULL,
    //     stationeryClass varchar(10) DEFAULT NULL,
    //     framesClass varchar(10) DEFAULT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Create categories table
    // await pool.execute(`
    //   CREATE TABLE categories (
    //     id int(10) NOT NULL,
    //     category varchar(20) NOT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Insert default categories
    // const categories = [
    //   [1, 'Framess'],
    //   [2, 'Decors'],
    //   [3, 'Stationery'],
    //   [4, 'Lamps']
    //   [5, 'Clocks'],
    // ];

    // for (const [id, description] of categories) {
    //   await pool.execute(`
    //     INSERT IGNORE INTO categories (id, category) VALUES (?, ?)
    //   `, [id, description]);
    // }

    // Create chains table
    // await pool.execute(`
    //   CREATE TABLE chains (
    //     id int(10) NOT NULL,
    //     chainName varchar(20) NOT NULL,
    //     chainCode varchar(10) NOT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Insert default chains
    // const chains = [
    //   [1, 'Various Chain', 'VChain'],
    //   [2, 'SM Homeworld', 'SMH'],
    //   [3, 'Our Home', 'OH']
    // ];

    // for (const [id, chainName, chainCode] of chains) {
    //   await pool.execute(`
    //     INSERT IGNORE INTO chains (id, chainName, chainCode) VALUES (?, ?, ?)
    //   `, [id, chainName, chainCode]);
    // }

    // Create inventory_items table
    // await pool.execute(`
    //   CREATE TABLE inventory_items (
    //     id int(11) NOT NULL,
    //     item_name varchar(255) NOT NULL,
    //     serialNumber varchar(191) NOT NULL,
    //     brand varchar(191) DEFAULT NULL,
    //     model varchar(191) DEFAULT NULL,
    //     category enum('DESKTOP','LAPTOP','MONITOR','KEYBOARD','MOUSE','PRINTER','OTHER') NOT NULL DEFAULT 'OTHER',
    //     specs varchar(191) DEFAULT NULL,
    //     condition varchar(191) NOT NULL DEFAULT 'Good',
    //     status enum('AVAILABLE','ASSIGNED','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    //     location varchar(191) DEFAULT NULL,
    //     quantity int(11) NOT NULL DEFAULT 1,
    //     notes varchar(191) DEFAULT NULL,
    //     createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
    //     updatedAt datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
    //     category_id int(11) DEFAULT NULL,
    //     created_at datetime DEFAULT current_timestamp(),
    //     updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    //     created_by int(11) DEFAULT NULL,
    //     updated_by int(11) DEFAULT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
    // `);

    // Create items table
    // await pool.execute(`
    //   CREATE TABLE items (
    //     itemCode varchar(20) NOT NULL,
    //     itemDescription varchar(100) NOT NULL,
    //     itemCategory varchar(15) NOT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Create item_exclusivity_list table
    // await pool.execute(`
    //   CREATE TABLE item_exclusivity_list (
    //     id int(10) NOT NULL,
    //     itemCode varchar(20) NOT NULL,
    //     vChainA varchar(10) DEFAULT NULL,
    //     vChainB varchar(10) DEFAULT NULL,
    //     vChainC varchar(10) DEFAULT NULL,
    //     vChainD varchar(10) DEFAULT NULL,
    //     vChainE varchar(10) DEFAULT NULL,
    //     sMHA varchar(10) DEFAULT NULL,
    //     sMHB varchar(10) DEFAULT NULL,
    //     sMHC varchar(10) DEFAULT NULL,
    //     sMHD varchar(10) DEFAULT NULL,
    //     sMHE varchar(10) DEFAULT NULL,
    //     oHA varchar(10) DEFAULT NULL,
    //     oHB varchar(10) DEFAULT NULL,
    //     oHC varchar(10) DEFAULT NULL,
    //     oHD varchar(10) DEFAULT NULL,
    //     oHE varchar(10) DEFAULT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Create items table
    // await pool.execute(`
    //   CREATE TABLE store_classifications (
    //     id int(10) NOT NULL,
    //     storeClassCode varchar(5) NOT NULL,
    //     storeClassification varchar(255) NOT NULL
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);

    // Insert default store_classifications
    // const store_classifications = [
    //   [1, 'ASEH', 'A Stores - Extra High'],
    //   [2, 'BSH', 'B Stores - High'],
    //   [3, 'CSM', 'C Stores - Medium'],
    //   [4, 'DSS', 'D Stores - Small'],
    //   [5, 'ESES', 'E Stores - Extra Small']
    // ];

    // for (const [id, storeClassCode, storeClassification] of store_classifications) {
    //   await pool.execute(`
    //     INSERT IGNORE INTO chains (id, storeClassCode, storeClassification) VALUES (?, ?, ?)
    //   `, [id, storeClassCode, storeClassification]);
    // }

    
    // Create items table
    // await pool.execute(`
    //   CREATE TABLE users (
    //     id int(11) NOT NULL,
    //     username varchar(50) NOT NULL,
    //     email varchar(100) NOT NULL,
    //     password varchar(255) NOT NULL,
    //     role enum('admin','viewer') DEFAULT 'viewer',
    //     created_at timestamp NOT NULL DEFAULT current_timestamp()
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    // `);


    // Create default admin user
  console.log('✅ Database tables initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Close database connection
const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connection closed');
  }
};

module.exports = {
  connectDatabase,
  getPool,
  initializeDatabase,
  closeDatabase
};