const path = require('path');
const express = require('express');
const router = express.Router();

function isAuthenticatedAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.roleId == 1) {
        next();
    } else if(req.session && req.session.user && req.session.user.roleId == 3) {
        res.redirect('/products');
    }
    else {
        res.redirect('/login');
    }
}

function isAuthenticatedManager(req, res, next) {
    if (req.session && req.session.user && req.session.user.roleId == 2) {
        next(); }
    else {
        res.redirect('/login');
    }
}


function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function isAuthenticatedPharmacist(req, res, next) {
    if (req.session && req.session.user && req.session.user.roleId == 3) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.get('/products', isAuthenticatedPharmacist, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/products.html'));
});
router.get('/dashboard', isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/dashboard.html'));
});

router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/index.html'));
});

router.get('/sales', isAuthenticatedPharmacist, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/sales.html'));
});

router.get('/salesInvoices', isAuthenticatedPharmacist, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/salesInvoices.html'));
});

router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/contact.html'));
});

router.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/about.html'));
});

router.get('/managerdash', isAuthenticatedManager, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/managerdash.html'));
});

router.get('/deliveries', isAuthenticatedManager, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/deliveries.html'));
});

router.get('/deliverydetails', isAuthenticatedManager, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/deliverydetails.html'));
});

router.get('/suppliers', isAuthenticatedManager, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/suppliers.html'));
});

router.get('/supplierdetails', isAuthenticatedManager, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/supplierdetails.html'));
});

module.exports = router;
