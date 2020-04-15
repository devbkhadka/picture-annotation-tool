AnnotationElements.LineAndArrowBase = jsface.Class(AnnotationElements.Base, {

	$statics: {
		lineKey: 0,
		lineHead1Key: 1,
		lineHead2Key: 2,
		centerCircleKey: 3,
		arrowKey: 4
	},
	constructor: function(type, id, elemOrder){
		AnnotationElements.LineAndArrowBase.$super.call(this, type, id, elemOrder);
		this.type = type;
	},
	createElements: function(){
		var newElement = new fabric.Line([0,0,100,0],{
	       stroke: 'red', strokeWidth:2
	    });
		newElement.selectable = false;               
	    newElement.key = AnnotationElements.LineAndArrowBase.lineKey

	    var annTool = AnnotationTool.getInstance();

	    var arrow = new fabric.Triangle({
		  width: 20, height: 30, angle:-90, fill: 'red', left: 0, top: 0
		});
		arrow.key = AnnotationElements.LineAndArrowBase.arrowKey;
		arrow.selectable = false;
	    arrow.hasControls = false;
		arrow.hasBorder = false;
	    arrow.lockRotation = true;
	    arrow.lockScalingX = true;
	    arrow.lockScalingY = true;
	    if(this.type!="ARROW"){
		   arrow.visible = false;
		}
		



		var lineHead1 = new fabric.Rect({
	    	top:0, left:0, width: 30, height:30, stroke: '#A1ACCA', strokeWidth:2, fill: 'rgba(0,0,0,0)'
	    });
	    lineHead1.visible = false;
	    lineHead1.key = AnnotationElements.LineAndArrowBase.lineHead1Key;
	    lineHead1.hasControls = false;
		lineHead1.hasBorder = false;
	    lineHead1.lockRotation = true;
	    lineHead1.lockScalingX = true;
	    lineHead1.lockScalingY = true;

	    var lineHead2 = new fabric.Rect({
	    	top:0, left:0, width: 30, height:30, stroke: '#A1ACCA', strokeWidth:2, fill: 'rgba(0,0,0,0)'
	    });
	    lineHead2.key = AnnotationElements.LineAndArrowBase.lineHead2Key;
	    lineHead2.hasControls = false;
		lineHead2.hasBorder = false;
	    lineHead2.lockRotation = true;
	    lineHead2.lockScalingX = true;
	    lineHead2.lockScalingY = true;
	    lineHead2.visible = false;

	    var centerCircle = new fabric.Circle({
	    	radius: 16, top:0, left:0, stroke: 'rgba(0,0,0,0)', strokeWidth:5, fill: 'rgba(0,0,0,0)'
	    });
	    centerCircle.hasControls = false;
	    centerCircle.hasBorder = false;
	    centerCircle.lockRotation = true;
	    centerCircle.lockScalingX = true;
	    centerCircle.lockScalingY = true;

	    
	    var elements = new Array();

	    elements[this.lineKey] = newElement;
	    elements[this.arrowKey] = arrow;
	    elements[this.lineHead1Key] = lineHead1;
	    elements[this.lineHead2Key] = lineHead2; 
	    elements[this.centerCircleKey] = centerCircle;

	    return elements;
	},
	registerEvents: function(){
		var lineHead1 = this.elements[this.lineHead1Key];
	    var lineHead2 = this.elements[this.lineHead2Key]; 
	    var centerCircle = this.elements[this.centerCircleKey];

		lineHead1.on("moving", $.proxy(this.onMoving, this));
	    lineHead2.on("moving", $.proxy(this.onMoving, this));
	    centerCircle.on("moving", $.proxy(this.onCenterMoving, this));
	},
	onScaling: function(){
		
	},
	onMoving: function(){
		//this.setItemPos(this.elements[AnnotationElements.LineAndArrowBase.lineKey].left, this.elements[AnnotationElements.LineAndArrowBase.lineKey].top, AnnotationTool.SCALE);
		var line = this.elements[AnnotationElements.LineAndArrowBase.lineKey];
		var arrow = this.elements[AnnotationElements.LineAndArrowBase.arrowKey];
		var lineHead1 = this.elements[AnnotationElements.LineAndArrowBase.lineHead1Key];
		var lineHead2 = this.elements[AnnotationElements.LineAndArrowBase.lineHead2Key];
		var centerCircle = this.elements[AnnotationElements.LineAndArrowBase.centerCircleKey];

		var midx = Math.floor((lineHead1.getLeft() + lineHead2.getLeft())/2);
		var midy = Math.floor((lineHead1.getTop() + lineHead2.getTop())/2);

		var lenx = Math.floor((lineHead2.getLeft() - lineHead1.getLeft())/2);
		var leny = Math.floor((lineHead2.getTop() - lineHead1.getTop())/2);
		var sc = AnnotationTool.SCALE;
		line.set({x1: midx - lenx/sc, y1: midy - leny/sc, x2: midx + lenx/sc, y2: midy + leny/sc });

		centerCircle.setLeft(midx);
		centerCircle.setTop(midy);
		centerCircle.setCoords();

		this.tag.set({left: midx, top: midy});
		arrow.set({left: lineHead1.getLeft(), top: lineHead1.getTop()})


		if(this.type=="ARROW"){
			
			angle = Math.atan2(-lenx,leny)*180/Math.PI;
			
			//console.log("lenx: " + lenx + ", leny: " + leny + ", angle: " + angle);
			arrow.set({angle: angle});
		}

		this.setChanged()
		//this.setItemPos(midx,midy,AnnotationTool.SCALE);
	},
	onCenterMoving: function(e){
		var line = this.elements[AnnotationElements.LineAndArrowBase.lineKey];
		var centerCircle = this.elements[AnnotationElements.LineAndArrowBase.centerCircleKey];
		var lenX = (line.get("x1") - line.get("x2"))/2;
		var lenY = (line.get("y1") - line.get("y2"))/2;

		var midX = centerCircle.getLeft();
		var midY = centerCircle.getTop();

		line.set({x1: midX+lenX, y1: midY+lenY, x2: midX-lenX, y2: midY-lenY});
		this.setItemPos(midX, midY, AnnotationTool.SCALE);
		this.setChanged();
	},
	setItemPos: function(x, y, scale){
		//call setItemPos of super
		//this.$class.$superp.setItemPos.call(this, x, y, scale);
		var line = this.elements[AnnotationElements.LineAndArrowBase.lineKey];
		var arrow = this.elements[AnnotationElements.LineAndArrowBase.arrowKey];
		var lineHead1 = this.elements[AnnotationElements.LineAndArrowBase.lineHead1Key];
		var lineHead2 = this.elements[AnnotationElements.LineAndArrowBase.lineHead2Key];
		var centerCircle = this.elements[AnnotationElements.LineAndArrowBase.centerCircleKey];

		var lenX = (line.get("x1") - line.get("x2"))/2;
		var lenY = (line.get("y1") - line.get("y2"))/2;

		//console.log("x: " + x +", y: " + y);
		line.set({x1: x+lenX, y1: y+lenY, x2: x-lenX, y2: y-lenY});
		
		//line.set({top:0, left:0});
		line.setCoords();

		arrow.setLeft(x+lenX*scale);
		arrow.setTop(y+lenY*scale);
		arrow.setCoords();

		lineHead1.setLeft(x+lenX*scale);
		lineHead1.setTop(y+lenY*scale);
		lineHead1.setCoords();

		lineHead2.setLeft(x-lenX*scale);
		lineHead2.setTop(y-lenY*scale);
		lineHead2.setCoords();

		centerCircle.setLeft(x);
		centerCircle.setTop(y);
		centerCircle.setCoords();

		this.tag.set({left: x, top: y});
	},
	setSelectedHandler: function(selectedHandler){
		var me = this;
		var centerCircle = this.elements[AnnotationElements.LineAndArrowBase.centerCircleKey];
		var lineHead1 = this.elements[AnnotationElements.LineAndArrowBase.lineHead1Key];
		var lineHead2 = this.elements[AnnotationElements.LineAndArrowBase.lineHead2Key];
		var fireSelected = function(){
			lineHead1.visible = true;
			lineHead2.visible = true;
	    	selectedHandler(me);
	    	AnnotationTool.getInstance().renderAll();
	    };
		centerCircle.on("selected", fireSelected);
		lineHead1.on("selected", fireSelected);
		lineHead2.on("selected", fireSelected);

	},
	unselected: function(){
		var lineHead1 = this.elements[AnnotationElements.LineAndArrowBase.lineHead1Key];
		var lineHead2 = this.elements[AnnotationElements.LineAndArrowBase.lineHead2Key];
		
		lineHead2.visible = false
		lineHead1.visible = false
		
		AnnotationTool.getInstance().renderAll();
	},
	getSelectableElement: function(){
		var centerCircle = this.elements[AnnotationElements.LineAndArrowBase.centerCircleKey];
		return centerCircle;
	}

});