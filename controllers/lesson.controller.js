const lessonServ = require("../services/lesson.service");
const fs = require("fs");
const utils = require("../utils/utils");
const { getVideoDurationInSeconds } = require('get-video-duration')
module.exports = {
    add: async function (req, res) {
        if (req.body.topic && req.body.topic !== undefined) {
            req.body.topic = JSON.parse(req.body.topic);
        }
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                fs.rename(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                req.body[req.files[i].fieldname] = final_url;
            }
        }
        let faq = req.body;
        let result = await lessonServ.add(faq, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                fs.rename(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                req.body[req.files[i].fieldname] = final_url;
            }
        }
        let oldData = await lessonServ.getDetail(req.body._id);
        let result = await lessonServ.edit(req.body);
        if (result) {
            utils.deleteOldFile(oldData.data.cover_image, req.body.cover_image)
            utils.deleteOldFile(oldData.data.banner_image, req.body.banner_image)
        }
        utils.sendResponse(result, req, res);
    },
    addLesson: async function (req, res) {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                fs.rename(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                req.body[req.files[i].fieldname] = final_url;
                if (req.files[i].fieldname == "lesson_video") {
                    await getVideoDurationInSeconds(final_path).then((duration) => {
                        req.body.watch_time = duration
                    })
                }
            }
        }
        let oldData = await lessonServ.getDetail(req.body._id);
        let result = await lessonServ.addLesson(req.body);
        if (result) {
            utils.deleteOldFile(oldData.data?.topics[req.body.topicIdx]?.sub_topics[req.body.subTopicIdx]?.lessons[req.body.lessonIdx]?.lesson_cover, req.body.lesson_cover)
            utils.deleteOldFile(oldData.data?.topics[req.body.topicIdx]?.sub_topics[req.body.subTopicIdx]?.lessons[req.body.lessonIdx]?.lesson_video, req.body.lesson_video)
        }
        utils.sendResponse(result, req, res);
    },
    addTopic: async function (req, res) {
        let result = await lessonServ.addTopic(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },
    addSubTopic: async function (req, res) {
        let result = await lessonServ.addSubTopic(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },
    changeActive: async function (req, res) {
        let result = await lessonServ.changeActive(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },
    deleteLesson: async function (req, res) {
        let result = await lessonServ.deleteLesson(req.body);
        if (result.toBeDeleted && result.toBeDeleted.length > 0) {
            utils.deleteFile(result.toBeDeleted)
            delete result.toBeDeleted
        }
        utils.sendResponse(result, req, res);
    },
    deleteSubTopic: async function (req, res) {
        let result = await lessonServ.deleteSubTopic(req.body);
        if (result.toBeDeleted && result.toBeDeleted.length > 0) {
            utils.deleteFile(result.toBeDeleted)
            delete result.toBeDeleted
        }
        utils.sendResponse(result, req, res);
    },
    deleteTopic: async function (req, res) {
        let result = await lessonServ.deleteTopic(req.body);
        if (result.toBeDeleted && result.toBeDeleted.length > 0) {
            utils.deleteFile(result.toBeDeleted)
            delete result.toBeDeleted
        }
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await lessonServ.delete(req.params.id);
        if (result.toBeDeleted && result.toBeDeleted.length > 0) {
            utils.deleteFile(result.toBeDeleted)
            delete result.toBeDeleted
        }
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await lessonServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await lessonServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
