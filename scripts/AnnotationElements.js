//Definations of annotation elements like circle, line etc
AnnotationElements.Circle = jsface.Class(AnnotationElements.Base, {
	constructor: function(type, id, elemOrder){
	    AnnotationElements.Circle.$super.call(this, type, id, elemOrder);
	},
	createElements: function(){
		var newCircle = new fabric.Circle({
	      radius: 50, stroke: 'red', strokeWidth:2, fill: 'rgba(0,0,0,0)', transparentCorners: true
	    });
		
	    newCircle.lockRotation = true;
	    newCircle.lockUniScaling = true;
	    return [newCircle];
	},
	registerEvents: function(){
		var me = this;
		var circle = this.elements[0];
		circle.on("scaling", function () { me.onScaling(); me.setChanged();});
		circle.on("moving", function () { me.setItemPos(circle.left, circle.top, AnnotationTool.SCALE); me.setChanged(); });
	},
	onScaling: function(){
		this.elements[0].setRadius(this.elements[0].getRadiusX()/ AnnotationTool.SCALE);
        this.elements[0].scale(AnnotationTool.SCALE);
        this.setItemPos(this.elements[0].getLeft(), this.elements[0].getTop(), AnnotationTool.SCALE);
	},
	onMoving: function(){

	}

});

AnnotationElements.Ellipse = jsface.Class(AnnotationElements.Base, {
    constructor: function (type, id, elemOrder) {
        AnnotationElements.Ellipse.$super.call(this, type, id, elemOrder);
    },
	createElements: function(){
		var newElement = new fabric.Ellipse({
	      rx: 50, ry: 50, stroke: 'red', strokeWidth:2, fill: 'rgba(0,0,0,0)', transparentCorners: true
	    });
		
	    //newElement.lockRotation = true;
	    //newElement.lockUniScaling = true;
	    return [newElement];
	},
	registerEvents: function(){
		var me = this;
		var ellipse = this.elements[0];
		ellipse.on("scaling", function () { me.onScaling(); me.setChanged(); });
		ellipse.on("moving", function () { me.setItemPos(ellipse.left, ellipse.top, AnnotationTool.SCALE); me.setChanged(); });
		ellipse.on("rotating", function () { me.setItemPos(ellipse.left, ellipse.top, AnnotationTool.SCALE); me.setChanged(); });
	},
	onScaling: function(){
		var ellipse = this.elements[0];
		ellipse.rx =  ((ellipse.rx * ellipse.getScaleX())/ AnnotationTool.SCALE);
		ellipse.ry = ((ellipse.ry * ellipse.getScaleY())/ AnnotationTool.SCALE);
		ellipse.height = 2 * ellipse.ry;
		ellipse.width = 2 * ellipse.rx;
        ellipse.scale(AnnotationTool.SCALE);

        this.setItemPos(ellipse.getLeft(), ellipse.getTop(), AnnotationTool.SCALE);
	},
	onMoving: function(){

	},
	getTagRelPosX: function(){
		return -1;
	},
	getTagRelPosY: function(){
    	return -1;
	},
	setItemPos: function(x,y,scale){
		AnnotationElements.Ellipse.$superp.setItemPos.call(this, x, y, scale);
		var ellipse = this.elements[0];
		var angle = ellipse.getAngle()*Math.PI/180;
		var dx = ellipse.get("rx") * scale * Math.cos(angle);
		var dy = ellipse.get("rx") * scale * Math.sin(angle);
		//console.log("angle: " + ellipse.getAngle() + " (" + dx +", " +dy + ")");
		this.tag.setLeft(x - dx);
        this.tag.setTop(y - dy);
	}

});


AnnotationElements.Line = jsface.Class(AnnotationElements.LineAndArrowBase, {
    constructor: function (type, id, elemOrder) {
	    AnnotationElements.Line.$super.call(this, type, id, elemOrder);
	}

});


AnnotationElements.Arrow  = jsface.Class(AnnotationElements.LineAndArrowBase, {
    constructor: function (type, id, elemOrder) {
	    AnnotationElements.Arrow.$super.call(this, type, id, elemOrder);
	}

});


