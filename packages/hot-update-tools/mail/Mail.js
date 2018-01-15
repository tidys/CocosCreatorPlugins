'use strict';
let NodeMailer = Editor.require('packages://hot-update-tools/node_modules/nodemailer');
let Fs = require('fire-fs');

module.exports = {
    _service: "qq",
    _user: "xu_yanfeng@qq.com",
    _pass: "fizyosflryzlbege",

    setMailServiceInfo(user, pass) {
        this._user = user;
        this._pass = pass;
    },
    isArray(object) {
        return object && typeof object === 'object' && Array == object.constructor;
    },
    sendMail(version, content, people, sendCb) {
        let transporter = NodeMailer.createTransport({
            service: this._service,
            auth: {
                user: this._user,
                pass: this._pass, //授权码,通过QQ获取
            }
        });

        let sendPeople = ['xu_yanfeng@126.com'];
        if (this.isArray(people)) {
            for (let k in people) {
                sendPeople.push(people[k]);
            }
        } else if (typeof people === "string") {
            sendPeople.push(people);
        }
        let data = Fs.readFileSync(Editor.url('packages://hot-update-tools/mail/MailTemp.html', 'utf8')).toString();
        if (data.indexOf('%version%') !== -1) {
            data = data.replace("%version%", version);
        }
        if (data.indexOf('%content%') !== -1) {
            data = data.replace("%content%", content);
        }
        let mailOptions = {
            from: this._user, // 发送者
            to: sendPeople.toString(), // 接受者,可以同时发送多个,以逗号隔开
            subject: '测试版本 发布通知-v' + version, // 标题
            text: 'Hello world', // 文本
            html: data,
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (sendCb) {
                sendCb();
            }
            if (err) {
                console.log(err);
            }
        });
    }
};