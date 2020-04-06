'use strict';

// #! /usr/bin/env node

console.log('This scripts adds testing data to the database');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const Product = require('./models/product');
const Category = require('./models/category');

const mongoose = require('mongoose');
const mongoDB = 'mongodb://localhost:27017/inventory';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const categories = [];
const products = [];

function categoryCreate(name, cb) {
  const category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category);
    cb(null, category);
  });
}

function productCreate(name, category, description, price, stock, cb) {
  const productdetail = {
    name: name,
    category: category,
    description: description,
    price: price,
    stock: stock,
  };
  const product = new Product(productdetail);
  console.log(product);
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New product: ' + product);
    products.push(product);
    cb(null, product);
  });
}

function createCategories(cb) {
  async.parallel(
    [
      function (callback) {
        categoryCreate('Laptops', callback);
      },
      function (callback) {
        categoryCreate('Phones', callback);
      },
    ],
    cb
  );
}

function createProducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate(
          'Macbook Air',
          categories[0],
          'Product Description',
          50,
          12,
          callback
        );
      },
      function (callback) {
        productCreate(
          'Macbook Pro',
          categories[0],
          'Product Description',
          500,
          122,
          callback
        );
      },
      function (callback) {
        productCreate(
          'iPhone',
          categories[1],
          'Product Description',
          500,
          122,
          callback
        );
      },
    ],
    //optional callback
    cb
  );
}

async.series(
  [createCategories, createProducts],
  // optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('products: ' + products);
      console.log(categories);
    }
    // All Complete disconnect from database
    mongoose.connection.close();
  }
);
