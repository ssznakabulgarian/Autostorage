var readline = require('readline');
var SerialPort = require('serialport');
var Worker = require('worker_threads').Worker;
var request = require('./nodeRequestCreator.js');

var connectionResponseString = "c",
    connectionString = "c",
    currentConnection = null,
    onSerialPortData = function () {},
    awaitingCommand = false,
    mainServerAddress = 'https://autostorage.online',
    connectionSecret = '',
    operationsList = [],
    isOperationRunning = false,
    manualMode,
    lastCode,
    awaitingCode;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var QRreadWorker = new Worker("./QRdecoderWorker.js");
QRreadWorker.on('error', printMessage);
QRreadWorker.on('exit', printMessage);
QRreadWorker.on('message', (message) => {
    if (!awaitingCode || message == lastCode) return;
    lastCode=message;
    setTimeout(() => {
        lastCode=null;
    }, 5000);
    //process.stdout.write(message + '\n');
    if (isNaN(message)) {
        printMessage('invalid input');
        startOperationDialogue();
    } else {
        rl.write(message+'\n');
        //rl.cursor=message.length;
        //rl.emit("line");
        // handleReceivedCode(message)
        //     .then(() => {
        //         console.log(message);
        //         startOperationDialogue();
        //     })
        //     .catch(error => {
        //         if (error == 'invalidCode') printMessage('no matching code found');
        //         else printMessage('an error occured: ' + error);
        //         startOperationDialogue();
        //     });
    }
});

function printMessage(message) {
    if (awaitingCommand) {
        console.log("");
    }
    console.log(message);
    //process.stdout.write('> ');
}

async function loadOperations() {
    return new Promise((resolve, reject) => {
        request(mainServerAddress + '/warehouse/list_waiting_operations', {
            secret: connectionSecret
        }, (error, result, body) => {
            if (error || body.error.length) reject((error) ? error : body.error);
            else resolve(body.data);
        });
    });
}

async function updateOperations() {
    try {
        operationsList = await loadOperations();
    } catch (err) {
        printMessage('server unreachable ...');
        printMessage(err);
    }
}

async function connectArduino() {
    var portsList = await SerialPort.list();
    for (var i = 0; i < portsList.length; i++) {
        var result = await new Promise((resolve, reject) => {
                printMessage("opening port");
                var connection = new SerialPort(portsList[i].path, {
                    baudRate: 9600
                });
                var finished = false;

                function finish(success) {
                    if (finished) return;
                    finished = true;
                    if (success) {
                        resolve(connection);
                        printMessage("connection established on port: " + connection.path);
                    } else {
                        connection.close((err) => {
                            printMessage("closed port " + connection.path);
                            if (err) printMessage(err);
                            reject();
                        });
                    }
                }
                connection.on('error', (err) => {
                    printMessage(err);
                    finish(false);
                });
                onSerialPortData = (data) => {
                    //console.log(data);
                    var buffer;
                    if (typeof (data) == "string") {
                        buffer = Buffer.from(data);
                        if (buffer[buffer.length - 1] == 13 || buffer[buffer.length - 1] == 10) data = data.substring(0, data.length - 1);
                    } else {
                        buffer = data;
                        data = data.toString();
                    }
                    if (data == connectionResponseString) finish(true);
                }
                connection.on('data', function (data) {
                    onSerialPortData(data);
                });
                connection.on('open', () => {
                    printMessage('opened port ' + connection.path);
                    setTimeout(() => {
                        if (finished) return;
                        connection.write(connectionString, function (err) {
                            setTimeout(() => {
                                finish(false);
                            }, 1000);
                            if (err) {
                                printMessage(err);
                                finish(false);
                            };
                        });
                    }, 1500);

                });
            })
            .catch(() => {
                printMessage('trying next port...');
            });
        if (result) {
            currentConnection = result;
            arduinoMain();
            return;
        }
    }
    printMessage('all ports checked\nno connection established');
    (function retryPrompt() {
        rl.question("would you like to try again (yes/no) [yes] ", (input) => {
            if (input == '' || input == 'yes') connectArduino();
            else if (input == 'no') startup();
            else {
                printMessage('error: invalid input');
                retryPrompt();
            }
        });
    })();
}

