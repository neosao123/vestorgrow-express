const webUserService = require("../services/webUser.service");

module.exports = {
    add: async (req, res) => {
        const result = await webUserService.add(req.body);
        const status = result.status;
        delete result.status;
        if (status == 200) {
            res.status(200).send(result);
        }
        else {
            res.status(status).send(result);
        }
    },

    emailVerification: async (req, res) => {

        const result = await webUserService.emailVerification(req.body.otp, req.body.email);
        const status = result.status;
        delete result.status;
        if (status === 200) {
            res.status(200).send(result);
        }
        else {
            res.status(status).send(result);
        }
    },

    resendemailverificationOTP: async (req, res) => {
        const result = await webUserService.resendEmailVerifiacationOTP(req.body.email);
        let status = result.status;
        delete result.status;
        if (status === 200) {
            res.status(200).send(result);
        }
        else {
            res.status(status).send(result);
        }
    },

    passwordUpdate: async (req, res) => {
        const result = await webUserService.passwordUpdate(req.body.email, req.body.password);
        let status = result.status;
        delete result.status;
        if (status === 200) {
            res.status(200).send(result);
        }
        else {
            res.status(status).send(result);
        }
    },

    update_username: async (req, res) => {
        const result = await webUserService.update_username(req.body.id, req.body.user_name)
        if (result.status !== 200) {
            res.status(result.status).send({ message: result.message, userNameSuggestions: result.userNameSuggestionArr });
        } else {
            delete result.status;
            res.send(result);
        }
    },

    change_email: async (req, res) => {
        const result = await webUserService.change_email(req.body.id, req.body.email);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    },

    update_Bio: async (req, res) => {
        const result = await webUserService.update_Bio(req.body.id, req.body.bio);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    },

    update_ProfileImage: async (req, res) => {
        const result = await webUserService.update_ProfileImage(req.body.id, req.body.profile_img);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    },

    signup_Google: async (req, res) => {
        const result = await webUserService.signup_Google(req.body);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    },

    update_Password_auth: async (req, res) => {
        const result = await webUserService.update_Password_auth(req.body.email, req.body.date_of_birth, req.body.password);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    },

    skip_onboardingsteps: async (req, res) => {
        const result = await webUserService.skip_onboardingsteps(req.query.id, req.body);
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    }

}