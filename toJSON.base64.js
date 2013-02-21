toJSON: function(callback) {
        var json = _.clone(this.attributes);
        json._attachments = {};
        var attachments = this.get("_attachments").filter(function(attachment) {
            return attachment.get("binary");
        });
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