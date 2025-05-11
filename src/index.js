const app = require('./app'); 
const db = require('./config/db');  
const port = 3000;

db.sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');

        return db.sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Tables synced successfully.');
        
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}/index`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
