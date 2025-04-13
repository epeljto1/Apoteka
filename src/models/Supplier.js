const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Supplier = sequelize.define("Supplier", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contactNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        website: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Supplier;
};
