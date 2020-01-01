var postgre = require('pg-promise')();
var connection = {
    host: 'localhost',
    port: 5432,
    database: 'main',
    user: 'nodeServer',
    password: '987412365node'
    //ssl: true
}
var database = postgre(connection);
module.exports = database;