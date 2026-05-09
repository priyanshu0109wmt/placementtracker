const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_placement',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const connectDatabase = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  pool,
  connectDatabase,
};
