const express = require('express');
const wrtc = require('wrtc');
const app = express();

let senderStream;;

app.use(express.json());
app.use(express.static('./public'))

app.post('/broadcast', async (req, res) => {
    const { sdp } = req.body;
    const peer = new wrtc.RTCPeerConnection();
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new wrtc.RTCSessionDescription(sdp)
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    res.json({
        sdp: peer.localDescription
    })
});

app.post('/consumer', async (req, res) => {
    const { sdp } = req.body;
    const peer = new wrtc.RTCPeerConnection();
    const desc = new wrtc.RTCSessionDescription(sdp)
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(ans);
    res.json({
        sdp: peer.localDescription
    })
});

/**
 * 
 * @param {RTCTrackEvent} e 
 * @param {RTCPeerConnection} peer 
 */
function handleTrackEvent(e, peer) {
    console.log(e.streams[0])
    senderStream = e.streams[0];
}

app.listen(9000)
