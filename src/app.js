const express = require('express');
const session = require('express-session');  
const authRoutes = require('./routes/auth');  
const pageRoutes = require('./routes/pages');
const products = require('./routes/products');
const adminRoutes = require('./routes/admin');
const sales = require('./routes/sales');
const salesInvoiceRoutes = require('./routes/salesInvoices');
const deliveriesRoutes = require('./routes/deliveries');
const suppliersRoutes = require('./routes/suppliers');
const reportsRoutes = require('./routes/reports');
const contractsRoutes = require('./routes/contracts');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); 

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  
}));

app.use('/',authRoutes); 
app.use('/', pageRoutes);
app.use('/api', products);
app.use('/admin',adminRoutes);
app.use('/api', sales);
app.use('/api', salesInvoiceRoutes);
app.use('/',deliveriesRoutes);
app.use('/api', suppliersRoutes);
app.use('/api', reportsRoutes);
app.use('/api',contractsRoutes);

module.exports = app;