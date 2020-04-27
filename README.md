## Amazon Transcribe Websocket Static

[Try it out](https://transcribe-websockets.go-aws.com/)

A static site demonstrating real-time audio transcription via Amazon Transcribe over a WebSocket.

This demo app uses browser microphone input and client-side JavaScript to demonstrate the real-time streaming audio transcription capability of [Amazon Transcribe](https://aws.amazon.com/transcribe/) using WebSockets.

Check out the [Amazon Transcribe WebSocket docs](https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html).

## Building and Deploying

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/amazon-transcribe-websocket-static)

Even though this is a static site consisting only of HTML, CSS, and client-side JavaScript, there is a build step required. Some of the modules used were originally made for server-side code and do not work natively in the browser.

We use [browserify](https://github.com/browserify/browserify) to enable browser support for the JavaScript modules we `require()`.

1. Clone the repo

2. Clone the SDK V3 repo outside this package folder: 
    ```
    cd ..
    git clone https://github.com/AllanFly120/aws-sdk-js-v3.git
    cd aws-sdk-js-v3
    git checkout ws-eventstream
    ```
    if you don't checkout SDK to directory above, you need to replace the client importing path in **step 8** to the correct one.
3. Bootstrap the workspace, make sure you have [yarn installed](https://classic.yarnpkg.com/en/docs/install/#mac-stable):
    ```
    yarn bootstrap
    ```
4. Build the SDK core packages, make sure you have lerna installed. If not, run `npm i -g lerna`
    ```
    lerna run pretest --scope '@aws-sdk/client-transcribe-streaming' --include-dependencies
    ```
5. Build Transcribe Streaming client:
    ```
    cd clients/client-transcribe-streaming
    yarn build
    ```
    Now the client is ready to be consumed.
6. To back to this repo:
    ```
    cd ../../../amazon-transcribe-websocket-static
    ```
7. run `npm install`

8. confirm the client importing path in `lib/main.js`. If you clone the SDK repo into other location, you need to update the import path to correct one:
    ```javascript
    const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("../../aws-sdk-js-v3/clients/client-transcribe-streaming"); // <--update this path
    ```
9. run `npm run build` to generate `dist/main.js`. Open `index.html` file from your browser.

If you'd like to make code change and automatically refresh the page, you can run:
```
npm run start
```

### Credits

This project is based on code written by Karan Grover from the Amazon Transcribe team, who did the hard work (audio encoding, event stream marshalling).

## License

This library is licensed under the Apache 2.0 License. 