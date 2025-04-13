const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Invoice = sequelize.define("Invoice", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: 'Deliveries',
                key: 'id'
            }
        },
        issueDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        totalAmount: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        paymentMethod: {
            type: Sequelize.STRING,
            allowNull: false
        },
        delivery: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    return Invoice;
};