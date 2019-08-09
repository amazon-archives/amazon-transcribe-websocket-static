// For pre-sign URL
const v4 = require('./lib/aws-signature-v4.js')
const crypto = require('crypto');

// For reading from file
const fs = require('fs');

// For marshelling and unmarshelling
var eventstream_marshaller = require("@aws-sdk/eventstream-marshaller");
var util_utf8_node = require("@aws-sdk/util-utf8-node")
var esBuilder = new eventstream_marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

// For WebSocket client
const WebSocket = require('websocket').w3cwebsocket;

const endpointPrefix = "transcribestreaming.";
const endpointSuffix = ".amazonaws.com:8443";

// Utility function to show usage of command line tool
function showUsageAndQuit(errMessage) {
    console.error('');
    console.error(errMessage);
    console.log('\nUsage:' + `\t${process.argv[1]} <mediaFile> <languageCode> <samplingRate>`);
    process.exit(1);
}

// Utility function that checks if the required environment variables are present
function validateCredentials(accessKey, secretKey, region) {
    if(!accessKey) {
        console.error('Access Key missing. Please export AWS_ACCESS_KEY_ID');
    } else if(!secretKey) {
        console.error('Secret Key missing. Please export AWS_SECRET_ACCESS_KEY');
    } else if(!region) {
        console.error('Region not defined. Please export AWS_REGION');
    } else {
        // Everything is present, return to calling function
        return;
    }
    // Something went wrong, exit program
    process.exit(1);
}
 
function doIt(audioFileName) {
 
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    validateCredentials(accessKey, secretKey, region);

    var options = {
          'key': accessKey,
          'secret': secretKey,
          'protocol': 'wss',
          'expires': 15,
          'region': region,
          'query' : "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + samplingRate
        }; 

    const secretToken = process.env.AWS_SESSION_TOKEN;
    if(secretToken) {
        options.sessionToken = secretToken;
    }

    endpoint = endpointPrefix + region + endpointSuffix;
    
    var uri = v4.createPresignedURL(
        'GET',
        endpoint,
        '/stream-transcription-websocket',
        'transcribe',
        crypto.createHash('sha256').update('', 'utf8').digest('hex'),
        options
    );
 
    // Read with chunk size of 3200 as the audio is 16kHz linear PCM
    const src = ((audioFileName === '-')
        ? fs.createReadStream('-', { fd: 0, highWaterMark:  160 })
        : fs.createReadStream(audioFileName, { highWaterMark:  160 }));

    const requestStartTime = (new Date()).getTime();
     
    connection = new WebSocket(uri);
    connection.binaryType = "arraybuffer";

    // WebSockete connection with Amazon Transcribe is now open
    connection.onopen = function() {
        console.log("Connection opened with Amazon Transcribe");
 
        src.on('data', function (chunk) {
             var audioEventMessage = getAudioEventMessage(Buffer.from(chunk));
            var binary = esBuilder.marshall(audioEventMessage);
            connection.send(binary);
        });
 
        src.on('end', function() {
            if(connection.OPEN) {
                // This signals transcribe service the end of stream and closes connection gracefully.
                var emptyMessage = getAudioEventMessage(Buffer.from([]));
                var emptyBuffer = esBuilder.marshall(emptyMessage);
                connection.send(emptyBuffer);
            }
        });
    }
 
    // Message received from Amazon Transcribe
    connection.onmessage = function(message) {
        var transcribeMessage = esBuilder.unmarshall(Buffer.from(message.data));
        var transcribeMessageJson = JSON.parse(String.fromCharCode.apply(String, transcribeMessage.body));
        if (transcribeMessage.headers[":message-type"].value === "exception") {
            // Error 
            if (connection && connection._client && connection._client.response && connection._client.response.headers) {
                console.log(connection._client.response.headers);
            }
            console.log('[' + transcribeMessage.headers[":exception-type"].value + '] ' + transcribeMessageJson.Message);
            process.exit(1);
        } else if (transcribeMessage.headers[":message-type"].value === "event") {
            // Transcript event
            if (transcribeMessageJson.Transcript.Results.length > 0) {
                if (transcribeMessageJson.Transcript.Results[0].Alternatives.length > 0) {
                    if (transcribeMessageJson.Transcript.Results[0].Alternatives[0].Transcript.length > 0) {
                        // don't show partial results. Remove this if condition if you want to see partial transcripts as well
                        if (transcribeMessageJson.Transcript.Results[0].IsPartial == false) {
                            var result = transcribeMessageJson.Transcript.Results[0];
                            console.log(`${(((new Date()).getTime() - requestStartTime)/1000).toFixed(3)} ${parseFloat(result.StartTime).toFixed(3)} - ${parseFloat(result.EndTime).toFixed(3)}:  ${result.Alternatives[0].Transcript}`);
                        }
                    }
                }
            }
        } else {
            console.error('Received unknown frame.');
        }
    }
}

// Function that returns headers for audio events 
function getAudioEventMessage(buffer) {
    var audioEventMessage = {
        headers: {
            ':message-type': {
                type: 'string',
                value: 'event'
            },
            ':event-type': {
                type: 'string',
                value: 'AudioEvent'
            }
        }
    };
    audioEventMessage.body = buffer;
    return audioEventMessage;
}
 
const mediaFile = process.argv[2];
const languageCode = process.argv[3];
const samplingRate = process.argv[4];
if (!mediaFile || !languageCode || !samplingRate) {
    showUsageAndQuit('ERROR:  please specify the name of the media file (assumed to be mono LPCM), language code(en-US, es-US, en-GB, fr-FR, fr-CA) and sampling rate in Hertz');
} else {
    doIt(mediaFile);
}