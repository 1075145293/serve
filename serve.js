const express = require('express');

const bodyParser = require('body-parser');
const mysql = require('mysql');
const dbConfig = require('./config/mysql');
const sql = require('./sql/index');
const serialize = function (res) {
    const dataString = JSON.stringify(res);
    const jsonData = JSON.parse(dataString);
    return jsonData
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

function timestampToTime(da) {
    var date = new Date();//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
    return Y+M+D
}


app.post('/api/postIdea', function (req, res, next) {
    var connection = mysql.createConnection(dbConfig.mysql);
    connection.connect();
    const { name, interpretation, idea } = req.body
    const date = timestampToTime()
    //查
    connection.query(sql.addIdea, [name, idea, interpretation, date],function (err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }
        res.send({
            code: 0,
            msg: '',
        })
    });
    connection.end();
})
app.get('/api/searchIdea', function (req, res, next) {
    const connection = mysql.createConnection(dbConfig.mysql);
    connection.connect();
    let sqlStr = sql.searchIdea
    let sqlLimit;
    const { keyWords, page, pageSize } = req.query || req.params
    let currentPage = page ? page - 1 : 0;
    let size = pageSize ? pageSize : 20 ;
    if(keyWords){
        sqlLimit = `SELECT * FROM idea WHERE CONCAT( name, idea, interpretation ) LIKE '%${keyWords}%' limit ${currentPage * size},${size}`
    }else{
        sqlLimit = `SELECT * FROM idea limit ${currentPage * size},${size}`
    }
    //查
    connection.query(sqlStr, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.send({
                code: -999,
                msg: 'error',
            })
            return;
        }else{
            const connection = mysql.createConnection(dbConfig.mysql);
            connection.connect();
            connection.query(sqlLimit,function(err,result1){
                if(err){
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }else{
                    const resData = serialize(result1);
                    res.send({
                        code: 0,
                        msg: '',
                        res: resData,
                        pageSize:20,
                        total: result.length,
                        page:page
                    })
                }
            })
        }
    });
    connection.end();
})
app.listen(8081, function () {
    console.log('服务器正在监听3000端口....')
})
