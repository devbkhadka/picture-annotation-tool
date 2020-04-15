var AnnotationElements = {};


AnnotationElements.Base = jsface.Class(function () {
    //Constants
    var TAG_RADIUS = 9;

    //private members
    function getNewId() {
        var retId = AnnotationElements.Base.curNewId;
        AnnotationElements.Base.curNewId++;
        return retId;
    }

    function getNewOrder() {
        var retOrder = AnnotationElements.Base.curOrder;
        AnnotationElements.Base.curOrder++;
        return retOrder;

    }

    //public and static members
    return {
        $statics: {
            allTags: new Array(),
            curNewId: 1,
            curOrder: 1,
            setCurOrder: function (curOrder) {
                AnnotationElements.Base.curOrder = curOrder;
            }

        },
        constructor: function (type, id, elemOrder) {
            this.type = type;
            if (id) {
                this.id = id;
            }
            else {
                this.id = getNewId();
            }


            if (elemOrder) {
                this.elemOrder = elemOrder;
            }
            else {
                this.elemOrder = getNewOrder();
            }

            this.elements = null;
            this.tag = null;
            this.comment = null;
        },
        getElements: function () {
            if (!this.elements) {
                this.elements = this.createElements();
                for (var key in this.elements) {
                    var item = this.elements[key];
                    item.objId = this.id;
                    item.elementObj = this;
                }
                this.registerEvents();
            }
            return this.elements;
        },
        getTag: function () {
            if (!AnnotationElements.Base.allTags[this.id]) {
                this.tag = this.createTag(this.elemOrder);
            }
            return this.tag;
        },
        createTag: function (elemOrder) {
            var circle = new fabric.Circle({
                radius: TAG_RADIUS,
                fill: 'red'
            });
            var text = new fabric.Text(elemOrder + "", {
                fontSize: 2 * TAG_RADIUS - 2,
                fill: 'white'
            })

            var grp = new fabric.Group([circle, text], { top: -10, left: -10 });
            grp.selectable = false;
            grp.isTag = true;
            return grp;
        },
        setTagNumber: function (num) {
            if (this.tag) {
                this.tag.item(1).setText(num + "");
            }
        },
        setItemPos: function (x, y, scale) {

            for (var key in this.elements) {
                var item = this.elements[key];
                item.setLeft(x);
                item.setTop(y);

                item.setCoords();
            }

            if (this.tag && this.getTagRelPosX() >= 0) {
                this.tag.setLeft(x + this.getWidth() * scale * (this.getTagRelPosX() - 0.5));
                this.tag.setTop(y + this.getHeight() * scale * (this.getTagRelPosY() - 0.5));
            }
        },
        getTagRelPosX: function () {
            return 0;
        },
        getTagRelPosY: function () {
            return 0.5;
        },
        getWidth: function () {
            return this.elements[0].width;
        },
        getHeight: function () {
            return this.elements[0].height;
        },
        getLeft: function () {
            return Math.floor(this.elements[0].getLeft());
        },
        getTop: function () {
            return Math.floor(this.elements[0].getTop());
        },
        scale: function (scale) {
            for (var key in this.elements) {
                var item = this.elements[key];
                item.scale(scale);
            }
        },
        scaleAndShift: function (refX, refY, newScale) {
            /*for(var key in this.elements){
            var item = this.elements[key];
            item.scale(newScale);
            console.log(item.getLeft() + ", " + item.getTop());
            var x = ((item.getLeft() - refX)/AnnotationTool.SCALE) * newScale + refX;
            var y = ((item.getTop() - refY)/AnnotationTool.SCALE) * newScale + refY;
                
            console.log(x + ", " + y);
            this.setItemPos(x, y, newScale);
                
            }*/
            this.scale(newScale);
            //console.log(this.getLeft() + ", " + this.getTop());
            var x = Math.round(((this.getLeft() - refX) / AnnotationTool.SCALE) * newScale + refX);
            var y = Math.round(((this.getTop() - refY) / AnnotationTool.SCALE) * newScale + refY);

            //console.log(x + ", " + y);
            this.setItemPos(x, y, newScale);
        },
        setSelectedHandler: function (selectedHandler) {
            var me = this;
            for (var key in this.elements) {
                var item = this.elements[key];
                item.on("selected", function () {
                    selectedHandler(me); 
                });

                return;
            }
        },
        setChanged: function () {
            var annTool = AnnotationTool.getInstance();
            annTool.hasUnSavedData = true;
        },
        unselected: function () {

        },
        setOrder: function (newOrder) {
            this.elemOrder = newOrder;
            this.setTagNumber(newOrder);
            CommentHelper.setOrder(this);
        },
        getSelectableElement: function () {
            return this.elements[0];
        }
    }

});