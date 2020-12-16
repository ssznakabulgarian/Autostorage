var express = require('express');
var router = express.Router();
var database = require('../database');
var operationStatuses = ['started', 'error', 'complete', 'canceled'];
var secretAuth = '';
var storageUnitPrice = 2.4916,
    vatRate = 20,
    importOperationPrice = 4.1583,
    exportOperationPrice = 4.1583;

function isEmpty(value) {
    return value == '' || value == null || value == undefined;
}

function isAddressValid(address) {
    return !isEmpty(address) && !isNaN(address);
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

async function isOperationCodeValid(code) {
    return new Promise((resolve, reject) => {
        database.manyOrNone("SELECT code FROM operations WHERE code=$(code) AND (status='started' OR status='waiting')", {
                code: code
            })
            .then((result) => {
                resolve(!isEmpty(code) && !isNaN(code) && result.length == 0);
            })
            .catch((err) => {
                reject(err);
            });
    });
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
    if (!isItemNameValid(req.body.item.name)) result.error.push("invalidItemName");
    if (!isItemDescriptionValid(req.body.item.description)) result.error.push('invalidItemDescription');
    if (!isAddressValid(req.body.item.address)) result.error.push("invalidItemAddress");
    if (!await isOperationCodeValid(req.body.code)) result.error.push('invalidOperationCode');
    
    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (row) {
            req.body.id = row.id;
            row = await database.oneOrNone("SELECT address FROM storageunits WHERE status='vacant' AND address=$(item.address) AND owner_id=$(id)", req.body);
            if (!row) result.error.push("wrongAddress");
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    
    if (result.error.length == 0) {
        req.body.time = Date.now();
        await database.none("INSERT INTO operations(destination, type, status, time_added, code, item_name, owner_id) VALUES($(item.address), 'import', 'waiting', $(time), $(code), $(item.name), $(id))", req.body);
        await database.none("UPDATE storageunits SET name=$(item.name), description=$(item.description), status='processing', operation_code=$(code) WHERE address=$(item.address)", req.body);
        result.data = {
            item: req.body.item,
            slot: req.body.slot,
            code: req.body.code
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
    if (!isAddressValid(req.body.item.address)) result.error.push('invalidItemAddress');
    if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
    if (!await isOperationCodeValid(req.body.code)) result.error.push('invalidOperationCode');
    
    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (row) {
            req.body.id = row.id;
            row = await database.oneOrNone("SELECT address FROM storageunits WHERE status='occupied' AND address=$(item.address) AND owner_id=$(id)", req.body);
            if (!row) result.error.push("wrongAddress");
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }

    if (result.error.length == 0) {
        req.body.time = Date.now();
        //req.body.code = Math.floor(Math.random() * 899999 + 100000);
        await database.none("INSERT INTO operations(address, type, status, time_added, code, item_name, owner_id) VALUES($(item.address), 'export', 'waiting', $(time), $(code), (SELECT name FROM storageunits WHERE address=$(item.address)), $(id))", req.body);
        await database.none("UPDATE storageunits SET status='processing', operation_code=$(code) WHERE address=$(item.address)", req.body);
        result.data = {
            slot: req.body.slot,
            code: req.body.code
        };
    }
    res.json(result);
})

router.post('/list_storage_units', async function (req, res) {
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
            result.data = await database.manyOrNone("SELECT address, name, description, time_purchased, status, operation_code FROM storageunits WHERE owner_id = $(id) ORDER BY address ASC", req.body);
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    res.json(result);
});

router.post('/list_liabilities', async function (req, res) {
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
            result.data = await database.manyOrNone("SELECT type, item_name, value, state, date FROM liabilities WHERE user_id = $(id) ORDER BY date", req.body);
        } else {
            result.error.push("wrongOrExpiredToken");
        }
    }
    res.json(result);
});

router.post('/list_operations', async function (req, res) {
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
            result.data = await database.manyOrNone("SELECT type, item_name, status, time_added FROM operations WHERE owner_id=$(id) ORDER BY time_added ASC", req.body);
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
        var row = await database.manyOrNone("SELECT * FROM operations WHERE status='waiting' OR status='started'", req.body);
        result.data = row;
    }
    res.json(result);
});

