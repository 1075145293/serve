const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '1075145293@qq.com',
        pass: 'npkltxzjkjaffede' //授权码,通过QQ获取

    }
})
module.exports = {
    sendEmail:function(msg){
        const mailOptions = {
            from: '1075145293@qq.com', // 发送者
            to: '1075145293@qq.com', // 接受者,可以同时发送多个,以逗号隔开
            subject: '有人注册啦', // 标题
            text:msg, // 文本
            //     html: `<!--<h2>今天吃番茄炒蛋:</h2><h3>-->
            // </h3>`
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('发送成功');
        })
    }
}

