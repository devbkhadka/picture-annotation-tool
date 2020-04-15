/*
	Class for main logic of AnnotationTool
*/
function AnnotationTool(opts){
	//default options
	var options = {
		canvasId: 'canvas',
        id: -1,
        orderId: 0,
        userId: 5,
        userName: "Dev Khadka"
	}

	var opt3 = $.extend(options, opts);

    //private member variables

	var canvas = new fabric.Canvas(options.canvasId);
	var jqCanvas = $(options.canvasId);
    var lastImageX = 0;
    var lastImageY = 0;
    var fabImg;
    var is3D = false;
    var eventHelper;
    var allElements = [];
    var jqLoadingPanel = $("#loadingPanel");
    var activeElement;

    var MIN_SCALE = 0.2;
    var MAX_SCALE = 3;

    this.id = options.id;
    this.orderId = options.orderId;
    this.floor = options.floor;
    this.fld2DOr3D = options.fld2DOr3D;
    this.iteration = options.iteration;
    this.userId = options.userId;
    this.userName = options.userName;
    this.role = options.role;
    this.hasUnSavedData = false;
    this.isCanvasClicked = false;
    canvasClickedTimerHandle = null;

    var me = this;
    
    //Starts rendering images and annotation in the canvas
    this.startRendering = function(){
    	eventHelper =  new JQueryEvents($);
    	eventHelper.setAnnotationTool(this);
        canvas.selection = false;
    	
        //load a test image
        this.loadGlobalData(options.globalData);
        this.addImage(options.imageDom);
        if(options.annotationElements){
            this.addElements(options.annotationElements, options.comments);
            var scale = calcScaleToFit();
            scaleAll(scale);
            fabImg.setTop(AnnotationTool.originY);
            fabImg.setLeft(AnnotationTool.originX);
            moveAll();
        }
        this.showLoading(false);
    };

    this.elementDropped = function(event, ui){
    	var newElement;
        var posX = event.pageX - jqCanvas.offset().left;
        var posY = event.pageY - jqCanvas.offset().top;
        
        //console.log(ui.draggable[0].id);
        var newElementObj = AnnotationElements.getElementObj(ui.draggable[0].id);
        allElements[newElementObj.id] = newElementObj;
        addAnnElementToCanvas(newElementObj, posX, posY);
        this.selectElement(newElementObj);
        this.hasUnSavedData = true;
        setCanvasClicked();
 	
    }

    this.selectElement = function(elem){
        if(elem){
            canvas.setActiveObject(elem.getSelectableElement());
        }else{
            canvas.setActiveObject(fabImg);
        }
        setCanvasClicked();
    }

    this.removeElement = function (element) {
        //remove from comment list
        CommentHelper.remove(element);
        //remove elements from canvas
        var newElements = element.getElements();
        for (var key in newElements) {
            canvas.remove(newElements[key]);
        }
        canvas.remove(element.tag);

        //remove from allelements array
        delete allElements[element.id];

        var maxOrder = 1;
        for (var key in allElements) {
            var elemObj = allElements[key];
            if (element.elemOrder < elemObj.elemOrder) {
                elemObj.setOrder(elemObj.elemOrder - 1);
            }
            maxOrder = Math.max(maxOrder, elemObj.elemOrder+1);

        }
        AnnotationElements.Base.setCurOrder(maxOrder);
        this.renderAll();
    }

    var addAnnElementToCanvas = function(newElementObj, posX, posY){
        newElements = newElementObj.getElements();
        if(newElements!=null){
            newElementObj.scale(AnnotationTool.SCALE);

            for (var key in newElements) {
                var fbElem = newElements[key];
                if (me.role == 1) {
                    fbElem.lockRotation = true;
                    fbElem.lockMovementX = true;
                    fbElem.lockMovementY = true;
                    fbElem.lockScalingX = true;
                    fbElem.lockScalingY = true;
                    fbElem.hasControls = false;
                }
                canvas.add(fbElem);
            }

            var tag = newElementObj.getTag();
            canvas.add(tag);

            newElementObj.setItemPos(posX, posY, AnnotationTool.SCALE);
            newElementObj.setSelectedHandler(itemSelected);
            canvas.on("selection:cleared",function(e){
                selectionCleared(e);
            });

            canvas.renderAll();
        }
    }

    var itemSelected = function (element) {
        me.setActiveElement(element);
        CommentHelper.activateComment(element);
    }

    var selectionCleared = function (e) {

        me.setActiveElement(null);
        CommentHelper.deactivateComment();
    }

    this.setActiveElement = function (element) {
        if (activeElement && activeElement != element && activeElement.unselected) {
            activeElement.unselected();
        }
        activeElement = element;

    }

    this.zoomPlus = function(inc){
    	scaleAll (AnnotationTool.SCALE + inc)
    } 

    //Zoom in or out all elements in canvas equally
	function scaleAll2(newScale){
        if(newScale>MIN_SCALE && newScale<MAX_SCALE){
            canvas.forEachObject(function(item, index, arry){
                if(!item.isTag){
                    item.scale(newScale);
                    if(item != fabImg){
                        //When scaling move element so that distance of elements for center is always in portion wiht scale
                        var x = ((item.getLeft() - AnnotationTool.originX)/AnnotationTool.SCALE) * newScale + AnnotationTool.originX;
                        var y = ((item.getTop() - AnnotationTool.originY)/AnnotationTool.SCALE) * newScale + AnnotationTool.originY;
                        if(item.elementObj){
                            item.elementObj.setItemPos(x, y, newScale);
                        }
                    }
                    
                }
            });
            canvas.renderAll();
            AnnotationTool.SCALE = newScale;
        }
    }


    function scaleAll(newScale){
        if(newScale>MIN_SCALE && newScale<MAX_SCALE){
            fabImg.scale(newScale);
            for(var key in allElements){
                elementObj = allElements[key];
                elementObj.scaleAndShift(fabImg.getLeft(), fabImg.getTop(), newScale);
            }
            canvas.renderAll();
            AnnotationTool.SCALE = newScale;
        }
        
    }

    //Move all element with image when user moves image
    function moveAll(){
        var newX = fabImg.getLeft();
        var newY = fabImg.getTop();

        for(var key in allElements){   
            var item = allElements[key];                        
            var iLeft = item.getLeft() - (lastImageX-newX);
            var iTop = item.getTop() - (lastImageY-newY);
            if(item){
                item.setItemPos(iLeft, iTop, AnnotationTool.SCALE);
            }
        }
           
        lastImageX = newX;
        lastImageY = newY;
        canvas.renderAll();

    }

    this.loadGlobalData = function(strData){
        if(strData && strData!=""){
            var globalData = JSON.parse(strData);
            AnnotationTool.SCALE = globalData.scale;
            //AnnotationTool.originX = globalData.originX;
            //AnnotationTool.originY = globalData.originY;
            lastImageX = globalData.lastImageX;
            lastImageY = globalData.lastImageY;
            AnnotationElements.Base.curNewId = globalData.curNewId;
            is3D: globalData.is3D
        }
       
    }

    var calcScaleToFit = function(){
        var scale = Math.min(canvas.height/fabImg.height, canvas.width/fabImg.width);
        scale = scale<MIN_SCALE?MIN_SCALE:scale;
        scale = scale>MAX_SCALE?MAX_SCALE:scale;
        return scale;
    }

    //Load image from server based on selected floor and 3D or 2D
    this.addImage = function (imageDom) {
       

        var oImg = new fabric.Image(imageDom, {
          
        });

        if (fabImg != null) {
            canvas.remove(fabImg);
        }
        
        fabImg = oImg;
        oImg.lockRotation = true;
        oImg.lockScalingX = true;
        oImg.lockScalingY = true;
    

        oImg.setTop(lastImageY);
        oImg.setLeft(lastImageX);

        //lastImageX = AnnotationTool.originX;
        //lastImageY = AnnotationTool.originY;
        
        if(AnnotationTool.SCALE==0){
            AnnotationTool.SCALE = calcScaleToFit();
        }

        oImg.hasControls = false;
        oImg.hasBorders = false;
        oImg.scale(AnnotationTool.SCALE);
        oImg.on("moving", function(sender){
            moveAll();
        });

        canvas.on("selection:cleared",function(e){
            selectionCleared(e);
        });
        oImg.on("selected",function(e){
            selectionCleared(e);
        });

        canvas.add(oImg);
        

        canvas.renderAll();
    }

    this.addElements = function (annElements, comments) {
        allElements = AnnotationElements.getAllElementObjs(annElements, comments);
        for (var key in allElements) {
            var elem = allElements[key];
            addAnnElementToCanvas(elem, elem.getLeft(), elem.getTop());
        }
        CommentHelper.ellipsizeAll();
    }

    //resize canvas to fill available space
    this.resizeCanvas = function(height, width) {
        
        AnnotationTool.originX = width/2;
        AnnotationTool.originY = height/2;
        if(fabImg){
            lastImageX = fabImg.getLeft();
            lastImageY = fabImg.getTop();
        }
        else{
            lastImageX = AnnotationTool.originX;
            lastImageY = AnnotationTool.originY;
        }
        canvas.setDimensions({ height: height, width: width });
    }

    /*this.addElement = function(element){
        canvas.add(element);
    }*/

    this.saveAnnotation = function(){
        var saveHelper = new AnnotationSaveHelper(this);
        saveHelper.save();
    }

    this.getAllElements = function(){
        return allElements;
    }

    this.getGlobalData = function(){
        var data = {
            scale: AnnotationTool.SCALE,
            //originX: AnnotationTool.originX,
            //originY: AnnotationTool.originY,
            lastImageX:  lastImageX,
            lastImageY: lastImageY,
            curNewId: AnnotationElements.Base.curNewId,
            is3D: is3D
        }
        return JSON.stringify(data);
    }

    this.showLoading = function (show) {
        if (show) {
            jqLoadingPanel.show();
        }
        else {
            jqLoadingPanel.hide();
        }
    }

    this.renderAll = function(){
        canvas.renderAll();
    }

    this.setAnnotationId = function (id) {
        this.id = id;
    }

    this.getActiveElement = function(){
        return activeElement;
    }

    this.isValid = function(){
        var isValid = true;
        for(var key in allElements){
            var elem = allElements[key];
            
            isValid = isValid && CommentHelper.isValid(elem);
        }
        return isValid;
    }

    jqCanvas.on("mousedown", function(e) {
        //console.log("canvas clicked");
        setCanvasClicked();
    });

    function setCanvasClicked(){
        if (canvasClickedTimerHandle) {
            clearInterval(canvasClickedTimerHandle);
            canvasClickedTimerHandle = null;
        }

        me.isCanvasClicked = true;
        canvasClickedTimerHandle = setTimeout(function () {
            me.isCanvasClicked = false;
        }, 500)
    }
    
}
var annToolGlobalInstance;
AnnotationTool.getInstance = function(options){
    if(!annToolGlobalInstance){
        annToolGlobalInstance = new AnnotationTool(options);
    }
    return annToolGlobalInstance;
}

AnnotationTool.SCALE = 0;
AnnotationTool.originX = 0;
AnnotationTool.originY = 0;





