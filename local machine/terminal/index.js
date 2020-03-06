var readline = require('readline');
var SerialPort = require('serialport');
var request = require('./nodeRequestCreator');

var connectionResponseString = "c",
    connectionString = "c",
    onData = null,
    awaitingCommand = false,
    processCommand = null,
    mainServerAddress = 'http://localhost:3000',
    connectionSecret = '_9e8a7s4y1s2t3o6r5e_',
    operationsList = [],
    isOperationRunning = false,
    manualMode = true;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getArduinoConnection() {
    var portsList = await SerialPort.list();
    for (var i = 0; i < portsList.length; i++) {
        var result = await new Promise((resolve, reject) => {
            try {
                console.log("opening port");
                var connection = new SerialPort(portsList[i].path, {
                    baudRate: 9600
                });
                var finished = false;

                function finish(success) {
                    if (finished) return;
                    finished = true;
                    if (success) resolve(connection);
                    else {
                        connection.close((err) => {
                            console.log("closed port " + connection.path);
                            console.log(err);
                        });
                        resolve(null);
                    }
                }
                connection.on('error', function (err) {
                    console.log("error: " + err);
                    console.log('on port ' + connection.path);
                    finish(false);
                });
                onData = (data) => {
                    var buffer = Buffer.from(data);
                    if (buffer[buffer.length - 1] == 13 || buffer[buffer.length - 1] == 10) data = data.substring(0, data.length - 1);
                    if (data == connectionResponseString) finish(true);
                }
                connection.on('data', (data) => {
                    onData(data);
                });
                connection.on('open', () => {
                    console.log('opened port ' + connection.path);
                    setTimeout(() => {
                        if (finished) return;
                        connection.write(connectionString, function (err) {
                            if (err) {
                                console.log('error: ' + err);
                                console.log('on port ' + connection.path);
                                finished(false);
                            }
                        });
                    }, 1500);
                    setTimeout(() => {
                        finish(false);
                    }, 3000);
                });
            } catch (e) {
                console.log("error: ");
                console.log(e);
            }
        });
        if (result) return result;
    };
}

async function connectArduino() {
    var connection = await getArduinoConnection();
    if (connection) {
        main(connection);
    } else {
        console.log('retrying connection...');
        setTimeout(()=>{connectArduino();}, 2000);
    }
}

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
            if (error) {
                printMessage(error);
                reject(error);
            } else if (body.error.length) {
                printMessage(body.error);
                reject(body.error);
            } else {
                resolve(body.data);
            }
        });
    });
}

processCommand = (command) => {
    printMessage("Processing " + command);
}

function getCommand() {
    awaitingCommand = true;
    rl.question('> ', (command) => {
        processCommand(command);
        awaitingCommand = false;
    });
}

async function sendToMachine(command, connection) {
    return new Promise((resolve, reject) => {
        if (manualMode) {
            printMessage(command);
            rl.question('> ', (input) => {
                if (input == 'r') resolve();
                else if (input == 'e') reject('opearationFailed');
            });
        } else {
            onData = (data) => {
                var buffer = Buffer.from(data);
                for(let i = 0; i < buffer.length; i++) {
                    let chr = buffer[i];
                    if(chr <= 32) continue;
                    if(chr == 'r'.charCodeAt(0)) {
                        resolve();
                        break;
                    }
                    if(chr == 'e'.charCodeAt(0)) {
                        reject('opearationFailed');
                        break;
                    }
                }
            };
            connection.write(command);
        }
    });
}

async function handleOperation(operation, connection) {
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
            if (error) {
                printMessage(error);
            } else if (body.error.length) {
                printMessage(body.error);
            }
        });
        sendToMachine('m ' + Math.floor(operation.address/1000) +' ' + operation.address%100+ ' ' + Math.floor(operation.destination/1000)+ ' ' +operation.destination%100, connection)
            .then(() => {
                printMessage('operation complete');
                //console.log(operation);
                
                request(mainServerAddress + '/warehouse/operation_event', {
                    secret: connectionSecret,
                    operation: {
                        id: operation.id,
                        status: 'complete',
                        type: operation.type
                    }
                }, (error, result, body) => {
                    if (error) {
                        printMessage(error);
                    } else if (body.error.length) {
                        printMessage(body.error);
                    }
                });
                resolve();
            })
            .catch((err) => {
                printMessage('error: ' + err);
                request(mainServerAddress + '/warehouse/operation_event', {
                    secret: connectionSecret,
                    operation: {
                        id: operation.id,
                        status: 'error',
                        type: operation.type
                    }
                }, (error, result, body) => {
                    if (error) {
                        printMessage(error);
                    } else if (body.error.length) {
                        printMessage(body.error);
                    }
                });
                reject();
            });
    });
}

function startOperation(connection) {
    var check = false;
    rl.question('enter code: ', (code) => {
        operationsList.forEach(element => {
            if (element.code == code) {
                check = true;
                handleOperation(element, connection)
                    .then(() => {
                        startOperation(connection);
                    }).catch(() => {
                        startOperation(connection);
                    });
            }
        });
        if (!check) {
            printMessage('error: invalid code');
            startOperation(connection);
        }
    });
}

function main(connection) {
    console.log("connection established on port: " + connection.path);

    new Promise((resolve, reject)=>{
        onData = (data) => {
            printMessage('recieved data:\n' + data);
            onData = (data) => {
                var buffer = Buffer.from(data);
                for(let i = 0; i < buffer.length; i++) {
                    let chr = buffer[i];
                    if(chr <= 32) continue;
                    if(chr == 'r'.charCodeAt(0)) {
                        resolve();
                        break;
                    }
                    if(chr == 'e'.charCodeAt(0)) {
                        reject('opearationFailed');
                        break;
                    }
                }
            };
        };
        connection.write('r');
    })
    .then(()=>{
        setInterval(async () => {
            operationsList = await loadOperations();
        }, 1000);
        
        startOperation(connection);
    });
}

async function manual() {
    setInterval(async () => {
        operationsList = await loadOperations();
    }, 1000);
    startOperation();
}

if(manualMode) manual();
else connectArduino();