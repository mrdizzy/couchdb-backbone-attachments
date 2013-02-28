var productJSON = {
    "_id": "eloquence-name_place",
    "_rev": "45-cdc938e06e1c43598730833e9334a8ff",
    "type": "product",
    "colours": ["MidnightBlue"],
    "attachments_order": ["large-3", "display-3", "medium-3"],
    "_attachments": {
        "large-3": {
            "content_type": "image/png",
            "revpos": 41,
            "digest": "md5-GL1fjZJ04GPEqPX9rQVgLg==",
            "length": 108675,
            "stub": true
        },
        "display-3": {
            "content_type": "image/png",
            "revpos": 40,
            "digest": "md5-9PpBHtjqHQprDoUjN76Ang==",
            "length": 34865,
            "stub": true
        },
        "medium-3": {
            "content_type": "image/png",
            "revpos": 39,
            "digest": "md5-wER52KdJVAWQ7Gu4wvnDPw==",
            "length": 68409,
            "stub": true
        }
    }
};

var typesJSON = {
 "_id": "eloquence-name_place",
    "_rev": "45-cdc938e06e1c43598730833e9334a8ff",
    "type": "product",
    "colours": ["MidnightBlue"],
    "attachments_order": [1, 5, 2],
    "_attachments": {
        "1-large": {
            "content_type": "image/png",
            "revpos": 41,
            "digest": "md5-GL1fjZJ04GPEqPX9rQVgLg==",
            "length": 108675,
            "stub": true
        },
        "1-small": {
            "content_type": "image/png",
            "revpos": 40,
            "digest": "md5-9PpBHtjqHQprDoUjN76Ang==",
            "length": 34865,
            "stub": true
        },
        "1-medium": {
            "content_type": "image/png",
            "revpos": 39,
            "digest": "md5-wER52KdJVAWQ7Gu4wvnDPw==",
            "length": 68409,
            "stub": true
        },
                "2-large": {
            "content_type": "image/png",
            "revpos": 41,
            "digest": "md5-GL1fjZJ04GPEqPX9rQVgLg==",
            "length": 108675,
            "stub": true
        },
        "2-small": {
            "content_type": "image/png",
            "revpos": 40,
            "digest": "md5-9PpBHtjqHQprDoUjN76Ang==",
            "length": 34865,
            "stub": true
        },
        "2-medium": {
            "content_type": "image/png",
            "revpos": 39,
            "digest": "md5-wER52KdJVAWQ7Gu4wvnDPw==",
            "length": 68409,
            "stub": true
        },
                "5-large": {
            "content_type": "image/png",
            "revpos": 41,
            "digest": "md5-GL1fjZJ04GPEqPX9rQVgLg==",
            "length": 108675,
            "stub": true
        },
        "5-small": {
            "content_type": "image/png",
            "revpos": 40,
            "digest": "md5-9PpBHtjqHQprDoUjN76Ang==",
            "length": 34865,
            "stub": true
        },
        "5-medium": {
            "content_type": "image/png",
            "revpos": 39,
            "digest": "md5-wER52KdJVAWQ7Gu4wvnDPw==",
            "length": 68409,
            "stub": true
        }
    }    
}

/*
 Call the onload method when you want to emulate a file upload
 fileReader.onload({
            target: {
                result: "base64,hereissomedata"
            }
        });
        */

var file = {
    name: "david.txt",
    type: "text/plain"
}

var file2 = {
    name: "emily.jpg",
    type: "image/jpeg"
}

describe("Preset attachments", function() {
    
    var product;
    beforeEach(function() {
        jasmine.Ajax.useMock();
        var Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products",
            attachment_types: ["large", "medium", "small"]
        });
         product = new Product(typesJSON, {
            parse: true
        })
        var ModelView = Backbone.View.CouchDB.extend({})
        var AttachmentView = Backbone.View.Attachment.extend({
            className: 'image_attachment'
        })
        
        modelView = new ModelView({
            model: product,
            attachmentView: AttachmentView
        })
    })
    it("should have", function() {
       var e = modelView.buildAttachments();
       console.log(e.html())
       var large_attachment = $(e).children()[0].children[0];
       dropFile(large_attachment, file2)
       product.save()
       
        var request = mostRecentAjaxRequest();
        console.log(request)
        
    })
})

