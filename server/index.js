var express = require("express");
const bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

let port = 3210;
app.get("/", function (req, res) {
    res.send("hello");
});
app.post("/", bodyParser.json(), function (req, res) {
    // console.log(req.body);
    let reqData = "";
    req.on('data', function (data) {
        reqData += data;
    });
    req.on('end', function () {
        console.log(reqData);
        reqData = JSON.parse(reqData);
        let len = Object.keys(reqData).length;
        let arr = new Uint8Array(len);
        for (let key in reqData) {
            arr[key] = reqData[key];
        }

        let proto = require("./proto/proto.js");
        let protobuf = require("protobufjs");

        let TestMsg = proto.proto.Test;
        let encodeData = TestMsg.decode(arr);
        console.log(encodeData);
        // let data = JSON.parse(reqData);
        // console.log(data);
        // res.send("hello post");
    });
});

app.listen(port, function () {
    console.log(`app listening on : ${port}`);
});