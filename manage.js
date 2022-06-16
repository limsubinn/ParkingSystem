// aws iot core
var awsIot = require('aws-iot-device-sdk');


// aws IoT Core로부터 받아와야 하는 정보 
var manage = awsIot.device({
    keyPath: './certs/manage-key/private.pem.key',
    certPath: './certs/manage-key/certificate.pem.crt',
    caPath: './certs/manage-key/AmazonRootCA1.pem',
    clientId : 'Manage',
    host: 'a3pxb4norcph62-ats.iot.ap-northeast-2.amazonaws.com'
});

// topic
var topic = 'carRecog/detect/car';

// connect
manage.on('connect', () => { 
    console.log('Manage connected');

    // subscribe
    manage.subscribe(topic);
    console.log(topic + " sub!!");
});

// message arrive
manage.on('message', (topic, message) => { 
    console.log(topic + "-> message arrive");
            
    if (topic == 'carRecog/detect/car') {
                
        var msg = JSON.parse(message.toString()); 
        console.log(msg.command);

        //데베 비교 해야됨
        //if(noti.command == 'unlock') console.log(noti.image, ': unlock door1');
        //else console.log(noti.image, ': unauthenticated person');
    }
});