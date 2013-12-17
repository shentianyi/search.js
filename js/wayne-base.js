var GLOBAL = GLOBAL || {};
//保持event兼容性
function adapt_event(event) {
     var e = event ? event : window.event;
     var target = e.target ? e.target : e.srcElement;
     return {
          event : e,
          target : target
     }
}

//阻止冒泡事件
function stop_propagation(event) {
     var e = adapt_event(event);
     var event = e.event;
     if(event.stopPropagation) {
          event.stopPropagation();
     } else {
          event.cancelBubble = true;
     }
}

//从月份转化为季度
if(!Date.prototype.monthToQuarter) {
     Date.prototype.monthToQuarter = function() {
          switch(Math.floor(this.getMonth()/3)) {
               case 0:
                    return 1;
                    break;
               case 1:
                    return 2;
                    break;
               case 2:
                    return 3;
                    break;
               case 3:
                    return 4;
                    break;
          }
     }
}
//化为标准格式显示用
if(!Date.prototype.toWayneString) {
     Date.prototype.toWayneString = function() {
          var second = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
          var minute = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
          var hour = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
          var day = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
          var month = this.getMonth() + 1 < 10 ? "0" + (this.getMonth() + 1) : this.getMonth() + 1;
          var year = this.getFullYear();
          return {
               second : year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second,
               minute : year + "-" + month + "-" + day + " " + hour + ":" + minute,
               hour : year + "-" + month + "-" + day + " " + hour + ":00",
               day : year + "-" + month + "-" + day,
               week : year + "-" + month + "-" + day,
               month : year + "-" + month,
               quarter : year + "-" + month,
               year : year.toString()
          }
     }
}
//yy-mm-dd hh:ii格式解析
function standardParse(date_value) {
     var date_value = (date_value.replace(/\s/g, "-").replace(/:/g, "-").replace(/T/g, "-")).split("-");
     var date_template = {
          "0" : '0000',
          "1" : '00',
          "2" : '01',
          "3" : '00',
          "4" : '00'
     };
     for(var i = 0; i < date_value.length; i++) {
          date_template[i.toString()] = date_value[i];
     }
     if(date_template["1"] != "00") {
          date_template["1"] = (parseInt(date_template["1"]) - 1).toString();
     }
     return {
          date : new Date(date_template["0"], date_template["1"], date_template["2"], date_template["3"], date_template["4"]),
          template : date_template
     }
}

function clearNoNumZero(obj) {
     //先把非数字的都替换掉，除了数字和.
     obj.value = obj.value.replace(/[^\d.]/g, "");
     //必须保证第一个为数字而不是.
     obj.value = obj.value.replace(/^\./g, "");
     //保证只有出现一个.而没有多个.
     obj.value = obj.value.replace(/\.{2,}/g, ".");
     obj.value = obj.value.replace(/^0{2,}/g, "0");
     obj.value = obj.value.replace(/^0\d+/g, "0");
     //保证.只出现一次，而不能出现两次以上
     obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
}

//只能输入正整数
function integerOnly(obj) {
     obj.value = obj.value.replace(/\D/g, "");
     obj.value = obj.value.replace(/^0+/g, "");
}

//获取窗口可视部分的宽、高
function inner_size() {
     var width, height
     if(window.innerWidth)
          width = window.innerWidth;
     else if(document.body.clientWidth)
          width = document.body.clientWidth;
     if(window.innerHeight)
          height = window.innerHeight;
     else if(document.body.clientHeight)
          height = document.body.clientHeight;
     return {
          height : height,
          width : width
     }
}

//得到日期，登出该日期所在周的最后一天的日期以及年份
function last_date_of_week(date_value) {
     var date = new Date(date_value), endDate;
     if(date.getDay() == 0) {
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     } else {
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
     }
     return {
          date : endDate,
          year : endDate.getFullYear()
     }
}

//得到日期，返回所在周
if(!Date.prototype.toWeekNumber) {
     Date.prototype.toWeekNumber = function() {
          this.setHours(0, 0, 0);
          this.setDate(this.getDate() + 4 - (this.getDay() || 7));
          var yearStart = new Date(this.getFullYear(), 0, 1);
          var weekNo = Math.ceil((((this - yearStart) / 86400000) + 1) / 7);
          return weekNo;
     }
}
//compare time,return first and last
function compare_time(begin_time, end_time) {
     var begin = standardParse(begin_time).date - standardParse(end_time).date <= 0 ? begin_time : end_time;
     var end = standardParse(begin_time).date - standardParse(end_time).date >= 0 ? begin_time : end_time;
     return {
          begin : begin,
          end : end
     }
}

