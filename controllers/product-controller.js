'use strict';

const Product = require('../models/product');
const Category = require('../models/category');

const validator = require('express-validator');

// on localhost/category
exports.index = function (req, res, next) {
  // Counts all records in a table
  const productCountQuery = Product.countDocuments();
  const categoryCountQuery = Category.countDocuments();

  // After counting is complete
  Promise.all([productCountQuery, categoryCountQuery])
    .then((results) => {
      const data = {
        // Passing some data through to render on the index.hbs file
        title: 'Node Inventory Management System',
        productCount: results[0],
        categoryCount: results[1],
      };
      res.render('category', data);
    })
    // if any errors
    .catch((err) => {
      return next(err);
    });
};

// List all products
exports.product_list = function (req, res, next) {
  Product.find()
    .populate('category')
    .populate('brand')
    .exec()
    .then((listProducts) => {
      const data = {
        title: 'Product List',
        product_list: listProducts,
      };
      res.render('product_list', data);
    })
    .catch((err) => {
      return next(err);
    });
};

// Display product create form on GET.
exports.product_create_get = function (req, res, next) {
  const categoryQuery = Category.find();

  Promise.all([categoryQuery])
    .then((results) => {
      const categories = results[0];

      const data = {
        title: 'Create Product',
        categories: categories,
      };

      res.render('product_form', data);
    })

    .catch((error) => {
      next(error);
    });
};

// Display detail page for a single product.
exports.product_detail = function (req, res, next) {
  console.log('req.params.id' + req.params.id);
  Product.findById(req.params.id)
    .populate('category')
    .then((product) => {
      if (!product) {
        // No results.
        var err = new Error('product not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      const data = {
        title: product.name,
        product: product,
      };
      res.render('product_detail', data);
    })
    .catch((err) => {
      next(err);
    });
};

// Handle product create on POST
exports.product_create_post = [
  // validate all the fields
  validator
    .check('name', 'Name must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  validator
    .check('category', 'Category must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  validator
    .check('description', 'Description must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  validator
    .check('price', 'Price must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  validator
    .check('stock', 'Stock must not be empty.')
    .isLength({ min: 1 })
    .trim(),

  // sanitize fields (using wildcard)
  validator.sanitizeBody('*').escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validator.validationResult(req);

    // Create a product object with escaped and trimmed data
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    });

    if (!errors.isEmpty()) {
      res.redirect('/category/product/create');
      console.log('Error creating product');
    } else {
      // Data from form is valid, Save product
      product.save(function (err) {
        if (err) {
          return next(err);
        }
        // successful - redirect to new product record.
        console.log(product.url);
        res.redirect(product.url);
      });
    }
  },
];

// Get request for product delete page
exports.product_delete_get = function (req, res, next) {
  Product.findById(req.params.id)
    .exec()
    .then((results) => {
      const products = results;

      // if no id found for product
      if (products == null) {
        res.redirect('/category/product');
      }

      const data = {
        title: 'Delete product',
        product: products,
      };
      res.render('product_delete', data);
    })
    .catch((error) => {
      next(error);
    });
};

// Handle product delete on POST
exports.product_delete_post = function (req, res, next) {
  Product.findById(req.params.id)
    .exec()
    .then((results) => {
      const product = results;

      if (product == null) {
        // No results found
        res.redirect('/catagory/products');
      } else {
        // Category has no products delete object and redirect to the list of categories
        Product.findByIdAndRemove(product, function deleteProduct(err) {
          if (err) {
            return next(err);
          }
          // Success redirect to category list
          res.redirect('/category/products');
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};
