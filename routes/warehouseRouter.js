var express = require('express');
var router = express.Router();
var database = require('../database');

function isEmpty(value) {
    return value == '' || value == null || value == undefined;
}

function isRequestValid(req, actionType) {
    try {
        if (isEmpty(req.body)) return false;
        switch (actionType) {
            case 'import':
                return !isEmpty(req.body.token) && !isEmpty(req.body.slot) && !isEmpty(req.body.item) && !isEmpty(req.body.item.name) && !isEmpty(req.body.item.description);
            case 'export':
                return !isEmpty(req.body.token) && !isEmpty(req.body.item_address) && !isEmpty(req.body.slot);
            case 'list':
                return !isEmpty(req.body.token);
            case 'operation':
                return !isEmpty(req.body.operation.id) && !isEmpty(req.body.operation.status);
            default:
                return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

router.get('/', function (req, res) {
    res.redirect('../');
})


router.post('/import', async function (req, res, next) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req, 'import')) result.error.push("invalidRequest");
    if (result.error.length == 0) {
        req.body.time = Date.now();
        var vacantAddresses = await database.many("SELECT address FROM storageunits WHERE status='vacant'", req.body); // to be used further on: "AND owner_id=(SELECT id FROM users WHERE token = $(token))"
        req.body.item.address = vacantAddresses[Math.floor(Math.random() * vacantAddresses.length)].address;
        await database.none("INSERT INTO operations(address, destination, type, time_added) VALUES($(slot), $(item.address), 'import', $(time))", req.body);
        await database.none("UPDATE storageunits SET owner_id=(SELECT id FROM users WHERE token = $(token)), name=$(item.name), time_filled=$(time), description=$(description), status='reserved' WHERE address=$(item.address)", req.body);
        result.data = {
            item: req.body.item
        }
    }
    res.json(result);
    next();
})

router.post('/export', async function (req, res, next) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req, 'export')) result.error.push("invalidRequest");
    if (result.error.length == 0) {
        req.body.time = Date.now();
        await database.none("INSERT INTO operations(address, destination, type, time_added) VALUES($(item.address), $(slot), 'export', $(time))", req.body);
        await database.none("UPDATE storageunits SET status='reserved' WHERE address=$(item.address)", req.body);
    }
    res.json(result);
    next();
})

router.post('/list', async function (req, res) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req, 'list')) result.error.push("invalidRequest");
    if (result.error.length == 0) {
        var tmp = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        req.body.id=tmp.id;
        delete tmp;
        if(!req.body.id) result.error.push('wrongToken');
        else result.data = await database.manyOrNone("SELECT address, name, description, time_filled, status FROM storageunits WHERE owner_id = $(id)", req.body);
    }
    res.json(result);
})

router.post('/operation_event', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (!isRequestValid(req, 'operation')) result.error.push("invalidRequest");
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
            default:
                result.error.push("invalidOperationStatus");
                break;
        }
    }

    res.json(result);
})

module.exports = router;