//深度拷贝
function deepCopy(p, c) {
     var c = c || {};
     for(var i in p) {
          if( typeof p[i] == 'object') {
               c[i] = (p[i].constructor == Array) ? [] : {};
               deepCopy(p[i], c[i])
          } else {
               c[i] = p[i]
          }
     }
     return c
}

//////////////////////////////////////////////////////  固定光标位置
(
     function($) {
          $.fn.getCursorPosition = function() {
               var input = this.get(0);
               if(!input)
                    return;
               // No (input) element found
               if('selectionStart' in input) {
                    // Standard-compliant browsers
                    return input.selectionStart;
               } else if(document.selection) {
                    // IE
                    input.focus();
                    var sel = document.selection.createRange();
                    var selLen = document.selection.createRange().text.length;
                    sel.moveStart('character', -input.value.length);
                    return sel.text.length - selLen;
               }
          }
     })(jQuery);
function setSelectionRange(input, selectionStart, selectionEnd) {
     if(input.setSelectionRange) {
          input.focus();
          input.setSelectionRange(selectionStart, selectionEnd);
     } else if(input.createTextRange) {
          var range = input.createTextRange();
          range.collapse(true);
          range.moveEnd('character', selectionEnd);
          range.moveStart('character', selectionStart);
          range.select();
     }
}

function setCaretToPos(input, pos) {
     setSelectionRange(input, pos, pos);
}

/////////////////////////////////////////////////////////////////////
//Message box
function MessageBox(str, position, type) {
     $('#MessageBox').attr("class", "");
     $('#MessageBox').addClass(type).addClass(position).addClass("message-box").find("p").html(str);
     $('#MessageBox').slideDown("2500");
     setTimeout(function() {
          $("#MessageBox").slideUp("2500");
     }, 2500)
}

//Message box with content
function MessageBox_content(content) {
     var i, content = content, all_array = [], show_text;
     for(i in content) {
          all_array = all_array.concat(content[i]);
     }
     show_text = all_array.join("</br>");
     MessageBox(show_text, "top", "warning")
}

//loader
function loader(id) {
     if(id == "body") {
          $("body").append($("<div />").attr("id", "loader").addClass('ui active loader medium text').text('loading'));
     } else {
          $("#" + id).append($("<div />").attr("id", "loader").addClass('ui active loader medium text').text('loading'));
     }
     if(arguments.length > 1) {
          $("#" + id).find(".loader").css("top", arguments[1]).css("right", arguments[2]).css("bottom", arguments[3]).css("left", arguments[4])
     }
}

function remove_loader() {
     $("#loader").remove();
}

