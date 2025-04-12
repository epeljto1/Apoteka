require('dotenv').config();

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false
});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Role = require('../models/Role')(sequelize, Sequelize.DataTypes);
db.User = require('../models/User')(sequelize, Sequelize.DataTypes);
db.Product = require('../models/Product')(sequelize, Sequelize.DataTypes);


db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });


module.exports = db;