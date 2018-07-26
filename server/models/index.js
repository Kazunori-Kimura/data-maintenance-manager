const path = require('path');
const Sequelize = require('sequelize');

class DatabaseManager {
  constructor() {
    this.conn = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }

  getModel(modelName) {
    const filepath = path.resolve(process.cwd(), 'models', modelName);
    return this.conn.import(filepath);
  }
}

module.exports = DatabaseManager;
