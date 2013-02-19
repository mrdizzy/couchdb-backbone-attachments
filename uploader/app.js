var express = require('express'),
    http = require('http'),
    path = require('path'),
    database = require('./config/database').test_import;

var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser()),
    //app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.put('/products/:id', function(req, res) {
    console.log(req.body)
database.save(req.body,
        function(error, doc) {
console.log(error, doc)
        });
    /*console.log(req.params.rev)
    req.pipe(
    database.saveAttachment({
        id: req.params.product_id,
        rev: "",
    }, {
        name: req.params.id,
        contentType: req.headers["content-type"]
    }, function(error, doc) {
        console.log(error, doc)
        res.json({
            id: req.params.id,
            rev: doc.rev,
            content_type: req.headers["content-type"]
        })
    }))
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

http.createServer(app).listen(process.env.PORT);