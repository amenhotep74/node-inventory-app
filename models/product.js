' use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
});

// Virtual for products URL
ProductSchema.virtual('url').get(function () {
  return '/category/product/' + this._id;
});

module.exports = mongoose.model('Product', ProductSchema);
