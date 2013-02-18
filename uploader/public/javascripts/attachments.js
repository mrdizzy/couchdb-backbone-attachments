Backbone.Model.Attachment = Backbone.Model.extend({

    // Overwrite the Backbone.sync method for CREATE and UPDATE calls
    // as we want to send just the binary data of the attachment
    // We shouldn't concern ourselves with GETting the attachment as 
    // attachments should always be created via the parent collection
    sync: function(method, model, options) {
        console.log(this.url(), this.url)
        if (method === "update") {
            $.ajax({
                url: '/products/attachments/121',
                type: "PUT",
                data: this.get("binary"),
                contentType: "image/jpeg",
                processData: false,
                success: function(response) {
                    console.log(response)
                }
            })
        }
    }
})

Backbone.Collection.Attachments = Backbone.Collection.extend({
    model: Backbone.Model.Attachment
})

Backbone.Model.CouchDB = Backbone.Model.extend({
    defaults: {
        "_attachments": new Backbone.Collection.Attachments,
        "attachments_order": []
    },
    parse: function(resp) {
        var result = {};
        _.each(resp._attachments, function(value, key, list) {
            var type_number = key.split("-");
            var number = type_number[1];
            var type = type_number[0];
            result[number] = result[number] || {}
            result[number][type] = {
                content_type: list[key].content_type,
                length: list[key].length
            }
        })
        var parsed_attachments = _.map(resp._attachments, function(value, key, list) {
            return {
                id: key,
                content_type: list[key].content_type,
                length: list[key].length,
            }
        }, this)
        if (this.get("_attachments") instanceof Backbone.Collection.Attachments) {
            resp._attachments = this.get("_attachments").reset(parsed_attachments)
        }
        else {
            resp._attachments = new Backbone.Collection.Attachments(parsed_attachments)
        }
        resp._attachments.url = this.url() +"/" + resp._id + "/attachments"
        return resp;
    },
    updateAttachmentsOrder: function(new_order) {
        this.save({
            "attachments_order": new_order
        }, {
            patch: true
        });
    },
    idAttribute: "_id"
});


function makeDroppable(el, model) {
    // We need this to prevent the browser using its standard default when you drag over
    el.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    // Listen for a file to be dropped on the element
    // and then get the file, set the binary data of the attachment
    // and save it
    el.addEventListener('drop', function(e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];

        model.set("binary", file);
        model.save();
        $('img').remove()
        $('<img>').attr('title', file.name).attr('src', this.result).css('width', '50px').appendTo(el);
    });
}
// VIEWS 
// Attachments

Backbone.View.Attachments = Backbone.View.extend({
    initialize: function() {
        this.model.get("_attachments").on("add", this.addAttachment, this)
    },
    // addAttachment is called whenever the addAttachment() method from the 
    // parent view class (below) is called. 
    addAttachment: function(model) {
        var v = new this.options.view({
            attributes: {
                id: model.cid
            },
            model: model
        });
        v.listenTo(model, 'destroy', v.remove)
        this.$el.append(v.render().el)
    },
    render: function() {
        var that = this;
        this.$el.empty();

        this.model.get("attachments_order").forEach(function(key) {
            var subview = new that.options.view({
                attributes: {
                    id: key
                },
                model: that.model.get("_attachments").get(key)
            }).render()
            makeDroppable(subview.el, that.model.get("_attachments").get(key))
            that.$el.append(subview.el);
        })
        return this;
    }
})

// VIEW 
// CouchDB Model
//

Backbone.View.CouchDB = Backbone.View.extend({
    // 
    addAttachment: function() {
        this.model.get("_attachments").add({})
    },

    // Extend this view and then call buildAttachments(view) from within the 
    // extended view's render() method, passing it an extended Backbone view
    // to render each individual attachment. 
    buildAttachments: function(view) {
        var that = this;
        var rendered_view = new Backbone.View.Attachments({
            model: this.model,
            view: view
        })
        var element = rendered_view.render().$el
        element.sortable({
            update: function(event, ui) {
                that.model.updateAttachmentsOrder($(this).sortable("toArray"));
            }
        })

        return rendered_view.render().el
    }
})
