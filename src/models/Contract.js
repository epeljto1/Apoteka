const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Contract = sequelize.define("Contract", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        subject: {
            type: Sequelize.STRING,
            allowNull: false
        },
        conclusionDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        expirationDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        conditions: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        supplierId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Suppliers',
                key: 'id'
            },
            onDelete: 'SET NULL', // dodatno za sigurnost kad se radi sync sa alter
            onUpdate: 'CASCADE'
        }
    });
    return Contract;
};