async function sendToMachine(command) {
    return new Promise((resolve, reject) => {
        if (manualMode) {
            function prompt() {
                printMessage(command);
                rl.question("> ", (input) => {
                    if (input == 'r') resolve();
                    else if (input == 'e') reject('opearationFailed');
                    else {
                        printMessage("invalid input");
                        prompt();
                    }
                });
            };
            prompt();
        } else {
            onSerialPortData = (data) => {
                if (typeof (data) != "string") data = data.toString();
                var buffer = Buffer.from(data);
                for (let i = 0; i < buffer.length; i++) {
                    let chr = buffer[i];
                    if (chr <= 32) continue;
                    if (chr == 'r'.charCodeAt(0)) {
                        resolve();
                        break;
                    }
                    if (chr == 'e'.charCodeAt(0)) {
                        reject('opearationFailed');
                        break;
                    }
                }
            };
            currentConnection.write(command);
        }
    });
}

async function executeOperation(operation) {
    return new Promise((resolve, reject) => {
        isOperationRunning = true;
        printMessage('starting ' + operation.type + ' operation from ' + operation.address + ' to ' + operation.destination);
        request(mainServerAddress + '/warehouse/operation_event', {
            secret: connectionSecret,
            operation: {
                id: operation.id,
                status: 'started',
                type: operation.type
            }
        }, (error, result, body) => {
            if (error || body.error.length) reject((error) ? error : body.error);
        });
        sendToMachine('m ' + Math.floor(operation.address / 1000) + ' ' + operation.address % 100 + ' ' + Math.floor(operation.destination / 1000) + ' ' + operation.destination % 100)
            .then(() => {
                printMessage('operation complete');
                request(mainServerAddress + '/warehouse/operation_event', {
                    secret: connectionSecret,
                    operation: {
                        id: operation.id,
                        status: 'complete',
                        type: operation.type
                    }
                }, (error, result, body) => {
                    if (error || body.error.length) reject((error) ? error : body.error);
                    else resolve();
                });
            })
            .catch((err) => {
                request(mainServerAddress + '/warehouse/operation_event', {
                    secret: connectionSecret,
                    operation: {
                        id: operation.id,
                        status: 'error',
                        type: operation.type
                    }
                }, (error, result, body) => {
                    if (error || body.error.length) reject(err + (error) ? error : body.error);
                    else reject(err);
                });
            });
    });
}

function handleReceivedCode(code) {
    return new Promise((resolve, reject) => {
        awaitingCode = false;
        var check = false;
        operationsList.forEach(async element => {
            if (element.code == code) {
                check = true;
                executeOperation(element)
                    .then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
        if (!check) {
            reject('invalidCode');
        }
    });
}

function startOperationDialogue() {
    awaitingCode = true;
    rl.question('scan QR code or enter code: ', (input) => {
        if (isNaN(input)) {
            printMessage('invalid input');
            startOperationDialogue();
        } else {
            handleReceivedCode(input)
                .then(() => {
                    startOperationDialogue();
                })
                .catch(error => {
                    if (error == 'invalidCode') printMessage('no matching code found');
                    else printMessage('an error occured: ' + error);
                    startOperationDialogue();
                });
        }
    });
}

function arduinoMain() {
    manualMode = false;
    new Promise((resolve, reject) => {
            onSerialPortData = (data) => {
                printMessage('recieved data:\n' + data);
                var buffer = Buffer.from(data);
                for (let i = 0; i < buffer.length; i++) {
                    let chr = buffer[i];
                    if (chr <= 32) continue;
                    if (chr == 'r'.charCodeAt(0)) {
                        resolve();
                        break;
                    }
                    if (chr == 'e'.charCodeAt(0)) {
                        reject('opearationFailed');
                        break;
                    }
                }
            };
            currentConnection.write('r');
        })
        .then(() => {
            startOperationDialogue();
        })
        .catch(printMessage);
}

async function manual() {
    manualMode = true;
    startOperationDialogue();
}

(function startup() {
    rl.question('server address: [' + mainServerAddress + '] ', (address) => {
        if (address != '') mainServerAddress = address;
        rl.question('mode (manual/auto): [auto] ', (input) => {
            setInterval(updateOperations, 1000);
            if (input == 'manual') manual();
            else if (input == 'auto' || input == '') connectArduino();
            else {
                printMessage('error: invalid input');
                startup();
            }
        });
    });
})();
