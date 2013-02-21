Backbone.Model.Attachment = Backbone.Model.extend({
    updateBinary: function(file) {
        this.set("binary", file)
        this.set("content_type", file.type)
    }
    // Overwrite the Backbone.sync method for CREATE and UPDATE calls
    // as we want to send just the binary data of the attachment
    // We shouldn't concern ourselves with GETting the attachment as 
    // attachments should always be created via the parent collection
    //
    // options is created by the Backbone.Model.save() method and 
    // it contains the success callback for the low-level jQuery $.ajax
    // method. We augment it with our own options.
    /* sync: function(method, model, options) {
        options.processData = false; 
        options.data = this.get("binary");
        options.url = this.url();
        options.type = "PUT";
        options.contentType = this.get("content_type");
        var success = options.success;
        options.success = function(resp) {
            if(success) success(model,resp,options);
            model.trigger('sync',model.resp,options);
        }
        if (method === "update") {
            $.ajax(options);
        }
    }*/
})

Backbone.Collection.Attachments = Backbone.Collection.extend({
    model: Backbone.Model.Attachment
})

Backbone.Model.CouchDB = Backbone.Model.extend({
    defaults: {
        "_attachments": new Backbone.Collection.Attachments,
        "attachments_order": []
    },

    // We overwrite the parse function as when attachments come down the 
    // wire we need to parse them out into a separate Backbone collection
    // and make each attachment a Backbone model
    parse: function(resp) {
        var resp = _.clone(resp)
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
        console.log(resp._attachments)
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
        resp._attachments.url = this.url() + "/" + resp._id + "/attachments"
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
        json._attachments = {};
        var attachments = this.get("_attachments").filter(function(attachment) {
            
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
                   console.log(json)
                    callback(json);
                }
            }
            fReader.readAsDataURL(attachment.get("binary"))
        })
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
        // model.save();
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