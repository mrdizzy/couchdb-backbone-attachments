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
        expect(product.get("_attachments").length).toEqual(3);
    });

    it("should have an Attachment with the correct url", function() {
        expect(product.get("_attachments").at(0).url()).toEqual('/products/eloquence-name_place/attachments/large-3')
    })



    it("should update the Attachment's content_type attribute when adding a file", function() {
        var attachment = product.get("_attachments").at(0);
        expect(attachment.get("content_type")).toBe("image/png")
        attachment.updateBinary(file);
        expect(attachment.get("content_type")).toBe("text/plain")
    })

});

describe("Saving Attachments", function() {
    var fileReader = {
        readAsDataURL: function() {}
    }

    beforeEach(function() {
        var Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products"
        });
        product = new Product(productJSON, {
            parse: true
        })
        spyOn(window, 'FileReader').andReturn(fileReader);
    })

    it("should save with no Attachments when no files have been added", function() {
        jasmine.Ajax.useMock();
        product.save();
        var request = mostRecentAjaxRequest();
        expect(Object.keys(JSON.parse(request.params)._attachments).length).toEqual(0)
    })
    it("")
})