describe("Attachments", function() {
    var product;

    beforeEach(function() {
        var Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products"
        });
        product = new Product(productJSON, {
            parse: true
        })
    });

    it("should have an Attachments collection", function() {
        expect(product._attachments.length).toEqual(3);
    });

    it("should have an Attachment with the correct url", function() {
        expect(product._attachments.at(0).url()).toEqual('/products/eloquence-name_place/attachments/large-3')
    })

    it("should update the Attachment's content_type attribute when adding a file", function() {
        var attachment = product._attachments.at(0);
        expect(attachment.get("content_type")).toBe("image/png")
        attachment.updateBinary(file);
        expect(attachment.get("content_type")).toBe("text/plain")
    })

});

describe("Saving Attachments", function() {

    // mock FileReader as we don't want to actually read files in from the filesystem
    FileReader = function() {
        var that = this;
        this.readAsDataURL = function() {
            // trigger the onload event that would normally be fired
            // after readAsDataURL had loaded the file
            that.onload({
                target: {
                    result: "base64,dataforfile"
                }
            });
        }
    }
    beforeEach(function() {

        jasmine.Ajax.useMock();
        var Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products"
        });
        product = new Product(productJSON, {
            parse: true
        })
    })

    it("should save with no Attachments when no files have been added", function() {
        product.save();
        var request = mostRecentAjaxRequest();
        expect(Object.keys(JSON.parse(request.params)._attachments).length).toEqual(0)
    })

    it("should save the correct 2 Attachments when 2 files have been added", function() {
        var attachment1 = product._attachments.at(0);
        var attachment2 = product._attachments.at(2);
        attachment1.updateBinary(file);
        attachment2.updateBinary(file2);
        product.save();
        var request = mostRecentAjaxRequest();
        var result = JSON.parse(request.params)
        expect(Object.keys(result._attachments).length).toEqual(2)
        expect(result._attachments["emily.jpg"]).toBeDefined();
        expect(result._attachments["display-3"]).not.toBeDefined();
        expect(result._attachments["david.txt"]).toBeDefined();
    })

    it("should save using PUT when a file has been added to an existing model", function() {
        var attachment1 = product._attachments.at(0);
        attachment1.updateBinary(file);
        product.save()
        var request = mostRecentAjaxRequest();
        expect(request.method).toEqual("PUT")
    })

    it("should save using POST when a new model is created", function() {
        var Person = Backbone.Model.CouchDB.extend({
            urlRoot: '/people'
        })

        var person = new Person();
        person.save();
        var request = mostRecentAjaxRequest();
        expect(request.method).toEqual("POST");
    })
})

describe("CouchDB Views", function() {
    var product, modelView, Product;
    beforeEach(function() {
       Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products"
        });
        product = new Product(productJSON, {
            parse: true
        })
        var ModelView = Backbone.View.CouchDB.extend({})
        var AttachmentView = Backbone.View.Attachment.extend({
            className: 'image_attachment'
        })

        modelView = new ModelView({
            model: product,
            attachmentView: AttachmentView
        })
    })

    it("should render a view conaining the attachments", function() {
        var element = modelView.buildAttachments()
        expect(element).toHaveHtml('<div id="large-3" class="image_attachment"></div><div id="display-3" class="image_attachment"></div><div id="medium-3" class="image_attachment"></div>')
    })
    
    it("should reject a file that has the same name as an existing attachment", function(){
        
    }), 
    it("should not update attacments order on the server if files have not been uploaded yet", function(){}),
    
    it("should add a new attachment view on an existing model and update that attachment", function() {
        jasmine.Ajax.useMock();
        var element = modelView.buildAttachments()
        modelView.addAttachment();
        var added_element = $(element).children()[3]
        dropFile(added_element, file)
        expect(product.get("attachments_order").length).toEqual(4);
        expect(product.get("attachments_order")[3]).toEqual("david.txt")
        product.save();
        var request = mostRecentAjaxRequest();
    })

    it("should render add a new attachment view and update that attachment correctly", function() {
        jasmine.Ajax.useMock();
        product = new Product({name: "David Pettifer"});
        modelView.model = product;
        var element = modelView.buildAttachments()
        modelView.addAttachment();
        var added_element = $(element).children()[0]
        dropFile(added_element, file)
        expect(product.get("attachments_order").length).toEqual(1)
        expect(product.get("attachments_order")[0]).toEqual("david.txt")
        product.save();
        var request = mostRecentAjaxRequest();
    })
})
// We have to create a drop event so we can programmatically
        // emulate the dropping of a file onto the element

function dropFile(element, file) {
    var evt = document.createEvent('Event');
        evt.initEvent('drop', true, true)
        evt.dataTransfer = {
            files: [file]
        }
        element.dispatchEvent(evt, true)
}