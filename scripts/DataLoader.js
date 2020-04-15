var DataLoader = jsface.Class(function(){
	var _callback

	var _imageLoaded = 0;
	var _dataLoaded = 0;

	var _image = null;
	var _data = null;

	function checkAndCallback(){
		if(_imageLoaded!=0 && _dataLoaded!=0){
			_data.imageDom = _image;
			_callback(_data);
		}
	}

	function getImagePath(path, is3D) {
	    var newPath = path;
	    if (is3D) {
	        var slashIndex = path.lastIndexOf("/");
	        newPath = path.substring(0, slashIndex + 1) + "3D_" + path.substring(slashIndex + 1);
	    }
	    return newPath;
	}

	return {
		loadData: function(params, callback){
		    _callback = callback;
		    var imagePath = getImagePath(params.imageUrl, params.fld2DOr3D == "3D");
			var img = $("<\img>");
			img.load(function(e){
				_image = this;
				_imageLoaded = 1;
				checkAndCallback();
			})
			.error(function(e){
				_imageLoaded = -1;
				checkAndCallback();
			})
			.attr("src", imagePath);
			
			if (params.annotationId != -1) {

			    ApiCaller.call("getAnnotationData", { id: params.annotationId }, function (data, error) {
			        if (data) {
			            _data = data;
			            _dataLoaded = 1;
			            checkAndCallback();
			        }
			        else {
			            _dataLoaded = -1;
			            checkAndCallback();
			        }
			    });

			}
			else{
				_data = {};
				_dataLoaded = 1;
				checkAndCallback();
			}
		}
	}
});

var ApiCaller = jsface.Class({
    $singleton: true,
    $statics:{
        BASE_URL: "AnnotationToolServices.svc/"
    },
    call: function (method, requestData, callback) {
        $.ajax({
            // url: ApiCaller.BASE_URL + method,
            url: "data/new-data.json",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(requestData),
            success: function (data) {
            	if(data.d.status.success){
	                callback(data.d, "");
	            }
	            else{
	            	callback(null, data.d.status.errorMsg);
	            }
            },
            error: function (err, msg, t) {
                callback(null, msg);
            }
        });
    }
});