var express = require('express');
var router = express.Router();
var database = require('../database');
var slotAddresses = ['1111', '2222', '3333'];
var operationStatuses = ['started', 'error', 'complete'];
var secretAuth = '_9e8a7s4y1s2t3o6r5e_';

function isEmpty(value) {
    return value == '' || value == null || value == undefined;
}

function isItemAddressValid(address) {
    return !isEmpty(address);
}

function isItemNameValid(name) {
    return !isEmpty(name) && name.length <= 64;
}

function isItemDescriptionValid(description) {
    return !isEmpty(description) && description.length <= 256;
}

function isTokenValid(token) {
    return !isEmpty(token) && token.length == 64;
}

function isSlotValid(slot) {
    var check = false;
    slotAddresses.forEach(slotAddress => {
        if (slotAddress == slot) check = true;
    });
    return !isEmpty(slot) && check;
}

function isSlotAddressValid(address) {
    return !isEmpty(address);
}

async function isSlotAvailable(address) {
    if (isEmpty(address)) return false;
    var tmp = await database.oneOrNone("SELECT address FROM storageunits WHERE owner_id=0 AND status='vacant' AND address=$(address)", {
        address: address
    });
    if (tmp) return true;
    else return false;
}

function isOperationIdValid(id) {
    return !isEmpty(id);
}

function isOperationStatusValid(status) {
    var check = false;
    operationStatuses.forEach(e => {
        if (e == status) check = true;
    });
    return !isEmpty(status) && check;
}

function isRequestValid(req) {
    return !isEmpty(req);
}

router.get('/', function (req, res) {
    res.redirect('../');
})


router.post('/import', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isTokenValid(req.body.token)) result.error.push("invalidToken");
    //if (!isSlotValid(req.body.slot)) result.error.push('invaidSlot');
    if (!isItemNameValid(req.body.item.name)) result.error.push("invalidItemName");
    if (!isItemDescriptionValid(req.body.item.description)) result.error.push('invalidItemDescription');
    if (!isItemAddressValid(req.body.item.address)) result.error.push("invalidItemAddress");

    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (row) {
            req.body.id = row.id;
            //req.body.time = Date.now();
            var vacantAddresses = await database.manyOrNone("SELECT address FROM storageunits WHERE status='vacant' AND owner_id = $(id)", req.body);
            if (!vacantAddresses) result.error.push('wrongAddress');
            else {
                vacantAddresses.forEach(async (element)=> {
                    if (element.address == req.body.item.address) {
                        req.body.code = Math.floor(Math.random() * 899999 + 100000);
                        await database.none("INSERT INTO operations(destination, type, status, time_added, code) VALUES($(item.address), 'import', 'waiting', $(time), $(code))", req.body);
                        await database.none("UPDATE storageunits SET name=$(item.name), description=$(item.description), status='processing', operation_code=($code) WHERE address=$(item.address)", req.body);
                        //  await database.none("UPDATE storageunits SET status='procesing' WHERE address=$(slot)", req.body);
                        result.data = {
                            item: req.body.item,
                            slot: req.body.slot,
                            code: req.body.code
                        }
                    }
                });
                if(!result.data) result.error.push('wrongAddress');
            }
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    res.json(result);
})

router.post('/export', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (!isRequestValid(req.body)) result.error.push("invalidRequest");
    if (!isItemAddressValid(req.body.itemAddress)) result.error.push('invalidItemAddress');
    if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
    // if (!isSlotAddressValid(req.body.slot)) result.error.push('invalidSlotAddress');
    // if (!isSlotAvailable(req.body.slot)) result.error.push('unavailableSlot');

    var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
    if (row) {
        req.body.id = row.id;
        row = await database.oneOrNone("SELECT address FROM storageunits WHERE address=$(itemAddress) AND owner_id=$(id)", req.body);
        if (!row) result.error.push("wrongAddress");
    } else {
        result.error.push("wrongOrExpiredToken");
    }

    if (result.error.length == 0) {
        req.body.time = Date.now();
        //req.body.slot = slotAddresses[Math.floor(Math.random() * slotAddresses.length)];
        req.body.code = Math.floor(Math.random() * 899999 + 100000);
        await database.none("INSERT INTO operations(address, type, status, time_added, code) VALUES($(itemAddress), 'export', 'waiting', $(time), $(code))", req.body);
        await database.none("UPDATE storageunits SET status='processing', operation_code=$(code) WHERE address=$(itemAddress)", req.body);
        // await database.none("UPDATE storageunits SET status='processing' WHERE address=$(slot)", req.body);
        result.data = {
            slot: req.body.slot,
            code: req.body.code
        };
    }
    res.json(result);
})

router.post('/list', async function (req, res) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isTokenValid(req.body.token)) result.error.push("invalidToken");
    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (row) {
            req.body.id = row.id;
            result.data = await database.manyOrNone("SELECT address, name, description, time_purchased, status, operation_code FROM storageunits WHERE owner_id = $(id)", req.body);
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    res.json(result);
});

router.post('/list_available_slots', async function (req, res) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (result.error.length == 0) {
        var row = await database.manyOrNone("SELECT address, name FROM storageunits WHERE owner_id=0 AND status='vacant'", req.body);
        result.data = row;
    }
    res.json(result);
});

router.post('/list_waiting_operations', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (isEmpty(req.body.secret) || (!isEmpty(req.body.secret) && req.body.secret != secretAuth)) result.error.push("accessDenied");
    if (!isRequestValid(req)) result.error.push("invalidRequest");

    if (result.error.length == 0) {
        var row = await database.manyOrNone("SELECT * FROM operations WHERE status='waiting'", req.body);
        result.data = row;
    }
    res.json(result);
});

router.post('/operation_event', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (isEmpty(req.body.secret) || (!isEmpty(req.body.secret) && req.body.secret != secretAuth)) result.error.push("accessDenied");
    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isOperationIdValid(req.body.operation.id)) result.error.push("invalidOperationId");
    if (!isOperationStatusValid(req.body.operation.status)) result.error.push("invalidOperationStatus");
    if (result.error.length == 0) {
        switch (req.body.operation.status) {
            case 'started':
                await database.none("UPDATE operations SET status='started' WHERE id=$(operation.id)", req.body);
                break;
            case 'error':
                await database.none("UPDATE storageunits SET owner_id=NULL, name=NULL, description=NULL, status='vacant' WHERE address=(SELECT destination FROM operations WHERE id=$(operation.id))", req.body);
                await database.none("UPDATE operations SET status='error' WHERE id=$(operation.id)", req.body);
                //report error to client
                break;
            case 'complete':
                if (req.body.operation.type == 'import') {
                    await database.none("UPDATE storageunits SET status='taken', operation_code=NULL WHERE address=(SELECT destination FROM operations WHERE id=$(operation.id))", req.body);
                } else if (req.body.operation.type == 'export') {
                    await database.none("UPDATE storageunits SET status='vacant', operation_code=NULL WHERE address=(SELECT address FROM operations WHERE id=$(operation.id))", req.body);
                }
                await database.none("UPDATE operations SET status='complete' WHERE id=$(operation.id)", req.body);
                console.log(req.body.operation.id);
                
                break;
        }
    }

    res.json(result);
})

module.exports = router;