//激活所有的radio和ccheckbox
//$('.ui.checkbox').checkbox();
//autoComplete
//(add class 'autoComplete' to the outer div wrapping input,you need #autoComplete-call)
GLOBAL.autoComplete = {};
GLOBAL.autoComplete.count = 0;
(function() {
     $("body").on("keyup", ".autoComplete input", function(event) {
          var e = adapt_event(event).event, validate = false;
          var $input = $(this);
          var auto_complete = $input.attr("autocomplete");
          if(auto_complete != "tags") {
               $input.attr("ishould", "BeSelected");
          }
          //down
          if(e.keyCode == 40) {
               if($.trim($(adapt_event(event).target).val()).length > 0) {
                    if($("#autoComplete-call ul").find(".active").length == 0) {
                         $("#autoComplete-call ul li").eq(0).addClass("active");
                    } else {
                         if($("#autoComplete-call ul").find(".active").next().length == 0) {
                              $("#autoComplete-call ul").find(".active").removeClass("active");
                              $("#autoComplete-call ul li").eq(0).addClass("active");
                         } else {
                              $("#autoComplete-call ul").find(".active").removeClass("active").next().addClass("active")
                         }
                         var activeTop = parseInt($("#autoComplete-call ul li.active").offset().top), outerTop = parseInt($("#autoComplete-call").offset().top), maxHeight = parseInt($("#autoComplete-call").css("maxHeight"));
                         if(activeTop - outerTop + 8 >= maxHeight) {
                              var origin_top = $("#autoComplete-call").scrollTop()
                              $("#autoComplete-call").scrollTop(origin_top + 18);
                         } else if(activeTop < outerTop) {
                              $("#autoComplete-call").scrollTop(0);
                         }
                    }

                    validate = true;
               }

          }
          //up
          else if(e.keyCode == 38) {
               if($.trim($(adapt_event(event).target).val()).length > 0) {
                    if($("#autoComplete-call ul").find(".active").length == 0) {
                         var count = $("#autoComplete-call ul li").length;
                         $("#autoComplete-call ul li").eq(count - 1).addClass("active");
                    } else {
                         if($("#autoComplete-call ul").find(".active").prev().length == 0) {
                              $("#autoComplete-call ul").find(".active").removeClass("active");
                              var count = $("#autoComplete-call ul li").length;
                              $("#autoComplete-call ul li").eq(count - 1).addClass("active");
                         } else {
                              $("#autoComplete-call ul").find(".active").removeClass("active").prev().addClass("active")
                         }
                         var activeTop = parseInt($("#autoComplete-call ul li.active").offset().top), outerTop = parseInt($("#autoComplete-call").offset().top), maxHeight = parseInt($("#autoComplete-call").css("maxHeight")), realHeight = $("#autoComplete-call").prop("scrollHeight"), itemHeight = parseInt($("#autoComplete-call ul li").eq(0).height());
                         if(activeTop <= outerTop) {
                              var origin_top = $("#autoComplete-call").scrollTop()
                              $("#autoComplete-call").scrollTop(origin_top - 18);
                         } else if(realHeight - (activeTop - outerTop) - itemHeight <= 3) {
                              $("#autoComplete-call").scrollTop("999");
                         }

                    }
                    validate = true;
               }
          }
          //除去left and right
          else if(e.keyCode != 37 && e.keyCode != 39 && e.keyCode != 13) {
//               window.setTimeout(function(){
//                  $("#autoComplete-call>ul").empty();
//               },100);
               GLOBAL.autoComplete.count++;
               var $this = $(adapt_event(event).target).parents(".autoComplete").eq(0);
               var $my = $(adapt_event(event).target);
               window.setTimeout(function() {
                    if(GLOBAL.autoComplete.count > 1) {
                         GLOBAL.autoComplete.count--;
                         return;
                    } else {
                         GLOBAL.autoComplete.count--;
                         if($.trim($my.val()).length == 0) {
                              $("#autoComplete-call").css("left", "-999em").attr("target", "");
                         } else {
                              if($this.hasClass("customAutoHeight")) {
                                   var max_height = $this.attr("autoMaxHeight");
                                   $("#autoComplete-call").css("maxHeight", max_height)
                              } else {
                                   $("#autoComplete-call").css("maxHeight", "110px")
                              }
                              $("#autoComplete-call").css("maxHeight", "110px");
                              var width = parseInt($this.css("width")), left = $this[0].getBoundingClientRect().left, top = $this[0].getBoundingClientRect().bottom, target = $my.attr("id");
                              //post
                              var value = $.trim($my.val());
                              if(auto_complete.split(",")[0] == "courses") {
                                   var courses = auto_complete.split(",");
                                   var institution_id = $(".select-institution:visible .item.active").attr("value");
                                   var type = $("#autoComplete-call .active").attr("type");
                                   $.get("/" + courses[0] + "/" + courses[1] + "_search", {
                                        q : value,
                                        institution_id : institution_id
                                   }, function(data) {
                                        var $target = $("#autoComplete-call>ul");
                                        if(data.length > 0) {
                                             $("#autoComplete-call>ul").empty();
                                             var data = {
                                                  data : data
                                             };
                                             var render = Mustache.render("{{#data}}<li id='{{id}}' type='{{type}}'>" + "<p>{{name}}</p>" + "<p>{{info}}</p>" + "</li>{{/data}}", data);
                                             $target.append(render);

                                        } else {
                                             $("#autoComplete-call>ul").empty();
                                             $target.append($("<p />").addClass("no_match").text("没有匹配内容..."))
                                        }
                                   });
                              }
                              else if(auto_complete=="experiment"){

                              }
                              else {
                                   $.get("/" + auto_complete + "/fast_search", {
                                        q : value
                                   }, function(data) {
                                        var $target = $("#autoComplete-call>ul");
                                        if(data.length > 0) {
                                             $("#autoComplete-call>ul").empty();
                                             var data_template={my_data:data}
                                            var render = Mustache.render("{{#my_data}}<li id='{{id}}' type='{{type}}' logininfo_id='{{logininfo_id}}'>" +
                                                "<p>{{name}}</p>" + "<p>{{info}}</p>" +
                                                "</li>{{/my_data}}", data_template );
                                            $target.append(render);
                                        } else {
                                             $("#autoComplete-call>ul").empty();
                                             $target.append($("<p />").addClass("no_match").text("没有匹配内容..."))
                                        }
                                   });
                              }
                              $("#autoComplete-call").css("width", width - 2).css("left", left).css("top", top).attr("target", target);
                              $(window).resize(function() {
                                   var width = parseInt($this.css("width")), left = $this[0].getBoundingClientRect().left, top = $this[0].getBoundingClientRect().bottom;
                                   $("#autoComplete-call").css("width", width - 2).css("left", left).css("top", top);
                              });
                         }
                    }
               }, 100)
          }
          if(validate) {
               var text = $("#autoComplete-call ul").find(".active>p:first-of-type").text();
               $(document.activeElement).val(text);
          }
     });
     $("body").on("blur", ".autoComplete input", function() {
          var $this = $(this);
          window.setTimeout(function() {
               $("#autoComplete-call").css("left", "-999em").attr("target", "")
          }, 200);
     });
     $("body").on("click", "#autoComplete-call li", function() {
          // item added

          var target = $("#autoComplete-call").attr("target");
          if(!$(this).hasClass("active")) {
               $(this).siblings().removeClass("active");
               $(this).addClass("active");
          }
          var text = $("#autoComplete-call ul").find(".active>p:first-of-type").text();
          $("#" + target).focus().val(text);
          if($("#" + target).attr("im") == "label") {
               var $this = $("#" + target);
               var value = $.trim($this.val());
               var id = $("#autoComplete-call").find(".active").attr("id");
               var type = $("#autoComplete-call").find(".active").attr("type");
               var logininfo_id = $("#autoComplete-call").find(".active").attr("logininfo_id");
               var data = {
                    data : {
                         id : id,
                         value : value,
                         type : type,
                         logininfo_id : logininfo_id
                    }
               };
               var msg = {
                    result : true,
                    id : data.data.id,
                    callback : null
               };
               $(this).trigger('click_add', [msg]);
               if(msg.result) {
                    if(msg.callback) {
                         msg.callback(data);
                    }
                    var render = Mustache.render("{{#data}}<li><div class='ui label' id='{{id}}' type='{{type}}'  logininfo_id='{{logininfo_id}}'>{{value}}<i class='delete icon'></i></div></li>{{/data}}", data);
                    $this.parent().before(render);
               }
               $this.val("");
          }
         else if($("#" + target).attr("autocomplete")=="experiment"){

          }
     });
})();
//labelForm
//(add class 'labelForm' to the outer div wrapping ul and add class 'specialInput' to decorate)
(function() {
     $(".labelForm").each(function() {
          var $input = $(this).find("input");
          var max_width = parseInt($(this).css("width")) * 0.45;
          $input.css("width", max_width).css("maxWidth", "999em");
     });
     $("body").on("click", ".labelForm", function() {
          $(this).find("input").focus();
          var value = $(this).find("input").val();
          $(this).find("input").val(value);
     });
     $("body").on("keydown", ".labelForm input", function(event) {
          $(this).attr("im", "label");
     });

     $("body").on("click", ".labelForm .delete.icon", function() {
          var msg = {
               result : true
          };  
          $(this).trigger('click_remove', [msg]);
          if(msg.result) {
               $(this).parents("li").eq(0).remove();
          }
     });
})();
//针对所有input一个检测

