"use strict";
/**
 * 处理内部逻辑发出HTTP请求
 */

var http = require("http");
var https = require('https');
var qs = require('querystring');

var HttpService = function(){
    //todo
};

var pro = HttpService.prototype;

//发送HTTP GET请求
pro.sendHttpGetReq = function(hostName,port,path,param,cb){
    console.log("sendHttpGetReq");

    var content = qs.stringify(param);
    console.log("content:",content);

    var options = {
        hostname: hostName,
        port: port,
        path: path+"?"+content,
        method: 'GET'
    };

    console.log(options);

    //todo 请求超时timer
    var req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            cb(null,JSON.parse(chunk));
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        cb(new Error("err"),null)
    });

    req.end();
};
//发送HTTPS GET请求
pro.sendHttpsGetReq = function(hostName,port,path,param,cb){

    console.log("sendHttpGetReq");

    var content = qs.stringify(param);

    https.get(hostName + ":" + port + path + "?"+content, function(res){
        console.log('statusCode: ', res.statusCode);
        res.on('data', function(d){
            cb(null,JSON.parse(d.toString()))
        });

    }).on('error',function(e) {
        console.error(e);
        cb(e)
    });
};
//发送HTTP POST请求
pro.sendHttpPostReq = function(hostName,port,path,param,cb){

    console.log("sendHttpPostReq");

    var content = qs.stringify(param);
    console.log("content:",content);

    var options = {
        hostname: hostName,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": content.length
        }
    };
    //todo 请求超时timer
    var req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                console.log(data);
                cb(null,JSON.parse(data));
            });
        }else{
            res.send(500, "error");
            cb(new Error("err"),null)
        }
    });

    req.on('error', function (e) {
        cb(new Error("err"),null)
    });

    req.write(content);

    req.end();

};
//发送HTTPS POST请求
pro.sendHttpsPostReq = function(hostName,port,path,param,cb){

    console.log("sendHttpsPostReq");
    var content = qs.stringify(param);

    path = path + "?" + content;
    console.log("path=>",path);

    var options = {
        hostname: hostName,
        port: port || 443,
        path: path || '/',
        method: 'POST'
    };

    https.request(options,function(res){
        console.log('statusCode: ', res.statusCode);
        res.on('data', function(d){
            cb(null,JSON.parse(d.toString()))
        });

    }).on('error',function(e) {
        console.error(e);
        cb(e)
    });

};

module.exports = new HttpService();