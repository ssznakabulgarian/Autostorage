var postgre = require('pg-promise')();
var connection = {
    host: 'localhost',
    port: 5432,
    database: 'autostorage',
    user: 'autostorage',
    password: '987412365node'
    //ssl: true
}
var database = postgre(connection);
module.exports = database;