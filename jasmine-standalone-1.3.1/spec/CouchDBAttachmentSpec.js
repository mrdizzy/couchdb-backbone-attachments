var initialize = {
    "_id": "eloquence-name_place",
    "_rev": "45-cdc938e06e1c43598730833e9334a8ff",
    "type": "product",
    "colours": ["MidnightBlue"],
    "attachments_order": ["large-3", "display-3", "medium-3", "thumb-3", "large-4", "display-4"],
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
        },
        "thumb-3": {
            "content_type": "image/png",
            "revpos": 38,
            "digest": "md5-wXGFsQ+flSyxLS2JpBWLbw==",
            "length": 6987,
            "stub": true
        },
        "large-4": {
            "content_type": "image/png",
            "revpos": 35,
            "digest": "md5-zP+J4mlYcb39UVSs1llb5w==",
            "length": 111961,
            "stub": true
        },
        "display-4": {
            "content_type": "image/png",
            "revpos": 34,
            "digest": "md5-7AshZy8eilrPdEFApt1hmA==",
            "length": 37868,
            "stub": true
        }
    }
};

describe("Attachments", function() {
    var attach;

    beforeEach(function() {

        jasmine.Ajax.useMock();

        var Product = Backbone.Model.CouchDB.extend({
            urlRoot: "/products"
        });
        attach = new Product(initialize, {parse:true});
        console.log(attach)

        var AttachmentView = Backbone.View.extend({
            tagName: 'li',
            events: {
                'click .remove': 'removeAttachment'
            },
            removeAttachment: function() {
                this.model.destroy();
            },
            render: function() {
                this.$el.html(this.model.id + " <a class='remove'>Remove</a>");
                return this;
            }
        })

        var ProductView = Backbone.View.CouchDB.extend({
            events: {
                'click #add': 'addAttachment'
            },
            render: function() {
                this.$el.html(this.buildAttachments(AttachmentView));
                this.$el.append("<p id='add'>Add</p>")
                return this;
            }
        });
        var pv = new ProductView({
            model: attach
        }).render().$el;

    });
    // Any CouchDB docs with attachments must also have attachments_order field which is an array
    // containing the order in which to display the attachments

    it("should be able to play a Song", function() {

   attach.updateAttachmentsOrder("boo")
        request = mostRecentAjaxRequest();
        console.log(request)
     

    });

});