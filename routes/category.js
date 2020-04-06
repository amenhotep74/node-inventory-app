// Category Routes
'use strict';

const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/product-controller');
const categoryController = require('../controllers/category-controller');

// PRODUCT ROUTES //

// GET request to list all products
router.get('/products', productController.product_list);

// GET catalog home page localhost/category
router.get('/', productController.index);

// GET request for creating a product. NOTE This must come before routes that display product (uses id)
router.get('/product/create', productController.product_create_get);

// Post request for creating a product
router.post('/product/create', productController.product_create_post);

// GET request for a single product
router.get('/product/:id', productController.product_detail);

// Get request for deleting a product
router.get('/product/:id/delete', productController.product_delete_get);

// Post request for deleting a product
router.post('/product/:id/delete', productController.product_delete_post);

// CATEGORY ROUTES //

// GET request to list all categories
router.get('/categorys', categoryController.category_list);

// GET REQUEST FOR CATEGORY CREATE
router.get('/category/create', categoryController.category_create_get);

// Post request for category form create
router.post('/category/create', categoryController.category_create_post);
module.exports = router;

router.get('/category/:id', categoryController.category_detail);

// get request for category delete
router.get('/category/:id/delete', categoryController.category_delete_get);

//post request for category delete
router.post('/category/:id/delete', categoryController.category_delete_post);
