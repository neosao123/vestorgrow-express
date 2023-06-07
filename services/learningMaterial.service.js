const LearningMaterial = require("../models/LearningMaterial.model");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
const fs = require("fs")
const path = require("path");
const moment = require("moment")

const compile = async function (tempelateName, data) {
    const filePath = path.join(__dirname, "../views/", `${tempelateName}.hbs`);
    const html = await fs.readFileSync(filePath, "utf-8");
    hbs.registerHelper({
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and() {
            return Array.prototype.every.call(arguments, Boolean);
        },
        or() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        }
    });
    return hbs.compile(html)({ ...data });
};


module.exports = {
    add: async function (learningMaterial, currUser) {
        learningMaterial.created_by = currUser._id
        let result = {};
        try {
            result.data = await new LearningMaterial(learningMaterial).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await LearningMaterial.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                return { message: "Updated Successfully", result };
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    delete: async function (id) {
        let result = {};
        try {
            result.data = await LearningMaterial.findByIdAndDelete(id);
            return { message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (learningMaterialObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};
        let sortBy = { createdAt: "desc" };

        if (learningMaterialObj.filter !== undefined) {
            if (learningMaterialObj.filter.searchText !== undefined) {
                condition = {
                    $or: [
                        {
                            title: {
                                $regex: ".*" + learningMaterialObj.filter.searchText + ".*",
                                $options: "i",
                            },
                        }
                    ],
                };
            }
            if (
                learningMaterialObj.filter.is_active !== undefined &&
                learningMaterialObj.filter.is_active !== null &&
                learningMaterialObj.filter.is_active != ""
            ) {
                condition["is_active"] = learningMaterialObj.filter.is_active;
            }
            if (
                learningMaterialObj.filter.categoryId !== undefined &&
                learningMaterialObj.filter.categoryId !== null &&
                learningMaterialObj.filter.categoryId.length != 0
            ) {
                condition["categoryId"] = { $in: learningMaterialObj.filter.categoryId };
            }
        }
        if (learningMaterialObj.sortBy !== undefined) {
            sortBy = learningMaterialObj.sortBy
        }
        try {
            if (learningMaterialObj.start === undefined || learningMaterialObj.length === undefined) {
                data = await LearningMaterial.find(condition).populate("createdBy").sort(sortBy);
            } else {
                data = await LearningMaterial.find(condition)
                    .populate("createdBy")
                    .limit(parseInt(learningMaterialObj.length))
                    .skip(learningMaterialObj.start)
                    .sort(sortBy);
            }

            count = await LearningMaterial.countDocuments(condition);
            result = {
                data: data,
                total: count,
                currPage: parseInt(learningMaterialObj.start / learningMaterialObj.length) + 1,
            };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    getDetail: async function (id) {
        let result = {};
        try {
            if (id) {
                result.data = await LearningMaterial.findById(id).populate("createdBy").populate("categoryId");
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    changeActive: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await LearningMaterial.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                return { message: "Updated Successfully", result };
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    getPdf: async function (id) {
        let result = {};
        try {
            if (id) {
                data = await LearningMaterial.findById(id).populate("categoryId");
                const content = await compile("learningMaterial", {
                    title: data.title,
                    desc: data.desc,
                    banner_image: data.banner_image,
                    createdAt: moment(data.createdAt).format("MMMM DD"),
                    category: data.categoryId.name
                });
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox']
                    // ignoreDefaultArgs: ['--disable-extensions']
                });
                const page = await browser.newPage();

                await page.setContent(content);

                const buffer = await page.pdf({
                    format: "A4",
                    path: process.env.BASE_PATH + "/uploads/" + data._id + ".pdf",
                    printBackground: true,
                    margin: {
                        left: "10px",
                        top: "10px",
                        right: "10px",
                        bottom: "10px",
                    },
                });
                await browser.close();
                pdf_url = process.env.ENDPOINT + "/uploads/" + data._id + ".pdf"

                result.url = pdf_url;
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};