AnnotationElements.Cross = jsface.Class(AnnotationElements.Base, {
	$statics: {
		crossSize: 100
	},
constructor: function (type, id, elemOrder) {
    AnnotationElements.Cross.$super.call(this, type, id, elemOrder);
    },
	createElements: function(){
		var line1 = new fabric.Line([-this.crossSize/2,-this.crossSize/2,this.crossSize/2,this.crossSize/2],{
			stroke: 'red', strokeWidth:4, top:0, left:0
		});

		var line2 = new fabric.Line([-this.crossSize/2,this.crossSize/2,this.crossSize/2,-this.crossSize/2],{
			stroke: 'red', strokeWidth:4, top:0, left:0
		})

		var grp = new fabric.Group([line1, line2], {left:0, top:0});

		//grp.hasControls = false;
		grp.hasBorder = false;
	    //grp.lockRotation = true;
	    //grp.lockUniScaling = true;
	    //grp.lockScalingX = true;
	    //grp.lockScalingY = true;

		
		return [grp]
	},
	registerEvents: function(){
		var grp = this.elements[0];
		grp.on("moving", $.proxy(this.onMoving, this));
		grp.on("scaling", $.proxy(this.onScaling, this));
	},
	onScaling: function(){
		var grp = this.elements[0];
		var line1 = grp.item(0);
		var line2 = grp.item(1);
		var curHalfSizeX = (grp.getScaleX() / AnnotationTool.SCALE) * (line1.get("x2") - line1.get("x1")) / 2;
		var curHalfSizeY = (grp.getScaleY() / AnnotationTool.SCALE) * (line1.get("y2") - line1.get("y1")) / 2;
	
		line1.set({x1: -curHalfSizeX, y1: -curHalfSizeY, x2: curHalfSizeX, y2: curHalfSizeY});
		line1.setCoords();
		line2.set({x1: -curHalfSizeX, y1: curHalfSizeY, x2: curHalfSizeX, y2: -curHalfSizeY});
		line2.setCoords();

		grp.set({width: 2*curHalfSizeX, height: 2*curHalfSizeY});
		grp.scale(AnnotationTool.SCALE);
		grp.setCoords();

		this.setItemPos(grp.getLeft(), grp.getTop(), AnnotationTool.SCALE);
		this.setChanged();
	},
	onMoving: function(){
	    this.setItemPos(this.getLeft(), this.getTop(), AnnotationTool.SCALE);
	    this.setChanged();
	},	
	getTagRelPosX: function(){
    	return 0.5;
	},
	getTagRelPosY: function(){
    	return 0.5;
	}
});

AnnotationElements.getElementObj = function(type, id, elemOrder){
	if(type=="CIRCLE"){
	    return new AnnotationElements.Circle(type, id, elemOrder);
	}
	else if(type=="ELLIPSE"){
	    return new AnnotationElements.Ellipse(type, id, elemOrder);
	}
	else if(type=="LINE"){
	    return new AnnotationElements.Line(type, id, elemOrder);
	}
	else if(type=="ARROW"){
	    return new AnnotationElements.Arrow(type, id, elemOrder);
	}
	else if(type=="CROSS"){
	    return new AnnotationElements.Cross(type, id, elemOrder);
	}
	else{
	    return new AnnotationElements.Circle(type, id, elemOrder);
	}
}

AnnotationElements.getAllElementObjs = function (annElements, comments) {
    var allAnnElements = [];

    var newOrder = 1;
    for (var key in annElements) {
        var annElement = annElements[key];
        var annEle = AnnotationElements.loadElementObj(annElement);
        annEle.comment = annElement.comment;
        CommentHelper.activateComment(annEle, true);
        allAnnElements[annEle.id] = annEle;
        newOrder++;
    }

    AnnotationElements.Base.setCurOrder(newOrder);
    return allAnnElements;
}


AnnotationElements.loadElementObj = function (annElem) {
    var elementObj = AnnotationElements.getElementObj(annElem.type, annElem.id, annElem.elemOrder);
    elementObj.elemOrder = annElem.elemOrder;
    elementObj.elements = [];

    var fbElemsAndTag = JSON.parse(annElem.json);

    for (var key in fbElemsAndTag.elements) {
        var elem = fbElemsAndTag.elements[key];

        var fbElem = AnnotationElements.getFabricElement(elem.type, elem.params);
        elementObj.elements[elem.key] = fbElem;

    }

    var tag = AnnotationElements.getFabricElement(fbElemsAndTag.tag.type, fbElemsAndTag.tag.params);
    elementObj.registerEvents();
    return elementObj;
}

AnnotationElements.getFabricElement = function (type, params) {

    if (type == "group") {
        var group = new fabric.Group([], {});
        var newParams = $.extend({}, params);
        newParams.objects = null;
        group.set(newParams);
        for (var key in params.objects) {
            var objParams = params.objects[key];
            var fbObj = AnnotationElements.getFabricElement(objParams.type, objParams);
            group.add(fbObj);
        }

        return group;

    }
    else {
        var fbElem = null;
        if (type == "circle") {
            fbElem = new fabric.Circle({});
        }
        else if (type == "line") {
            fbElem = new fabric.Line([], {});
        }
        else if (type == "ellipse") {
            fbElem = new fabric.Ellipse({});
        }
        else if (type == "triangle") {
            fbElem = new fabric.Triangle({});
        }
        else if (type == "rect") {
            fbElem = new fabric.Rect({});
        }
        else if (type == "text") {
            fbElem = new fabric.Text("", {});
        }

        fbElem.set(params);
        return fbElem;
    }

}











