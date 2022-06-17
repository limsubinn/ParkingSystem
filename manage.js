// aws iot core
var awsIot = require('aws-iot-device-sdk');
var mysql = require("mysql"); // mysql 모듈을 불러옵니다.


// aws IoT Core로부터 받아와야 하는 정보 
var manage = awsIot.device({
    keyPath: './certs/manage-key/private.pem.key',
    certPath: './certs/manage-key/certificate.pem.crt',
    caPath: './certs/manage-key/AmazonRootCA1.pem',
    clientId : 'Manage',
    host: '...'
});


// RDS 연결
var connection = mysql.createConnection({
    host: "...",
    user: "...",
    password: "...",
    database: "parkingSystem"
});


// connect
manage.on('connect', function() { 
    console.log('Manage connected');

    // subscribe
    manage.subscribe('carRecog/detect/car', function() { 
        console.log('subscribing to the topic carRecog/detect/car');
    });
 });
 
 
// message arrive
manage.on('message', function (topic, message) {
    console.log("msg arrive");

    if (topic == 'carRecog/detect/car') {
        var msg = JSON.parse(message.toString());
        var sql = 'SELECT * FROM carNumber';

        connection.query(sql, function (err, rows, fields) {
            var exist = 0;

            // 데이터베이스 비교
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].car === msg.command) {
                    exist++;
                    break;
                }
            }

            // 데이터베이스에 차가 이미 존재 -> 삭제하고 출차 
            if (exist > 0) {
                var sql = 'DELETE FROM carNumber WHERE car = ?';

                connection.query(sql, msg.command, function (err, rows, fields) {
                    if (err) console.log(err);
                    else console.log(msg.command + " OUT");
                });
            }
            // 데이터베이스에 차가 없음 -> 삽입하고 입차
            else {
                var sql = 'INSERT INTO carNumber (car) VALUES (?)';

                connection.query(sql, msg.command, function (err, rows, fields) {
                    if (err) console.log(err);
                    else console.log(msg.command + " IN");
                });
            }

        });
    }
});