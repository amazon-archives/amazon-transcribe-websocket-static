## Amazon Transcribe Websocket Static

[Try it out](https://transcribe-websockets.go-aws.com/)

A static site demonstrating real-time audio transcription via Amazon Transcribe over a WebSocket.

This demo app uses browser microphone input and client-side JavaScript to demonstrate the real-time streaming audio transcription capability of [Amazon Transcribe](https://aws.amazon.com/transcribe/) using WebSockets.

Check out the [Amazon Transcribe WebSocket docs](https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html).

**Note**: This sample uses the [AWS SDK v3](https://github.com/aws/aws-sdk-js-v3) that is currently in preview. If you plan to use the AWS SDK v3 in your
project, please be aware of the possible breaking change. If you have feedbacks to JS SDK client, please [open an issue on the SDK repository](https://github.com/aws/aws-sdk-js-v3/issues/new/choose).

## Building and Deploying

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/aws-samples/amazon-transcribe-websocket-static)

Even though this is a static site consisting only of HTML, CSS, and client-side JavaScript, there is a build step required. Some of the modules used were originally made for server-side code and do not work natively in the browser.

1. Clone the repo

1. run `yarn`

1. run `yarn start`. This command will automatically load the sample app in your browser.

### Credits

This project is based on code written by Karan Grover from the Amazon Transcribe team, who did the hard work (audio encoding, event stream marshalling).

## License

This library is licensed under the Apache 2.0 License. 
