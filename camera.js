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
    host: '...'
});


// s3 설정 
var keys = require("./certs/access-keys.js");
var s3 = new AWS.S3({
    "accessKeyId" : keys.access_key,
    "secretAccessKey" : keys.secret_key
});


// 센서, 카메라 모듈 
const Gpio = require('pigpio').Gpio;
const PiCamera = require('pi-camera');


// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;
const trigger = new Gpio(24, {mode: Gpio.OUTPUT});
const echo = new Gpio(23, {mode: Gpio.INPUT, alert: true});
trigger.digitalWrite(0); // Make sure trigger is low


// 초음파 센서 -> 거리 반환 
function watchHCSR04 () {
    return new Promise (function (resolve, reject) {
        echo.on('alert', (level, tick) => {
            // console.log("HCSR04 on!! ", level);

            if (level == 1) {
                startTick = tick;
            } else {
                const endTick = tick;
                const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
                var distance = diff / 2 / MICROSECDONDS_PER_CM
                // console.log(distance)
                resolve(distance);
            }
        });
    });
}


// file read
const readFile = filePath =>
    new Promise((resolve, reject) => {
        fs.readFile(filePath, (error, data) => {
            if (error) reject(error);
            resolve(data);
        });
    });


// file delete
const deleteFile = filePath =>
    new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err)
            resolve(`${filePath} was deleted`)
        });
    });


// s3에 사진 업로드 
function createObject(params) {
    return new Promise(function (resolve, reject) {
        s3.upload(params, function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}


// createObject()의 결과를 출력
async function createDeploymentPackage (params) {       
    try { 
        var res = await createObject(params); 
        console.log(res);          
    } catch (err) { console.log(err); }
}


// 사진 찍고 -> 업로드 -> pulbish
function CameraV2 (distance) {
    return new Promise (function (resolve, reject) {
        if (distance < 20) {
            console.log("Car is Coming !!");
            
            var filePath = './photo/image.jpg';
            var message = {'detect' : 'carRecog/detect/car', 'image' : 'MyCar'};

            // 카메라 
            const myCamera = new PiCamera({
                mode: 'photo',
                output: filePath,
                width: 300,
                height: 200,
                nopreview: true,
            });
            
            // 사진 촬영 
            myCamera.snap()
            .then(() => readFile(filePath))
            .then(data => createDeploymentPackage({ // 사진 업로드 
                    Bucket : '...',
                    Key : 'MyCar.jpg',
                    Body : data,
                }))
            .then(() => deleteFile(filePath))
            .then(() => camera.publish('carRecog/request', JSON.stringify(message))) // publish
            .then(() => console.log('publish to carRecog/request'))
            .catch((error) => {
                console.log(error);
            });
        }
    });
}


async function camera2 () {
    var dist = await watchHCSR04();
    await CameraV2(dist);

   // var message = {'detect' : 'carRecog/detect/car', 'image' : 'MyCar'};
   // camera.publish('carRecog/request', JSON.stringify(message));
    
   // console.log('publish to carRecog/request -> '+JSON.stringify(message));
}


camera.on('connect', function() {
    console.log('Camera connected');
    
    setInterval(() => {
        trigger.trigger(10, 1);
        camera2();
    }, 10000);
});

