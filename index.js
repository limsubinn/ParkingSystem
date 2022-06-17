var AWS = require('aws-sdk');
var iotdata = new AWS.IotData({
    endpoint: '...',
});

var client = new AWS.Rekognition();
var bucket = '...';

exports.handler = async function (event) {
    
    var photo_target = event.image + '.jpg';

    const params = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: photo_target
            },
        },
    };
    
    var detectedText;
    
    await client.detectText(params, function(err, response) { // rekognition
        if (err) {
            console.log(err, err.stack); // handle error if an error occurred
        } else {
            console.log(`Detected Text for: ${photo_target}`)
            console.log(response)
            response.TextDetections.forEach(label => {
                console.log(`Detected Text: ${label.DetectedText}`),
                console.log(`Type: ${label.Type}`),
                console.log(`ID: ${label.Id}`),
                console.log(`Parent ID: ${label.ParentId}`),
                console.log(`Confidence: ${label.Confidence}`),
                console.log(`Polygon: `)
                console.log(label.Geometry.Polygon)
                
                if (label.Id == 0) detectedText = label.DetectedText.replace(/ /g, "");
                // 인식한 전체 텍스트 -> 공백 제거 후 저장 
            })
        } 
    }).promise();

    var params_topic = {
        topic: event.detect,
        payload: JSON.stringify({ 'image': event.image, 'command': detectedText}),
        qos: 1 // 0: 한번 전송, 1: 받을 때까지 전송, 2: 받을 때까지 기다림 
    };

    var res = await iotdata.publish(params_topic).promise(); // detect topic 으로 publish
    return { 'statusCode': 200, 'result': res };
}