const Lesson = require("../models/Lesson.model");
const { ObjectId } = require('mongodb');
const utils = require("../utils/utils")
module.exports = {
    add: async function (lesson, currUser) {
        lesson.created_by = currUser._id
        let result = {};
        try {
            result.data = await new Lesson(lesson).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await Lesson.findByIdAndUpdate(
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
    changeActive: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await Lesson.findByIdAndUpdate(
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
    addTopic: async function (data, currUser) {
        let result = {};
        try {
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (data.topic._id && course.topics.length > data.topicIdx) {
                        if (course.topics[data.topicIdx].sub_topics && course.topics[data.topicIdx].sub_topics.length > 0) {
                            course.topics[data.topicIdx].topic_title = data.topic.topic_title
                        } else {
                            course.topics[data.topicIdx] = data.topic
                        }

                    } else {
                        course.topics.push(data.topic)
                    }
                    result.data = await course.save()
                } else {
                    result.err = ["Record not found"];
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    addSubTopic: async function (data, currUser) {
        let result = {};
        try {
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (course.topics.length > data.topicIdx) {
                        if (course.topics[data.topicIdx].sub_topics.length > data.subTopicIdx) {
                            course.topics[data.topicIdx].sub_topics[data.subTopicIdx].sub_topic_title = data.sub_topic_title

                        } else {
                            course.topics[data.topicIdx].sub_topics.push({ sub_topic_title: data.sub_topic_title })
                        }
                        result.data = await course.save()
                    } else {
                        result.err = ["Record not found"];
                    }
                } else {
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    addLesson: async function (data) {
        let result = {};
        try {
            let subTopicIdx = data.subTopicIdx;
            let topicIdx = data.topicIdx;
            let lessonIdx = data.lessonIdx
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (course.topics.length > topicIdx && course.topics[topicIdx].sub_topics.length > subTopicIdx) {
                        let subTopic = course.topics[topicIdx].sub_topics[subTopicIdx]
                        if (subTopic.lessons.length > lessonIdx) {
                            let watch_time = course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].watch_time
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].lesson_title = data.lesson_title
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].desc = data.desc
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].lesson_video = data.lesson_video
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].lesson_cover = data.lesson_cover
                            if (data.watch_time) {
                                course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].watch_time = data.watch_time
                                course.watch_time += data.watch_time - watch_time
                            }
                        } else {
                            let watch_time = 0
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons.push({
                                lesson_title: data.lesson_title,
                                desc: data.desc,
                                lesson_video: data.lesson_video,
                                lesson_cover: data.lesson_cover,
                                watch_time: data.watch_time ? data.watch_time : watch_time
                            })
                            if (data.watch_time) {
                                course.watch_time += data.watch_time
                            }
                        }
                        result.data = await course.save()
                    } else {
                        result.err = ["Record not found"];
                    }
                } else {
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    deleteTopic: async function (data, currUser) {
        let result = {};
        let toBeDeleted = []
        try {
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (course.topics.length > data.topicIdx) {
                        let watch_time = 0
                        course.topics[data.topicIdx].sub_topics.map(item => {
                            item.lessons.map(lesson => {
                                toBeDeleted.push(lesson.lesson_video)
                                toBeDeleted.push(lesson.lesson_cover)
                                watch_time += lesson.watch_time
                            })
                        })
                        course.watch_time -= watch_time
                        course.watch_time = course.watch_time < 0 ? 0 : course.watch_time
                        course.topics.splice(data.topicIdx, 1)
                        result.data = await course.save()
                        result.toBeDeleted = toBeDeleted
                    } else {
                        result.err = ["Record not found"];
                    }
                } else {
                    result.err = ["Record not found"];
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    deleteSubTopic: async function (data, currUser) {
        let result = {};
        let toBeDeleted = []
        try {
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (course.topics.length > data.topicIdx) {
                        if (course.topics[data.topicIdx].sub_topics.length > data.subTopicIdx) {
                            let watch_time = 0
                            course.topics[data.topicIdx].sub_topics[data.subTopicIdx].lessons.map(item => {
                                toBeDeleted.push(item.lesson_video)
                                toBeDeleted.push(item.lesson_cover)
                                watch_time += item.watch_time
                            })
                            course.watch_time -= watch_time
                            course.watch_time = course.watch_time < 0 ? 0 : course.watch_time
                            course.topics[data.topicIdx].sub_topics.splice(data.subTopicIdx, 1)
                            result.data = await course.save()
                            result.toBeDeleted = toBeDeleted
                        } else {
                            result.err = ["Record not found"];
                        }
                    } else {
                        result.err = ["Record not found"];
                    }
                } else {
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    deleteLesson: async function (data) {
        let result = {};
        let toBeDeleted = []
        try {
            let subTopicIdx = data.subTopicIdx;
            let topicIdx = data.topicIdx;
            let lessonIdx = data.lessonIdx
            if (data && data.courseId) {
                let course = await Lesson.findById(data.courseId);
                if (course) {
                    if (course.topics.length > topicIdx && course.topics[topicIdx].sub_topics.length > subTopicIdx) {
                        let subTopic = course.topics[topicIdx].sub_topics[subTopicIdx]
                        if (subTopic.lessons.length > lessonIdx) {
                            toBeDeleted.push(course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].lesson_video)
                            toBeDeleted.push(course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].lesson_cover)
                            course.watch_time -= course.topics[topicIdx].sub_topics[subTopicIdx].lessons[lessonIdx].watch_time
                            course.watch_time = course.watch_time < 0 ? 0 : course.watch_time
                            course.topics[topicIdx].sub_topics[subTopicIdx].lessons.splice(lessonIdx, 1);
                            result.data = await course.save()
                            result.toBeDeleted = toBeDeleted
                        } else {
                            result.err = ["Record not found"];
                        }
                    } else {
                        result.err = ["Record not found"];
                    }
                } else {
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    delete: async function (id) {
        let result = {};
        let toBeDeleted = []
        try {
            let course = await Lesson.findById(id);
            if (course) {
                toBeDeleted.push(course.cover_image)
                toBeDeleted.push(course.banner_image)
                course.topics.map(topic => {
                    topic.sub_topics.map(item => {
                        item.lessons.map(lesson => {
                            toBeDeleted.push(lesson.lesson_video)
                            toBeDeleted.push(lesson.lesson_cover)
                        })
                    })
                })
            } else {
                result.err = ["Record not found"];
            }
            result.data = await Lesson.findByIdAndDelete(id);
            result.toBeDeleted = toBeDeleted
            return { message: "Record deleted successfully", toBeDeleted: toBeDeleted };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (lessonObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};

        if (lessonObj.filter !== undefined) {
            if (lessonObj.filter.searchText !== undefined) {
                condition = {
                    $or: [
                        {
                            course_name: {
                                $regex: ".*" + lessonObj.filter.searchText + ".*",
                                $options: "i",
                            },
                        },
                        {
                            course_desc: {
                                $regex: ".*" + lessonObj.filter.searchText + ".*",
                                $options: "i",
                            },
                        },
                    ],
                };
            }
            if (
                lessonObj.filter.is_active !== undefined &&
                lessonObj.filter.is_active !== null &&
                lessonObj.filter.is_active != ""
            ) {
                condition["is_active"] = lessonObj.filter.is_active;
            }
            if (
                lessonObj.filter.categoryId !== undefined &&
                lessonObj.filter.categoryId !== null &&
                lessonObj.filter.categoryId.length != 0
            ) {
                condition["categoryId"] = { $in: lessonObj.filter.categoryId };
            }
            if (
                lessonObj.filter.level !== undefined &&
                lessonObj.filter.level !== null &&
                lessonObj.filter.level.length != 0
            ) {
                condition["level"] = { $in: lessonObj.filter.level };
            }
        }

        try {
            if (lessonObj.start === undefined || lessonObj.length === undefined) {
                data = await Lesson.find(condition).populate("createdBy").select({ "topics": 0 }).sort({
                    createdAt: "desc",
                });
            } else {
                data = await Lesson.find(condition).populate("createdBy")
                    .select({ "topics": 0 })
                    .limit(parseInt(lessonObj.length))
                    .skip(lessonObj.start)
                    .sort({
                        createdAt: "desc",
                    });
            }
            data.map((item, idx) => {
                data[idx]._doc.watch_time = utils.secondsToHm(item.watch_time)
            })
            count = await Lesson.countDocuments(condition);
            result = {
                data: data,
                total: count,
                currPage: parseInt(lessonObj.start / lessonObj.length) + 1,
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
                data = await Lesson.findById(id).populate("createdBy");
                data.topics.forEach((topic, topicIdx) => {
                    topic.sub_topics.forEach((subTopic, subTopicIdx) => {
                        subTopic.lessons.forEach(async (lssn, lssnIndx) => {
                            let watch_time = await utils.secondsToHm(lssn.watch_time);
                            data.topics[topicIdx].sub_topics[subTopicIdx].lessons[lssnIndx]._doc.watch_time = watch_time
                        })
                    })
                });
                result.data = data
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};
