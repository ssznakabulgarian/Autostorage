var parentPort = require('worker_threads').parentPort;
var cameraCapture = require('camera-capture');
var decoder = require('./decoder.js');

var running = true;
var camera = new cameraCapture.VideoCapture({
  mime: 'rgba'
})

parentPort.on('close', (e)=>{
	running = false;
	camera = null;
});

function onDecoderMessage(data) {
	if (data.length > 0) {
	  var qrid = data[0][2];
	  parentPort.postMessage(qrid);
	}
	if (running) setTimeout(decodeFrame, 0);
}		  

function decodeFrame() {
	camera.readFrame().then(
		(f) => {
			onDecoderMessage(decoder.process(f));
		},
		(e) => {
			parentPort.emit('error', ['decoder error: ' + e]);
			parentPort.close();
		});
}

async function init() {
	await camera.initialize();
	decodeFrame();
}

init();

//keep alive
(function wait () {
   setTimeout(wait, 100);
})();