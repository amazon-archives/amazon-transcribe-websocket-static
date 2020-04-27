const audioUtils        = require('./audioUtils');  // for encoding audio data as PCM
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("../../aws-sdk-js-v3/clients/client-transcribe-streaming");
const mic               = require('microphone-stream'); // collect microphone input as a stream of raw bytes

// our global variables for managing state
let languageCode;
let region;
let sampleRate;
let inputSampleRate;
let transcription = "";
let micStream;

// check to see if the browser allows mic access
if (!window.navigator.mediaDevices.getUserMedia) {
    // Use our helper method to show an error on the page
    showError('We support the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try your request again.');

    // maintain enabled/distabled state for the start and stop buttons
    toggleStartStop();
}

$('#start-button').click(function () {
    $('#error').hide(); // hide any existing errors
    toggleStartStop(true); // disable start and enable stop button

    // set the language and region from the dropdowns
    setLanguage();
    setRegion();

    // first we get the microphone input from the browser (as a promise)...
    window.navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        })
        // ...then we convert the mic stream to binary event stream messages when the promise resolves 
        .then(streamAudioToWebSocket) 
        .catch(function (error) {
            showError('There was an error streaming your audio to Amazon Transcribe. Please try again.');
            micStream.stop();
            console.error(error);
            toggleStartStop();
        });
});

let streamAudioToWebSocket = async function (userMediaStream) {
    //let's get the mic input from the browser, via the microphone-stream module
    micStream = new mic();

    micStream.on("format", function(data) {
        inputSampleRate = data.sampleRate;
        console.log('SAMPLE RATE: ', data.sampleRate);
    });

    micStream.setStream(userMediaStream);

    const transcribeInput = async function* () {
        for await(const chunk of micStream) {
            yield {AudioEvent: {AudioChunk: pcmEncodeChunk(chunk)}}
        }
    }

    const client = new TranscribeStreamingClient({
        credentials: {
            accessKeyId: $('#access_id').val(),
            secretAccessKey: $('#secret_key').val(),
            sessionToken: $('#session_token').val()
        },
        region
    });

    const res = await client.send(new StartStreamTranscriptionCommand({
        LanguageCode: languageCode,
        MediaSampleRateHertz: 44100,
        MediaEncoding: 'pcm',
        AudioStream: transcribeInput()
    }));

    for await(const event of res.TranscriptResultStream) {
        if(event.TranscriptEvent) {
            const message = event.TranscriptEvent;
            handleEventStreamMessage(message);
        }
    }
}

function setLanguage() {
    languageCode = $('#language').find(':selected').val();
    if (languageCode == "en-US" || languageCode == "es-US")
        sampleRate = 44100;
    else
        sampleRate = 8000;
}

function setRegion() {
    region = $('#region').find(':selected').val();
}

let handleEventStreamMessage = function (messageJson) {
    let results = messageJson.Transcript.Results;

    if (results.length > 0) {
        if (results[0].Alternatives.length > 0) {
            let transcript = results[0].Alternatives[0].Transcript;

            // fix encoding for accented characters
            transcript = decodeURIComponent(escape(transcript));

            // update the textarea with the latest result
            $('#transcript').val(transcription + transcript + "\n");

            // if this transcript segment is final, add it to the overall transcription
            if (!results[0].IsPartial) {
                //scroll the textarea down
                $('#transcript').scrollTop($('#transcript')[0].scrollHeight);

                transcription += transcript + "\n";
            }
        }
    }
}

let closeSocket = function () {
    micStream.stop();
}

$('#stop-button').click(function () {
    closeSocket();
    toggleStartStop();
});

$('#reset-button').click(function (){
    $('#transcript').val('');
    transcription = '';
});

function toggleStartStop(disableStart = false) {
    $('#start-button').prop('disabled', disableStart);
    $('#stop-button').attr("disabled", !disableStart);
}

function showError(message) {
    $('#error').html('<i class="fa fa-times-circle"></i> ' + message);
    $('#error').show();
}

function pcmEncodeChunk(audioChunk) {
    let raw = mic.toRaw(audioChunk);

    if (raw == null)
        return;

    // downsample and convert the raw audio bytes to PCM
    let pcmEncodedBuffer = audioUtils.pcmEncode(raw);

    return Buffer.from(pcmEncodedBuffer);
}