(function() {
     $("body").on("keyup", "input[type='text']", function(event) {
          var e = adapt_event(event).event, $input = $(this);
          if(e.keyCode == 32) {
               if($.trim($input.val()).length == 0) {
                    e.preventDefault();
                    $input.val("");
               } else {
                    if($input.attr("im") == "label" && $input.attr("ishould") == "BeSelected") {
                         if($("#autoComplete-call").find(".active").length > 0) {
                              var value = $.trim($input.val());
                              var id = $("#autoComplete-call").find(".active").attr("id");
                              var type = $("#autoComplete-call").find(".active").attr("type");
                              var logininfo_id = $("#autoComplete-call").find(".active").attr("logininfo_id");
                              var data = {
                                   data : {
                                        id : id,
                                        value : value,
                                        type : type,
                                        logininfo_id : logininfo_id
                                   }
                              };
                              // var render = Mustache.render("{{#data}}<li><div class='ui label' type='{{type}}' id='{{id}}' logininfo_id='{{logininfo_id}}'>{{value}}<i class='delete icon'></i></div></li>{{/data}}", data);
                              // $input.parent().before(render);
                              //

                              var msg = {
                                   result : true,
                                   id : data.data.id,
                                   callback : null
                              };
                              $("#autoComplete-call").find(".active").trigger('click_add', [msg]);
                              if(msg.result) {
                                   if(msg.callback) {
                                        msg.callback(data);
                                   }
                                   var render = Mustache.render("{{#data}}<li><div class='ui label' id='{{id}}' type='{{type}}'  logininfo_id='{{logininfo_id}}'>{{value}}<i class='delete icon'></i></div></li>{{/data}}", data);
                                   $input.parent().before(render);
                                   $input.val("");
                                   $("#autoComplete-call").css("left", "-999em").attr("target", "");
                              }

                         }
//                         else {
//                              MessageBox("请在下拉提示菜单中选择一条", "top", "warning");
//                         }
                    } else if($input.attr("im") == "label") {
                         var value = $.trim($input.val());
                         $input.parent().before($("<li />").append($("<div />").addClass("ui label").text(value).append($("<i />").addClass("delete icon"))));
                         $input.val("");
                    }
               }

          } else if(e.keyCode == 13) {
               if($.trim($input.val()).length == 0) {
                    e.preventDefault();
                    $input.val("");
               } else {
                    if($input.attr("im") == "label" && $input.attr("ishould") == "BeSelected") {
                         if($("#autoComplete-call").find(".active").length > 0) {
                              var value = $.trim($input.val());
                              var id = $("#autoComplete-call").find(".active").attr("id");
                              var type = $("#autoComplete-call").find(".active").attr("type");
                              var logininfo_id = $("#autoComplete-call").find(".active").attr("logininfo_id");
                              var data = {
                                   data : {
                                        id : id,
                                        value : value,
                                        type : type,
                                        logininfo_id : logininfo_id
                                   }
                              };
                              // var render = Mustache.render("{{#data}}<li><div class='ui label' type='{{type}}' id='{{id}}'  logininfo_id='{{logininfo_id}}'>{{value}}<i class='delete icon'></i></div></li>{{/data}}", data);
                              // $input.parent().before(render);
                              // $("#autoComplete-call").css("left", "-999em").attr("target", "");
                              $("#autoComplete-call").css("left", "-999em").attr("target", "");
                              var msg = {
                                   result : true,
                                   id : data.data.id,
                                   callback : null
                              };
                              $("#autoComplete-call").find(".active").trigger('click_add', [msg]);
                              if(msg.result) {
                                   if(msg.callback) {
                                        msg.callback(data);
                                   }
                                   var render = Mustache.render("{{#data}}<li><div class='ui label' id='{{id}}' type='{{type}}'  logininfo_id='{{logininfo_id}}'>{{value}}<i class='delete icon'></i></div></li>{{/data}}", data);
                                   $input.parent().before(render);
                                   $("#autoComplete-call").css("left", "-999em").attr("target", "");
                              }
                         }
                         $input.val("");
                    } else if($input.attr("im") == "label") {
                         var value = $.trim($input.val());
                         $input.parent().before($("<li />").append($("<div />").addClass("ui label").text(value).append($("<i />").addClass("delete icon"))));
                         $input.val("");
                         $("#autoComplete-call").css("left", "-999em").attr("target", "")
                    } else if($input.attr("ishould") == "BeSelected") {
                         if($("#autoComplete-call").find(".active").length > 0) {
                              $("#autoComplete-call").css("left", "-999em").attr("target", "")
                         } else {
                              MessageBox("请在下拉提示菜单中选择一条", "top", "warning");
                         }
                    }
               }
          }
     });
})()
