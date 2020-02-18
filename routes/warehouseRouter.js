var express = require('express');
var router = express.Router();
var database = require('../database');
var slotAddresses = ['1000', '2000', '1111', '2222'];
var operationStatuses = ['vacant', 'taken', 'processing'];
var secretAuth = '9e8a7s4y1s2t3o6r5e';

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
    if (!isTokenValid(req.token)) result.error.push("invalidToken");
    if (!isSlotValid(req.slot)) result.error.push('invaidSlot');
    if (!isItemNameValid(req.item.name)) result.error.push("invalidItemName");
    if (!isItemDescriptionValid(req.item.description)) result.error.push('invalidItemDescription');
    if (!isItemAddressValid(req.item.address)) result.error.push("invalidItemAddress");

    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (row) {
            req.body.id = row.id;
            req.body.time = Date.now();
            var vacantAddresses = await database.many("SELECT address FROM storageunits WHERE status='vacant'", req.body); // to be used further on: "AND owner_id=(SELECT id FROM users WHERE token = $(token))"
            req.body.item.address = vacantAddresses[Math.floor(Math.random() * vacantAddresses.length)].address;
            delete vacantAddresses;
            await database.none("INSERT INTO operations(address, destination, type, time_added) VALUES($(slot), $(item.address), 'import', $(time))", req.body);
            await database.none("UPDATE storageunits SET owner_id=$(id), name=$(item.name), time_filled=$(time), description=$(item.description), status='reserved' WHERE address=$(item.address)", req.body);
            result.data = {
                item: req.body.item,
                slot: req.body.slot
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

    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isItemAddressValid(req.item.address)) result.error.push('invalidItemAddress');
    if (!isTokenValid(req.token)) result.error.push('invalidToken');

    var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
    if (row) {
        req.body.id = row.id;
        row = await database.oneOrNone("SELECT address FROM storageunits WHERE address=$(item.address) AND owner_id=$(id)", req.body);
        if (!row) result.error.push("wrongAddress");
    } else {
        result.error.push("wrongOrExpiredToken");
    }

    if (result.error.length == 0) {
        req.body.time = Date.now();
        req.body.slot = slotAddresses[Math.floor(Math.random() * slotAddresses.length)];
        await database.none("INSERT INTO operations(address, destination, type, time_added) VALUES($(item.address), $(slot), 'export', $(time))", req.body);
        await database.none("UPDATE storageunits SET status='processing' WHERE address=$(item.address)", req.body);
        result = {
            slot: req.body.slot,
            address: req.body.address
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
            result.data = await database.manyOrNone("SELECT address, name, description, time_filled, status FROM storageunits WHERE owner_id = $(id)", req.body);
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    res.json(result);
})

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
                await database.none("UPDATE operations SET status='processing' WHERE id=$(operation.id)", req.body);
                break;
            case 'error':
                await database.none("UPDATE storageunits SET owner_id=NULL, name=NULL, time_filled=NULL, description=NULL, status='vacant' WHERE address=(SELECT destination FROM operations WHERE id=$(operation.id))", req.body);
                await database.none("DELETE FROM operations WHERE id=$(operation.id)", req.body);
                //report error to client
                break;
            case 'complete':
                await database.none("UPDATE storageunits SET status='taken' WHERE address=(SELECT destination FROM operations WHERE id=$(operation.id))", req.body);
                await database.none("DELETE FROM operations WHERE id=$(operation.id)", req.body);
                break;
        }
    }

    res.json(result);
})

module.exports = router;