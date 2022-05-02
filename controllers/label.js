const mongoose = require("mongoose");
const fs = require("fs/promises");
const slugify = require("slugify");
const Category = require("../models/category");
const Product = require("../models/product");
const {
  ServerError,
  Get,
  NotFound,
  Update,
  Delete,
  Create,
  BadRequest,
} = require("../ulti/response");
const Label = require("../models/label");

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
    const label = await Label.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
    }).exec();
    if (label) return Update(res, { label });
    return NotFound(res, "Category");
  } catch (error) {
    return ServerError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const label = await Label.findByIdAndDelete(req.params.id).exec();
    if (label) return Delete(res, "Label has been deleted...");
    return NotFound(res, "Label");
  } catch (error) {
    return ServerError(res, error.message);
  }
};
