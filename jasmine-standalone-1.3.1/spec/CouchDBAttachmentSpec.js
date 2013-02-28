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

var file = {
    name: "david.txt",
    type: "text/plain"
}
var file2 = {
    name: "emily.jpg",
    type: "image/jpeg"
}

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

describe("Preset attachments", function() {
    var product, modelView;
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

        var large_attachment = $(e).children()[0].children[0];
        dropFile(large_attachment, file2)
        product.save()

        var request = mostRecentAjaxRequest();
    })
    
    it("should add attachments", function() {
        var e = modelView.buildAttachments();
        var added = modelView.addAttachment();
    })
    
    it("should add move", function() {
        var e = modelView.buildAttachments();
        var first_element = $(e).children()[0]
        $(first_element).appendTo(e);
        console.log(e);
        $(e).trigger('update')
        console.log(product.get("attachments_order"))
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