var AnnotationSaveHelper = jsface.Class(function () {
    //private members
    var annTool;
    function createJson() {
        var json = {};
        json.id = annTool.id;
        json.orderId = annTool.orderId;
        json.floor = annTool.floor;
        json.fld2DOr3D = annTool.fld2DOr3D;
        json.iteration = annTool.iteration;
        json.userId = annTool.userId;
        json.userName = annTool.userName;
        json.globalData = annTool.getGlobalData();
        json.annotationElements = extractElementsAndComments();

        //console.log(JSON.stringify(json));
        ApiCaller.call("saveAnnotationData", { data: json }, function (data, errMsg) {
            if (data) {
                annTool.hasUnSavedData = false;
                annTool.setAnnotationId(data.annotationId);
                alert("Data saved successfully.");

            }
            else {
                alert("Error when saving, " + errMsg);
            }
            annTool.showLoading(false);
        });

    }

    function extractElementsAndComments() {
        var propsToInclude = ["objId", "hasControls", "hasBorder", "lockRotation", "lockUniScaling", "lockScalingX", "lockScalingY", "selectable"];

        var elements = [];
        for (var key in annTool.getAllElements()) {
            var elem = annTool.getAllElements()[key];

            var arr = [];
            for (var k2 in elem.elements) {
                var fbEle = elem.elements[k2];
                arr.push({ type: fbEle.type, key: k2, params: fbEle.toJSON(propsToInclude) });
            }

            //console.log(JSON.stringify(arr));
            var elemsJson = { elements: arr, tag: { type: elem.tag.type, params: elem.tag.toJSON(propsToInclude)} }
            elements.push({ type: elem.type, id: elem.id, elemOrder: elem.elemOrder, json: JSON.stringify(elemsJson), comment: elem.comment });



        }

        return elements;
    }


    //class definetion
    return {
        constructor: function (annTool1) {
            annTool = annTool1;
        },
        save: function () {
            annTool.showLoading(true);
            if(annTool.isValid()){
                createJson();
            }else{
                alert("Please write comment for all annotations.")
                annTool.showLoading(false);
            }
        }
    }

});