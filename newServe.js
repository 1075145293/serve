const express = require('express');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dbConfig = require('./config');
const userSql = require('./userSQL');
const pool = mysql.createPool( dbConfig.mysql );
const email = require('./email')

const responseJSON = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({     code:'-200',     msg: '操作失败'
        });
    } else {
        res.json(ret);
    }};

const serialize = function (res) {
    const dataString = JSON.stringify(res);
    const jsonData = JSON.parse(dataString);
    return jsonData
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// 注册
app.post('/api/register', function(req, res, next){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
        if (err) throw  err
        const {phone,nickName,password} = req.body
        const user_uuid = uuid.v1()
// 建立连接 检查用户是否已存在
        connection.query(userSql.check, [nickName,phone], function(err, result) {
            if (err) throw err
            const jsonData = serialize(result);
            let response
            if(jsonData.length > 0) {
                let msg = ''
                if (jsonData[0].nickName === nickName ) {
                    msg = '用户名已存在'
                } else if (jsonData[0].phone === phone){
                    msg = '手机号已存在'
                }
                response = {
                    code: 100,
                    msg
                };
                responseJSON(res, response);
            }else {
                const data = [user_uuid,phone,nickName,password]
                connection.query(userSql.register, data, function(err, ret) {
                    if (err) throw err
                    const resData = serialize(ret);
                    if(resData) {
                        console.log(1)
                        response = {
                            code: 0,
                            msg:'增加成功'
                        };
                        email.sendEmail(`${nickName}注册啦`)
                    }
                    responseJSON(res, response);
                });
            }
            connection.release();
        });
    });
});
// 登录
app.get('/api/login',function (req,res,next) {
    pool.getConnection(function(err, connection) {
        if (err) throw err
// 获取前台页面传过来的参数
        const {phone,password} = req.query || req.params
// 建立连接 检查用户是否已存在
        connection.query(userSql.checkAccount, [phone,password], function(err, result) {
            if (err) throw err
            const jsonData = serialize(result);
            let response
            if(jsonData.length === 0) {
                response = {
                    code: 100,
                    msg: '用户名或密码错误'
                };
                // 释放连接
            }else {
                response = {
                    code: 0,
                    msg: '',
                    data: {
                        nickName: jsonData[0].nickName,
                        uuid:jsonData[0].uuid,
                        phone:jsonData[0].phone,
                    }
                }
            }
            responseJSON(res, response);
            connection.release();
        });
    });
})

app.listen(8081,function () {
    console.log('服务器正在监听8081端口....')
})
