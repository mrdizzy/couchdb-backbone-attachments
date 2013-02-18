var express = require('express'),
    http = require('http'),
    path = require('path'),
    database = require('./config/database').test_import;

var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.put('/products/attachments/:id', function(req, res) {
    console.log("Going on")
   
        console.log(req.params)
    req.on("data", function(chunk) {
        console.log(chunk.toString())
    })
    /*  database.save("bopopo", {
        name: "deedee",
        "_attachments": {
            "thumb.png": {

                "content_type": "image/png",
                "data": result
            }
        }},
        function(error, doc) {
console.log(error, doc)
        });
*/
})


// db.saveAttachment({ _id: req.params.product, _rev: req.body.rev}, 
//db.save(id, {
//    _attachments: collated,
//    type: "product"
//}, function(err, doc) {
//    console.log(err, doc)
//})

http.createServer(app).listen(process.env.PORT);