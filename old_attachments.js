Backbone.Model.Attachment = Backbone.Model.extend({
    updateBinary: function(file) {
        this.set({
            binary: file,
            content_type: file.type,
            id: file.name
        });
    }
})

Backbone.Collection.Attachments = Backbone.Collection.extend({
    model: Backbone.Model.Attachment
})

Backbone.Model.CouchDB = Backbone.Model.extend({
    constructor: function(attributes, options) {
        this._attachments = new Backbone.Collection.Attachments;
        this.attachments_order = [];
        Backbone.Model.apply(this, arguments)
    },
    // We overwrite the parse function as when attachments come down the 
    // wire we need to parse them out into a separate Backbone collection
    // and make each attachment a Backbone model
    parse: function(resp) {
        var resp = _.clone(resp)
        var parsed_attachments = _.map(resp._attachments, function(value, key, list) {
            return {
                id: key,
                content_type: list[key].content_type,
                length: list[key].length,
            }
        }, this)
        this._attachments.reset(parsed_attachments)

        this._attachments.url = this.url() + "/" + resp._id + "/attachments"
        this.attachments_order = resp.attachments_order
        return resp;
    },

    // We call this to save the order of attachments to the server
    updateAttachmentsOrder: function(new_order) {
        this.save({
            "attachments_order": new_order
        }, {
            patch: true
        });
    },
    sync: function() {
        var xhr, args = arguments;

        // Because the FileReader API is asynchronous we have to use a callback
        // style to call Backbone.sync when the files have been read
        this.saveForCouchDB(function(attrs) {
            args[2].attrs = attrs; // args[2] is the options object from arguments
            xhr = Backbone.sync.apply(this, args);
        })
        return xhr;
    },
    // We override the toJSON function as this is what Backbone.sync uses to 
    // save our model to the server.
    saveForCouchDB: function(callback) {
        var json = _.clone(this.attributes);
        if (this._attachments.length > 0) {
            json._attachments = {};
            var attachments = this._attachments.filter(function(attachment) {
                return attachment.get("binary");
            });
            // If no files have been added to the model then we return straight away
            if (attachments.length === 0) {
                callback(json)
                return;
            }
            // We need to use a counter as loading of the files is asynchronous
            // and we do not want to return until they are all loaded
            var counter = 0;
            _.each(attachments, function(attachment) {

                var fReader = new FileReader();
                fReader.onload = function(event) {

                    counter++;
                    var data = event.target.result.split(",")[1];
                    json._attachments[attachment.id] = {
                        content_type: attachment.get("content_type"),
                        data: data
                    }
                    if (counter == attachments.length) {
                        callback(json);
                    }
                }
                fReader.readAsDataURL(attachment.get("binary"))
            })
        }
        else {
            callback(json)
        }
    },
    idAttribute: "_id"
});

/////////////////
// VIEWS
/////////////////

Backbone.View.Attachment = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments)
        var that = this;
        this.el.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        makeDroppable(this.el, this.model)
        this.listenTo(this.model, "change:id", function(model) {
            that.$el.attr('id', model.id)
            model.collection.trigger('update-id')
        })
        this.listenTo(this.model, "destroy", this.remove);
    }
})

Backbone.View.Attachments = Backbone.View.extend({
    initialize: function() {
        this.model._attachments.on("add", this.addAttachment, this)
        if(!this.model.attachment_types) {
        this.model._attachments.on("update-id", this.updateAttachments, this)
        
        }
    },
    updateAttachments: function() {
        this.model.set("attachments_order", this.$el.sortable("toArray"))
    },
    // addAttachment is called with an instance of the new attachment model
    // whenever the addAttachment() method from the parent view class is called. 
    addAttachment: function(attachment) {
        var attachment_view = new this.options.view({
            attributes: {
                id: attachment.cid
            },
            model: attachment
        });
        this.$el.append(attachment_view.render().el)
    },
    render: function() {
        var that = this;
        this.$el.empty();
        this.model.attachments_order.forEach(function(key) {
            // Handle groups of attachments
            if (typeof key == "number") {
                var these_attachments_el = $('<div></div>', { id: key});
                that.model.attachment_types.forEach(function(type) {
                    var attachment_id = key + "-" + type;
                    var attachment = that.model._attachments.get(attachment_id);
                  
                    var subview = new that.options.view({
                        attributes: {
                            id: attachment_id
                        },
                        model: attachment
                    }).render()
                    makeDroppable(subview.el, attachment)
                    these_attachments_el.append(subview.el);
                })
                that.$el.append(these_attachments_el);
            }
            // Handle single attachments
            else {
                var subview = new that.options.view({
                    attributes: {
                        id: key
                    },
                    model: that.model._attachments.get(key)
                }).render()
                makeDroppable(subview.el, that.model._attachments.get(key), that.model)
                that.$el.append(subview.el);
            }
        })
        return this;
    }
})

Backbone.View.CouchDB = Backbone.View.extend({
    addAttachment: function() {
        this.model._attachments.add()
    },
    // Extend this view and then call buildAttachments(view) from within the 
    // extended view's render() method, passing it an extended Backbone view
    // to render each individual attachment. 
    buildAttachments: function() {
        var that = this;
        var attachments_collection_view = new Backbone.View.Attachments({
            model: this.model,
            view: that.options.attachmentView
        })
        var attachments_view_element = attachments_collection_view.render().$el
        attachments_view_element.sortable({
            update: function(event, ui) {
                that.model.updateAttachmentsOrder($(this).sortable("toArray"));
            }
        })
        return attachments_view_element
    }
})

////////////////
// HELPERS 
////////////////

// Takes the Attachment View and makes it into a droppable element and provides a callback 
// to be executed when a file is dropped on that element
function makeDroppable(el, attachment) {
    // We need this to prevent the browser using its standard default when you drag over
    el.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    // Listen for a file to be dropped on the element and then get the file, set the 
    // binary data of the attachment and save it
    el.addEventListener('drop', function(e) {
        e.preventDefault();
        console.log("SRC", e.srcElement)
        attachment.updateBinary(e.dataTransfer.files[0]);
    });
}