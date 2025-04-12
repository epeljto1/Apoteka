const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
    const Product = sequelize.define("Product",{
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ingredients: {
            type: Sequelize.STRING,
            allowNull: false
        },
        manufacturer: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expirationDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        }

    });
    return Product;
};