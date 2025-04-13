const express = require('express');
const session = require('express-session');  
const authRoutes = require('./routes/auth');  
const pageRoutes = require('./routes/pages');
const products = require('./routes/products');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); 

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));

app.use(authRoutes); 
app.use('/', pageRoutes);
app.use('/api', products);

module.exports = app;
