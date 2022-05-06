const mongoose = require("mongoose");
const fs = require("fs/promises");
const slugify = require("slugify");
const Category = require("../models/category");
const Product = require("../models/product");
const Label = require("../models/label");

const {
  ServerError,
  Get,
  NotFound,
  Update,
  Delete,
  Create,
  BadRequest,
} = require("../ulti/response");

exports.create = async (req, res) => {
  const newLabel = new Label(req.body);
  try {
    const label = await newLabel.save();
    return Create(res, { label });
  } catch (error) {
    if (error.code === 11000) return BadRequest(res, "This label is exist");
    return ServerError(res, error.message);
  }
};
exports.getAll = async (req, res) => {
  try {
    const labels = await Label.find();
    if (labels) return Get(res, { labels });
    return NotFound(res, "Labels");
  } catch (error) {
    return ServerError(res, error.messages);
  }
};
exports.get = async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (label) return Get(res, { label });
    return NotFound(res, "Label");
  } catch (error) {
    return ServerError(res, error.messages);
  }
};

exports.update = async (req, res) => {
  try {
    const oldLabel = await Label.findById(req.params.id).exec();

    const newLabel = await Label.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
    }).exec();

    if (oldLabel.name !== newLabel.name) {
      newLabel.listProduct.forEach(async productId => {
        await Product.findOneAndUpdate({ _id: productId, labels: oldLabel.name },
          { $set: { "labels.$": newLabel.name } }, {
          new: true,
          useFindAndModify: false,
        })
      });
    }

    if (newLabel) return Update(res, { newLabel });
    return NotFound(res, "Category");
  } catch (error) {
    return ServerError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const deletedLabel = await Label.findByIdAndDelete(req.params.id, { useFindAndModify: false }).exec();

    deletedLabel.listProduct.forEach(async productId => {
      await deleteLabelOnProduct(productId, deletedLabel.name)
    });

    if (deletedLabel) return Delete(res, { deletedLabel });
    return NotFound(res, "Label");
  } catch (error) {
    return ServerError(res, error.message);
  }
};

exports.addLabelToProduct = async (req, res) => {
  try {
    const labels = JSON.parse(req.body.labels);

    const updatedProduct = await Product.findByIdAndUpdate(req.body.productId, {
      $addToSet: { 'labels': { $each: labels } }
    }, {
      new: true,
      useFindAndModify: false,
    }).exec();


    labels.forEach(async label => {
      await Label.updateOne({ name: label }, { $addToSet: { listProduct: req.body.productId } }).exec();
    });

    if (updatedProduct) return Update(res, { updatedProduct });
    return NotFound(res, "Product");
  } catch (error) {
    return ServerError(res, error.message);
  }
};

exports.removeLabelFromProduct = async (req, res) => {
  try {
    const updatedProduct = await deleteLabelOnProduct(req.body.productId, req.body.label);

    await Label.findOneAndUpdate({ name: req.body.label }, { $pull: { listProduct: req.body.productId } }, {
      new: true,
      useFindAndModify: false,
    });

    if (updatedProduct) return Update(res, { updatedProduct });
    return NotFound(res, "Product");
  } catch (error) {
    return ServerError(res, error.message);
  }
};

async function deleteLabelOnProduct(productId, label) {
  return await Product.findByIdAndUpdate(productId, {
    $pull: { 'labels': label }
  }, {
    new: true,
    useFindAndModify: false,
  }).exec();
}

