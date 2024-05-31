export const   
        path = "/v1/stats/current/vhosts/default/apps/app/streams/stream", 
        requestInterval = 60000,
        envProd = true,
        streamers = {
            /* "streamerName":{
                "file": "webSocket stream url",
                "image": "streamer icon",
                "url": "https url to stream"+path
            } */
        };
export class VideoOption {
    autoStart = true;
    mute = true;
    volume = 80;
    webrtcConfig = {
        "timeoutMaxRetry": 5,
        "connectionTimeout": 5000,
        "playoutDelayHint": 0
    };
    waterMark = {
        "image": "",
        "position": "top-right",
        "y": "20px",
        "x": "20px",
        "width": "40px",
        "height": "40px",
        "opacity": 0.5
    };
    sources = [{
        "type": "webrtc",
        "file": ""
    }]
    constructor(streamer)
    {
        this.sources[0].file = streamer.file;
        this.waterMark.image = streamer.image;
    }
};
