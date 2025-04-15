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

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.get('/products', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/products.html'));
});
router.get('/dashboard', isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/dashboard.html'));
});

router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/index.html'));
});

router.get('/sales', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/sales.html'));
});

router.get('/salesInvoices', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/salesInvoices.html'));
});

module.exports = router;
