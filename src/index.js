const app = require('./app');

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const db = require('./config/db');

db.sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully.');

        return db.sequelize.sync({ alter: true }); 
    })
    .then(() => {
        console.log('Tables created/synced successfully.');
    })
    .catch(err => {
        console.error('Database error:', err);
    });