const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  product_name: String, 
  price: String, 
  sku: String,
  description: String,
  username: String
});


const fileModel = mongoose.model("files", fileSchema);
module.exports = fileModel;