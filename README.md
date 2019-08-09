## Amazon Transcribe Websocket Static

[Try it out](https://transcribe-websockets.go-aws.com/)

A static site demonstrating real-time audio transcription via Amazon Transcribe over a WebSocket.

This demo app uses browser microphone input and client-side JavaScript to demonstrate the real-time streaming audio transcription capability of [Amazon Transcribe](https://aws.amazon.com/transcribe/) using WebSockets.

Check out the [Amazon Transcribe WebSocket docs](https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html).

### Building and Deploying

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/amazon-transcribe-websocket-static)

Even though this is a static site consisting only of HTML, CSS, and client-side JavaScript, there is a build step required. Some of the modules used were originally made for server-side code and do not work natively in the browser.

We use [browserify](https://github.com/browserify/browserify) to enable browser support for the JavaScript modules we `require()`.

1. Clone the repo
2. run `npm install`
3. run `npm run-script build` to generate `dist/main.js`.

Once you've bundled the JavaScript, all you need is a webserver. For example, from your project directory: 

```
npm install --global local-web-server
ws
```

## Amazon Transcribe WebSocket nodejs CLI file streaming

This is a demo nodejs command line script that takes mono lpcm media file, streams it to [Amazon Transcribe](https://aws.amazon.com/transcribe/) using WebSocket and print the transcript received on console.

### Building and trying

You can try using this command line utility tool on your system. Follow the instructions below

1. Clone the repo
2. Run `npm install`
3. Export AWS Credentials and AWS Region as evironment variables
```
export AWS_ACCESS_KEY_ID="<YOUR ACCESS KEY ID>" &&
export AWS_SECRET_ACCESS_KEY="<YOUR SECRET ACCESS KEY ID>" &&
export AWS_SESSION_TOKEN="<SESSION TOKEN IF YOU ARE USING SESSION BASED TEMPORARY CREDENTIALS>" &&
export AWS_REGION="us-west-2"
```
4. Call command line function, usage as follows
```
node index.js path/to/pcm/media/file languageCode samplingRate 
```

Some examples
* If you have a pcm media file, directly call `node index.js path/to/pcm/media/file languageCode samplingRate`
* If you have an mp4 video file, downsample and mux it to mono and pipe the output to the tool `ffmpeg -i path/to/mp4/media/file -vcodec none -f wav -ar 8000 -ac 1 - | node index.js - languageCode 8000`

## Credits

This project is based on code written by Karan Grover from the Amazon Transcribe team, who did the hard work (audio encoding, event stream marshalling).

## License

This library is licensed under the Apache 2.0 License. 