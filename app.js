const peer = new Peer({ host: 'peer.xcodeclazz.com', port: 443, secure: true, path: '/' });
let connection;

peer.on('open', handleMessage);
peer.on('connection', (other) => {
    connection = other;
    connection.on('data', handleMessage);
    connection.on('open', () => {
        logMessage('connected to ' + key);
    });
});

peer.on('call', (call) => {
    console.log(call.peer);
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
        document.querySelector("#local-video").srcObject = stream;
        document.querySelector("#local-video").play();
        call.answer(stream);
        currentCall = call;
        call.on("stream", (remoteStream) => {
            // when we receive the remote stream, play it
            document.getElementById("remote-video").srcObject = remoteStream;
            document.getElementById("remote-video").play();
        });
    }).catch((error) => {
        console.log(error);
    });
});

let currentCall;
async function call() {
    const key = document.getElementById('key').value;
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    document.getElementById("local-video").srcObject = stream;
    document.getElementById("local-video").play();
    const call = peer.call(key, stream);
    call.on("stream", (stream) => {
        document.getElementById("remote-video").srcObject = stream;
        document.getElementById("remote-video").play();
    });
    call.on("data", (stream) => { document.querySelector("#remote-video").srcObject = stream; });
    call.on("error", (err) => { console.log(err); });
    call.on('close', () => { endCall() });
    currentCall = call;
}

function closeCall() {
    if (!currentCall) return;
    try {
        currentCall.close();
    } catch { }
    currentCall = undefined;
}

function connect() {
    const key = document.getElementById('key').value;
    connection = peer.connect(key);
    connection.on('data', handleMessage);
    connection.on('open', () => {
        logMessage('connected to ' + key);
    });
}

function sendMessage() {
    const message = document.getElementById('message').value;
    connection.send(message);
    logMessage('You: ' + message);
    document.getElementById('message').value = '';
}

function handleMessage(data) {
    logMessage('Peer: ' + data);
}

function logMessage(message) {
    const chatTextArea = document.getElementById('chat');
    chatTextArea.value += message + '\n';
}