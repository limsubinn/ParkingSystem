// aws iot core
var awsIot = require('aws-iot-device-sdk');


// file system 
var fs = require('fs'); 


// aws
var AWS = require('aws-sdk'); 
AWS.config.region = 'ap-northeast-2';
AWS.config.apiVersions = {
    "s3" : '2006-03-01'
};


// 디바이스 설정 
var camera = awsIot.device({
    keyPath: './certs/camera-key/private.pem.key',
    certPath: './certs/camera-key/certificate.pem.crt',
    caPath: './certs/camera-key/AmazonRootCA1.pem',
    clientId : 'Camera',
    host: 'a3pxb4norcph62-ats.iot.ap-northeast-2.amazonaws.com'
});

var keys = require("./certs/access-keys.js");


// s3 설정 
var s3 = new AWS.S3({
    "accessKeyId" : keys.access_key,
    "secretAccessKey" : keys.secret_key
});


// s3에 사진 업로드할 파라미터 
var params = {
    Bucket : 'cloud-test-hyun', 
    Key : 'newcar.jpg',      // S3 object
    Body:  fs.createReadStream("./images/car1.jpg")
}


// s3에 사진 업로드 
function createObject(params) {
    return new Promise(function (resolve, reject) {
        s3.upload(params, function (err, data) {        
            if (err) reject(err);
            else resolve(data);
        })
    });
}


// createObject()의 결과를 출력
async function createDeploymentPackage (params) {       
    try { 
        var res = await createObject(params); 
        console.log(res);          
    } catch (err) { console.log(err); }
}


// create S3 object
createDeploymentPackage(params);


// 3초 간격으로 carRecog/request 로 publish 
camera.on('connect', function() {
    console.log('Camera connected');

    var message = {'detect' : 'carRecog/detect/car', 'image' : 'newcar'};
    setInterval(function() {
        camera.publish('carRecog/request', JSON.stringify(message));
        console.log('publish to carRecog/request -> '+JSON.stringify(message));
    }, 3000);
});

camera.on('message', function() {
    console.log(topic + "send!!");
});