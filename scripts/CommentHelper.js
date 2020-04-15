var CommentHelper = jsface.Class(function () {
    var commentsDiv;
    var commentTemp;
    var annTool = null;

    var ellipsize = function (txtSpan) {
        txtSpan.ellipsis({
            row: 2,
            callback: function (ellipsized) {
                var more = $(this).closest(".comment").find(".more");

                if (ellipsized) {
                    more.show();
                    more.removeClass("less")
                    .attr("alt", "See full comment")
                    .attr("title", "See full comment");
                }
                else {
                    more.hide();
                }

            }
        });
    };




    return {
        $singleton: true,
        activateComment: function (element, doNotFocus) {

            if (annTool == null) {
                annTool = AnnotationTool.getInstance();
            }


            if (!commentsDiv) {
                commentsDiv = $("#comments");
            }

            var commentDiv = $("#comment-" + element.id);
            if (commentDiv.length == 0) {
                if (!commentTemp) {
                    commentTemp = $("#temp", commentsDiv);
                }
                commentDiv = commentTemp.clone();
                commentDiv.data("AnnotationElement", element);
                commentDiv.attr("id", "comment-" + element.id);

                if (!element.comment) {
                    element.comment = {};
                    element.comment.elementId = element.id;
                    element.comment.text = "";
                    element.comment.createdBy = annTool.userId;
                    element.comment.createdById = annTool.userId;
                    element.comment.createdByName = annTool.userName;
                    element.comment.createdOn = (new Date()).format("dd-MM-yyyy hh:mm tt");
                }


                $(".text", commentDiv).text(element.comment.text);
                $("textarea", commentDiv).text(element.comment.text);
                $(".chkTaskCompleted", commentDiv)[0].checked = (element.comment.statusId == 2);
                if (annTool.role == 1 && element.comment.statusId == 2) {
                    commentDiv.addClass("completed");
                }

                $(".titleWrapper .username", commentDiv).text(element.comment.createdByName);
                $(".commentDate .date", commentDiv).text(element.comment.createdOn);


                $(".sn span", commentDiv).text(element.elemOrder);


                $(".more", commentDiv).click(function (e) {
                    var commDiv = $(this).closest(".comment");
                    var txtSpan = $(".text", commDiv);
                    e.preventDefault();
                    e.stopPropagation();
                    if ($(this).hasClass("less")) {
                        $(this).removeClass("less")
                        .attr("alt", "See full comment")
                        .attr("title", "See full comment");
                        txtSpan.text($("textarea", commDiv).val());
                        ellipsize(txtSpan);
                    }
                    else {

                        $(this).addClass("less")
                        .attr("alt", "See less comment")
                        .attr("title", "See less comment");
                        txtSpan.text(commDiv.data("AnnotationElement").comment.text);
                    }
                });


                if (annTool.role == 1) {
                    $(".delete", commentDiv).hide();
                    $(".chkTaskCompleted", commentDiv).change(function (e) {
                        e.stopPropagation();
                        annTool.showLoading(true);
                        var elem = $(this).closest(".comment").data("AnnotationElement");
                        var newStatus = this.checked ? 2 : 1;
                        var me = this;
                        ApiCaller.call("changeTaskStatus",
                            { annotationId: annTool.id, elementId: elem.id, newStatus: newStatus },
                            function (data, errMsg) {
                                if (data) {
                                    if (me.checked) {
                                        commentDiv.addClass("completed");
                                    }
                                    else {
                                        commentDiv.removeClass("completed");
                                    }

                                    //alert("Status changed successfully");
                                }
                                else {
                                    me.checked = !me.checked;
                                    alert("Error when changing status: " + errMsg);
                                }
                                annTool.showLoading(false);
                            });
                    });
                }
                else {
                    $(".chkTaskCompleted", commentDiv).hide();
                    $(".delete", commentDiv).click(function (e) {
                        e.preventDefault();
                        var del = confirm("Are you sure you want to delete this annotation item?");
                        if (del) {
                            var commDiv = $(this).closest(".comment");
                            var elem = commDiv.data("AnnotationElement");
                            annTool.removeElement(elem);
                            annTool.hasUnSavedData = true;
                        }

                    });
                }





                $("textarea", commentDiv).change(function (e) {

                    var commDiv = $(this).closest(".comment");
                    var elem = commDiv.data("AnnotationElement");


                    elem.comment.text = $(this).val();


                    var txtSpan = $(".text", commDiv);
                    $("a", txtSpan).remove();
                    txtSpan.text(elem.comment.text);

                    annTool.hasUnSavedData = true;

                });

                $("textarea", commentDiv).blur(function (e) {
                    var commDiv = $(this).closest(".comment");
                    var elem = commDiv.data("AnnotationElement");
                    //console.log("blur " + elem.elemOrder);
                    	var strTemp = "Active elem: " + (annTool.getActiveElement()?annTool.getActiveElement().elemOrder: "null") + " Blur elem: " + elem.elemOrder;
                        if (annTool.getActiveElement() == elem) {
							
							//console.log("active element same");
                            setTimeout(function () {
                                if(annTool.getActiveElement() == elem && annTool.isCanvasClicked){
                                    $("textarea", commDiv).focus();
									//console.log("focus inside canvas or comment div " + strTemp);
                                }
                                else{
									//console.log("focus outside canvas and comment div " + strTemp);
                                    CommentHelper.isValid(elem);
                                    $("textarea", commDiv).hide();
                                    $("span.text", commDiv).text($("textarea", commDiv).val());
                                    $("span.text", commDiv).show();
                                    commDiv.removeClass("active");
                                    if (annTool.getActiveElement() == elem) {
                                        annTool.setActiveElement(null);
                                        annTool.selectElement(null);
                                    }
                                    ellipsize($("span.text", commDiv));
                                }
                            }, 300);
                        }
                        else {
							//console.log("Active element different " + strTemp);
                            CommentHelper.isValid(elem);
                            $("textarea", commDiv).hide();
                            $("span.text", commDiv).text($("textarea", commDiv).val());
                            $("span.text", commDiv).show();
							
							if(annTool.getActiveElement()==null){
                            	$(".comment", commentsDiv).removeClass("active");
							}else{
								commDiv.removeClass("active");
							}
							
							
                            if (annTool.getActiveElement() == elem) {
                                annTool.setActiveElement(null);
                            }
                            ellipsize($("span.text", commDiv));
                        }
                    

                });

                commentDiv.click(function (e) {
					//e.preventDefault();
					//e.stopPropagation();
                    var commDiv = $(this).closest(".comment");
                    var elem = commDiv.data("AnnotationElement");
                    annTool.selectElement(elem);
                });

                commentsDiv.append(commentDiv);
                commentDiv.show();


            }



            if (!doNotFocus) {
                setTimeout(function () {
                    if (annTool.role == 2) {
                        //$("textarea", commentsDiv).hide();
                        //$("span.text", commentsDiv).show();
                        $("span.text", commentDiv).hide();
                        //$("textarea:visible", commentsDiv).blur();
                        $("textarea", commentDiv).show().focus();
                        $(".more", commentDiv).hide();

                    }
                    else {

                        $("textarea", commentsDiv).hide();
                        $("span.text", commentDiv).show();
                    }

                    commentsDiv.find(".comment.active").removeClass("active");
                    commentDiv.addClass("active");
					//console.log("active class added to " + element.elemOrder);
                    commentDiv[0].scrollIntoView(true);
                }, 100);
            }
            else {
                $("textarea", commentDiv).hide();
                $("span.text", commentDiv).show();
            }





        },
        deactivateComment: function () {
            $(".comment", commentsDiv).removeClass("active");
        },
        remove: function (element) {
            var commentDiv = $("#comment-" + element.id);
            commentDiv.remove();
        },
        setOrder: function (element) {
            var commentDiv = $("#comment-" + element.id);
            $(".sn span", commentDiv).text(element.elemOrder);
        },
        isValid: function (element) {
            var isValid = element.comment && element.comment.text && element.comment.text != "";
            var commentDiv = $("#comment-" + element.id);
            if (isValid) {
                commentDiv.removeClass("invalid");
            }
            else {
                commentDiv.addClass("invalid");
            }
            return isValid;
        },
        ellipsizeAll: function () {
            $(".comment:not(#temp) span.text:visible", commentsDiv).each(function () {
                var span = $(this);
                var textArea = span.closest(".comment").find("textarea");
                span.text(textArea.val());
                ellipsize(span);
            });
        }
    };
});


Date.prototype.format = function (format) //author: meizz
{
    var hours = this.getHours();
    var ttime = "AM";
    if(format.indexOf("t") > -1 && hours > 12)
    {
        hours = hours - 12;
        ttime = "PM";
    }

    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": hours,   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds(), //millisecond,
        "t+": ttime
    }

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
              RegExp.$1.length == 1 ? o[k] :
              ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
