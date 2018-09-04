module.exports = {
    onButtonTest() {
        const qiniu = Editor.require("packages://avgmaker/node_modules/qiniu");
        debugger;
        /*
   qiniu.conf.ACCESS_KEY = this.accessKey;
   qiniu.conf.SECRET_KEY = this.secretKey;


   let uploadFile = "/Users/xyf/Documents/project/avg/build/web-mobile/main11.js";
   let uploadKey = "main11.js";

   let options = {
       // 空间
       scope: this.bucket,
       // 凭证有效时间
       expires: 7200,
       // 自定义上传回复凭证
       returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
   };
   let putPolicy = new qiniu.rs.PutPolicy(options);
   let token = putPolicy.token();

   let extra = new qiniu.io.PutExtra();
   qiniu.io.putFile(token, uploadKey, uploadFile, extra, function (err, ret) {
       debugger;
       if (!err) {
           console.log(ret.hash, ret.key, ret.persistentId);
       } else {
           console.log(err);
       }
   });
*/

        // 上传凭证
        let mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
        let options = {
            // 空间
            scope: this.bucket,
            // 凭证有效时间
            expires: 7200,
            // 自定义上传回复凭证
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken = putPolicy.uploadToken(mac);


        let config = new qiniu.conf.Config();
        // 空间对应的机房
        // 华东	qiniu.zone.Zone_z0
        // 华北	qiniu.zone.Zone_z1
        // 华南	qiniu.zone.Zone_z2
        // 北美	qiniu.zone.Zone_na0
        config.zone = qiniu.zone.Zone_z0;
        // 是否使用https域名
        //config.useHttpsDomain = true;
        // 上传是否使用cdn加速
        //config.useCdnDomain = true;
        // let bucketManager = new qiniu.rs.BucketManager(mac, config);

        let file = "/Users/xyf/Documents/project/avg/build/web-mobile/main11.js";
        let key = "main11.js";
        if (fs.existsSync(file)) {
            console.log("文件存在!");
        }
        let formUploader = new qiniu.form_up.FormUploader(config);
        let putExtra = new qiniu.form_up.PutExtra();
        formUploader.putFile(uploadToken, key, file, putExtra, function (respErr, respBody, respInfo) {
            debugger;
            if (respErr) {
                console.log(respErr);
                console.log(respErr.message);
                return;
            }
            if (respInfo.statusCode === 200) {
                console.log(respBody);
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });

    },
};