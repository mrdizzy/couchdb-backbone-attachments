var cradle = require('cradle'),
    connection = new(cradle.Connection)('https://casamiento.iriscouch.com', 443, {
        auth: {
            username: "casamiento",
            password: "floppsy1"
        },
        cache: false
    }),
    databases = {}

databases.test_import = connection.database("test_import");
module.exports = databases;