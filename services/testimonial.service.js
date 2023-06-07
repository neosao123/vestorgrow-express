const Testimonial = require("../models/Testimonial.model");

module.exports = {
  add: async function (data, currUser) {
    let date = new Date();
    data.createdBy = currUser._id;
    let result = {};
    try {
      result.data = await new Testimonial(data).save();
      result.status = "Data Added Successfully";
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (reqObject) {
    let result = {};
    let data = null;
    let count;
    let condition = {};

    const { start, length } = reqObject;
    if (reqObject.filter !== undefined) {
      if (reqObject.filter.searchText !== undefined) {
        condition["name"] = {
          $regex: ".*" + reqObject.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (
        reqObject.filter.is_active !== undefined &&
        reqObject.filter.is_active !== null &&
        reqObject.filter.is_active != ""
      ) {
        condition["is_active"] = reqObject.filter.is_active;
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await Testimonial.find(condition).sort({
          name: "asc",
        });
      } else {
        data = await Testimonial.find(condition).limit(parseInt(length)).skip(start).sort({
          name: "asc",
        });
      }

      count = await Testimonial.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(start / length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getDetail: async function (id) {
    let result = {};
    try {
      result.data = await Testimonial.findById(id).populate("createdBy");
      result.status = `Data Fetched Successfully - ${id}`;
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  delete: async function (id) {
    let result = {};
    let toBeDeleted = [];
    try {
      result.data = await Testimonial.findByIdAndDelete(id);
      toBeDeleted.push(result.data.image);
      result.toBeDeleted = toBeDeleted;
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  update: async function (body) {
    let result = {};
    try {
      result.data = await Testimonial.findByIdAndUpdate(body._id, { $set: body }, { new: true });
      result.status = `Data Updated Successfully`;
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};
