function JQueryEvents($){

    var selFloors = $("#selFloors");
    var selectedFloor = $(":selected", selFloors);
    var jqCanvas = $("#canvas");
    var jqComments = $("#comments");
    var jqBrandDiv = $(".brand");
    var rightPanel = $(".rightPanel");
    var mainForm = document.getElementById("mainForm");
    var annotationTool;

    this.setAnnotationTool = function(annTool){
    	annotationTool = annTool;
    	addEvents();
    }


    function addEvents() {

        if (annotationTool.role != 1) {
            $(".tools>li").draggable({ helper: "clone" });
            $(".mainPanel").droppable({
                drop: $.proxy(annotationTool.elementDropped, annotationTool)
            });
        }
        else {
            $("div.collaspable.Annotation").hide();
            $("#annotationTools").hide();
        }

        $(".rightPanel").resizable({ handles: "w", maxWidth:500, minWidth:100,
        	stop: function(){
        		resizeCanvas();
        		CommentHelper.ellipsizeAll();
        	}
    	});


    	selFloors.change(function (e) {
    	    //annotationTool.loadImage($(this).val());
    	    $("#hdnFld2DOr3D").val("2D");
    	    setTimeout(function () {
    	        selectedFloor[0].selected = true;
    	    }, 1000);
    	    mainForm.submit();
    	    
    	});

    	$("#btn2D").click(function (e) {

    	    e.preventDefault();
    	    $(".Button2D3D").removeClass("Active");
    	    $(this).addClass("Active");
    	    if ($("#hdnFld2DOr3D").val() != "2D") {
    	        $("#hdnFld2DOr3D").val("2D");
    	        setTimeout(function () {
    	            $("#hdnFld2DOr3D").val("3D");
    	            $(".Button2D3D").removeClass("Active");
    	            $(".Button2D3D.button3D").addClass("Active");
    	        }, 1000);
    	        mainForm.submit();
    	        
    	    }
    	});

	    $("#btn3D").click(function (e) {
	       
	        e.preventDefault();
	        $(".Button2D3D").removeClass("Active");
	        $(this).addClass("Active");
	        if ($("#hdnFld2DOr3D").val() != "3D") {
	            $("#hdnFld2DOr3D").val("3D");
	            setTimeout(function () {
	                $("#hdnFld2DOr3D").val("2D");
	                $(".Button2D3D").removeClass("Active");
	                $(".Button2D3D.button2D").addClass("Active");
	            }, 1000);
	            mainForm.submit();
	            
	        }
	    });

	    if (annotationTool.fld2DOr3D == "3D") {
	        $(".Button2D3D").removeClass("Active");
	        $("#btn3D").addClass("Active");
	    }
	    else {
	        $(".Button2D3D").removeClass("Active");
	        $("#btn2D").addClass("Active");
	    }

	    $("#btnSave").click(function(e){
	    	e.preventDefault();
	    	annotationTool.saveAnnotation();
	    })
	    if (annotationTool.role == 1) {
	        $("#btnSave").hide();
	    }

	    $("#btnPrint").click(function (e) {
	        e.preventDefault();
	        //var win = window.open('../FullScreen/Report.aspx?OrderID=' + annotationTool.orderId + '&IsPrint=true&IsSinglePage=true');
	    });

	    $("#btnDwn").click(function (e) {
	        e.preventDefault();
	        //var win = window.open('../FullScreen/Report.aspx?OrderID=' + annotationTool.orderId + '&IsPrint=false&IsSinglePage=false');
	    });

	    $("#btnZoomIn").click(function(e){
	        e.preventDefault();
	        annotationTool.zoomPlus(0.2);
	    });

	    $("#btnZoomOut").click(function(e){
	        e.preventDefault();
	        annotationTool.zoomPlus(-0.2);
	    });

	    $("#mainPanel").bind("pinch",function(e, s){
	    	e.preventDefault();
	    	e.stopPropagation();

	    	if(Math.abs(s.scale-1)>0.2){
		        if(s.scale-1>0){
		        	annotationTool.zoomPlus(0.04);
		        }
		        else{
		        	annotationTool.zoomPlus(-0.04);
		        }
		    }
	        //alert(s.scale);
	    });

	    var zooming = false;
	    jqCanvas.parent().mousewheel(function(e){
	    	var delta = e.deltaY;
	    	zoom(delta);
			e.stopPropagation();
		    
	    });

	    function zoom(delta){
	    	if(!zooming){
	    		zooming = true;
	    		setTimeout(function(){zooming=false;}, 100);
		    	//console.log("delta: " + delta + "mili: " + ((new Date())*1));
		    	if(delta>0){
		    		annotationTool.zoomPlus(0.08);
		    	}
		    	else{
		    		annotationTool.zoomPlus(-0.08);
		    	}

			}
	    }

	    
	    window.onbeforeunload = function () {
	        if (annotationTool.role!=1 && annotationTool.hasUnSavedData) {
	            return "You have some unsaved changes please save them before navigating away.";
	        }
	    }

		enableFullScreen();

	    //add event listner to resize canvas every time browse size changes
	    $(window).resize(resizeCanvas);
	    resizeCanvas();
	}

	function isFullScreen(){
		return document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen;
	}

    function resizeCanvas(){
    	var canvasHeight = $(window).innerHeight() - jqCanvas.offset().top;
    	var canvasWidth = $.fullscreen.isFullScreen()?screen.width:rightPanel.offset().left - 3;

    	annotationTool.resizeCanvas(canvasHeight, canvasWidth);

    	var commHeight = jqBrandDiv.offset().top-jqComments.offset().top;
    	jqComments.height(commHeight);
    }

    var enableFullScreen = function() {
		
		$('#btnFscreen').click(function(e) {
			e.preventDefault();
			$('#mainPanel').fullscreen();
		});

		// exit fullscreen
		$('#btnExitFs .buttonFscreen').click(function(e) {
			e.preventDefault();
			$.fullscreen.exit();
			
		});

		// document's event
		$(document).bind('fscreenchange', function(e, state, elem) {
			resizeCanvas();
			if ($.fullscreen.isFullScreen()) {
				$('#btnExitFs').show();
			} else {				
				$('#btnExitFs').hide();
			}

		});
	};

}