router.post('/cancel_operation', async function (req, res) {
    var result = {
        error: [],
        data: null
    };

    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
    if (!isAddressValid(req.body.address)) result.error.push('invalidAddress');

    if (result.error.length == 0) {
        var id = await database.oneOrNone("SELECT id FROM users WHERE token=$(token)", req.body);
        if (!id) result.error.push("wrongOrExpiredToken");
        else {
            req.body.id = id.id;
            var row = await database.oneOrNone("SELECT * FROM operations WHERE owner_id=$(id) AND (status='waiting' OR status='started') AND (address=$(address) OR destination=$(address))", req.body);
            if (!row) result.error.push('wrongAddress');
            else {
                await database.none("UPDATE operations SET status='canceled' WHERE (status='waiting' OR status='started') AND (address=$(address) OR destination=$(address))", req.body);
                if (row.address) await database.none("UPDATE storageunits SET status='occupied', operation_code=NULL WHERE address=$(address)", req.body);
                else await database.none("UPDATE storageunits SET status='vacant', name='storage unit', description='this is a description', operation_code=NULL WHERE address=$(address)", req.body);
                delete row.id;
                delete row.owner_id;
                result.data = row;
            }
        }
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
                req.body.price = Math.floor((req.body.operation.type == 'export' ? exportOperationPrice : importOperationPrice) * (100 + vatRate)) / 100;
                req.body.time = Date.now();

                await database.none("INSERT INTO liabilities(user_id, type, value, state, date, item_name) VALUES((SELECT owner_id FROM storageunits WHERE operation_code = (SELECT code FROM operations WHERE id=$(operation.id))), $(operation.type), $(price), 'not_paid', $(time), (SELECT name FROM storageunits WHERE operation_code = (SELECT code FROM operations WHERE id=$(operation.id))))", req.body);
                if (req.body.operation.type == 'import') {
                    await database.none("UPDATE storageunits SET status='occupied', operation_code=NULL WHERE address=(SELECT destination FROM operations WHERE id=$(operation.id))", req.body);
                } else if (req.body.operation.type == 'export') {
                    await database.none("UPDATE storageunits SET status='vacant', name='storage unit', description='this is an empty storage unit', operation_code=NULL WHERE address=(SELECT address FROM operations WHERE id=$(operation.id))", req.body);
                }
                await database.none("UPDATE operations SET status='complete' WHERE id=$(operation.id)", req.body);
                break;
        }
    }

    res.json(result);
});

router.post('/release', async function (req, res) {
    var result = {
        error: [],
        data: null
    };
    if (!isRequestValid(req)) result.error.push("invalidRequest");
    if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
    if (!isAddressValid(req.body.address)) result.error.push('invalidAddress');
    if (result.error.length == 0) {
        var row = await database.oneOrNone("SELECT id FROM users WHERE token = $(token)", req.body);
        if (!row) result.error.push("wrongOrExpiredToken");
        else {
            req.body.id = row.id;
            var vacantAddresses = await database.oneOrNone("SELECT address FROM storageunits WHERE status='vacant' AND owner_id = $(id) AND address=$(address)", req.body);
            if (!vacantAddresses) result.error.push('wrongAddress');
            else {
                var timeStamp = await database.one("SELECT time_purchased FROM storageunits WHERE address=$(address)", req.body);
                timeStamp = parseInt(timeStamp.time_purchased);
                var now = Date.now();
                req.body.price = Math.round((now - timeStamp) / (1000 * 60 * 60) * storageUnitPrice * (100 + vatRate) / 100);

                req.body.time = now;
                await database.none("UPDATE storageunits SET owner_id=-1, name='storage unit', description='this is a description', time_purchased=0, operation_code=NULL WHERE address=$(address)", req.body);
                await database.none("INSERT INTO liabilities(user_id, type, value, state, date) VALUES($(id), 'released storage unit', $(price), 'not_paid', $(time))", req.body);
                result.data = {
                    address: req.body.address,
                    price: req.body.price
                }
            }
        }
    }
    res.json(result);
});

module.exports = router;
