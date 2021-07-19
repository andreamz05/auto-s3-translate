var AWS = require('aws-sdk');
var translate = new AWS.Translate();
var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    
    // Obtener el objeto del evento
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key
    };
    
    const key_elements = key.split("/");
    const object_name = key_elements[key_elements.length -1];
    
    s3.getObject(params, function(err, data) {
        if(err){
            console.log(err, err.stack);
            callback(err);
        }
        else{
            // Obtenemos el texto y lo traducimos
            let object_data = data.Body;
            const translateParams = {
                SourceLanguageCode: 'auto',
                TargetLanguageCode: 'en',
                Text: object_data.toString()
            };
            translate.translateText( translateParams, function(err, data) {
                if(err){
                    console.log(err, err.stack);
                    callback(err);
                }
                else{
                    // Guardamos el texto traducido en S3
                    let translated_text = data.TranslatedText;
                    const s3params = {
                        Body: translated_text,
                        Bucket: bucket,
                        Key: `translations/${object_name}`
                    };
                    s3.putObject(s3params, function(err, data) {
                       if(err){
                           console.log(err, err.stack);
                           callback(err);
                       } 
                       else{
                           console.log(data);
                            callback(null, {});
                       }
                    });
                }
            });
        }
    });
};
