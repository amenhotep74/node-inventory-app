'use strict';

const Category = require('../models/category');
const Product = require('../models/product');

const validator = require('express-validator');

// List all categorys
exports.category_list = function (req, res, next) {
  Category.find()
    .sort([['name', 'ascending']])
    .exec(function (err, categories) {
      if (err) {
        return next(err);
      }
      // Succesful so render
      const data = {
        title: 'Category List',
        categories: categories,
      };
      res.render('category_list', data);
    });
};

// Display Category create form on GET
exports.category_create_get = function (req, res, next) {
  res.render('category_form', { title: 'Create Category' });
};

// Category create form POST
exports.category_create_post = function (req, res, next) {
  // check name field is not empty
  validator.body('name', 'Category name required').isLength({ min: 1 }).trim(),
    // Sanitize (escape the name field)
    validator.body('name').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
      const errors = validator.validationResult(req);

      // Create a category object with escape and trimmed data
      const category = new Category({ name: req.body.name });

      if (!errors.isEmpty()) {
        // There are errors
        res.redirect('/category/category/create');
      } else {
        // Data from the form is valid
        // Check if category with the same name already exists
        Category.findOne({ name: req.body.name }).exec(function (
          err,
          foundCategory
        ) {
          if (err) {
            return next(err);
          }
          if (foundCategory) {
            // category exists, redirect to its detail page
            res.redirect(foundCategory.url);
          } else {
            category.save(function (err) {
              if (err) {
                return next(err);
              }
              // category saved. Redirect to category detail page.
              console.log('category saved!');
              res.redirect('category.url');
            });
          }
        });
      }
    };
};

// Display detail page for a single category
exports.category_detail = function (req, res, next) {
  // Find the id from the request
  const categoryQuery = Category.findById(req.params.id).exec();
  const productsQuery = Product.find({ category: req.params.id }).exec();
  console.log('req.param: ' + req.params);

  // wait for the above queries to complete
  Promise.all([categoryQuery, productsQuery])
    .then((results) => {
      const category = results[0];
      const products = results[1];
      // if no results
      if (!category) {
        const err = new Error('Category not found');
        err.status = 404;
        return next(err);
      }
      // Successfull, so render
      const data = {
        title: 'Category Detail',
        category: category,
        category_products: products,
      };
      res.render('category_detail', data);
    })
    .catch((error) => {
      next(error);
    });
};

exports.category_delete_get = function (req, res, next) {
  const categoryQuery = Category.findById(req.params.id).exec();
  const productQuery = Product.find({ category: req.params.id }).exec();

  Promise.all([categoryQuery, productQuery])
    .then((results) => {
      const categories = results[0];
      const products = results[1];

      if (categories == null) {
        // No results
        res.redirect('/category/category');
      }

      const data = {
        title: 'Delete Category',
        category: categories,
        category_products: products,
      };
      res.render('category_delete', data);
    })
    .catch((error) => {
      next(error);
    });
};

exports.category_delete_post = function (req, res, next) {
  const categoryQuery = Category.findById(req.body.categoryid).exec();
  const productQuery = Product.find({ category: req.body.categoryid }).exec();

  Promise.all([categoryQuery, productQuery]).then((results) => {
    const category = results[0];
    const products = results[1];

    if (category == null) {
      // No results
      res.redirect('/category/categorys');
    }

    if (products.length > 0) {
      const data = {
        title: 'Delete Category',
        category: category,
        category_products: products,
      };
      res.render('category_delete', data);
    } else {
      // Category has no products. Delete object and redirect to the list of categories
      Category.findByIdAndRemove(category, function deleteCategory(err) {
        if (err) {
          return next(err);
        }
        // success go to category list
        res.redirect('/category/categorys');
      });
    }
  });
};
