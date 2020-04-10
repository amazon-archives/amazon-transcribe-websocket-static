export function pcmEncode(input) {
    var offset = 0;
    var buffer = new ArrayBuffer(input.length * 2);
    var view = new DataView(buffer);
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}

export function downsampleBuffer(buffer, inputSampleRate = 44100, outputSampleRate = 16000) {
        
    if (outputSampleRate === inputSampleRate) {
        return buffer;
    }

    var sampleRateRatio = inputSampleRate / outputSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    
    while (offsetResult < result.length) {

        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);

        var accum = 0,
        count = 0;
        
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++ ) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;

    }

    return result;

}