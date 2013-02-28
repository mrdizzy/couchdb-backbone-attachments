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