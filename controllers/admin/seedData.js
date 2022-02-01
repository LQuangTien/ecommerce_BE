const fs = require("fs");
const path = require('path');

const Cart = require("../../models/cart");
const Order = require("../../models/order");
const Address = require("../../models/address");
const Product = require("../../models/product");
const Category = require("../../models/category");
const {
    ServerError,
    Create,
    Response,
    Delete,
    Get,
    Update,
    NotFound,
    BadRequest,
} = require("../../ulti/response");

//http://localhost:8000/api/seed/product
exports.seedDataProduct = async (req, res) => {
    const productData = path.join(__dirname, '..', '..', 'data', 'mobile.json');
    
    fs.readFile(productData, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);

        Product.insertMany(obj)
            .then(function (mongooseDocuments) {
                console.log(mongooseDocuments)
            })
            .catch(function (err) {
                console.log(err)
            });
    });

    //C:\Users\USER\Desktop\test\node_modules\faker\lib\locales\en\music\genre.js
    // try {
    //     const findProduct = await Product.find({},'_id salePrice');
    //     console.log(findProduct)
    //     fs.writeFile(`C:/Users/USER/Desktop/test/node_modules/faker/lib/locales/en/music/genre.js`,JSON.stringify(findProduct) , function (err, data) {
    //         if (err) console.log(err);
    //     });
    // } catch (error) {
    //     console.log(error);
    // }
   
    // Product.deleteMany({category:"PC"}, function (err) { console.log(err) })

    return Get(res,{stop:1});
}

exports.seedDataOrder = (req, res) => {
    const orderData = path.join(__dirname, '..', '..', 'data', 'order.json');

    fs.readFile(`C:/Users/USER/Desktop/test/bigDataSet.json`, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);

        Order.insertMany(obj)
            .then(function (mongooseDocuments) {
                console.log(mongooseDocuments)
            })
            .catch(function (err) {
                console.log(err)
            });
    });

    // Order.deleteMany({ }, function (err) { console.log(err) })
    // Order.updateMany({addressId:'60ffc3bdb60e13260c448b14' }, function (err) { console.log(err) })
    return Get(res,{stop:1})
}