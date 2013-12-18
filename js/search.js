/**
 * User: Tianyi
 * Date: 13-12-9
 * Time: 下午4:46
 * BT搜索引擎的前端辅助方法。
 * 搜索引擎的使用方法
 * 页面应该包括如下参数： type 是全文还是精确搜索； entity：搜索对象
 * 在进行搜索时，页面应保存已经输入的条件，在最终确定后将这些条件转化为标准的形势传入后台获取最终结果
 * 有一个DIV显示已经完成的搜索条件，搜索条件可以被删除或者修改
 *
 *
 */


//class Search
// use create_new to init a new Search object
// for example: var obj = Search.create_new();
//obj.query = ...
// load the parent class's create_new in the same pattern to inheritage
//define a same level var as the search var to define a private variable


//query type object:
// {name:string,introduction:string,parameter_type:'String',query_type:string,is_explicit:boolean}
 //String_Array,Number_Array,Time_Span_Array,DateTime,Timespan,String,Number,Boolean


var Search = {
    //constructor
    private_instance: null,

    //singleton methods
    instance:function(){
        if(!this.private_instance){
            this.private_instance = this.create_new()
        }
       return this.private_instance;
    },

    create_new: function(){

        //private

        //public
        var search = {};

        search.queries = {};

        search. current_mode = 'full_text';

        search.entity = "";

        search.query_types = {};


        //buffer query types from server.Buffer into the local storage if possible
        //{"key":[],"kk":[]}
        search.query_types_buffered = {};

        //a query type obj
        search.current_query = null

        ;
        /*
        *UI
         */
        //the input controller
        search.input = null;

        //the list controller
        search.query_list = null;

        search.search_control=null;

        search.query_container=null;


        //change the behavior of the input control
        search.switch_mode = function(mode,options){
            var result = false;
            if ($.inArray(mode,['full_text','select_query','conditions'])>=0){
                switch(this.current_mode){
                    case "full_text":
                        if(mode=="select_query"){
                           result=true;
                        }
                        break;
                    case 'select_query':
                        if(mode=="conditions"){
                            result=true;
                        }
                        else if(mode=="full_text"){
                            this.cast_queries();
                            result = true
                        }
                        break;
                    case 'conditions':

                        if(mode=="full_text"){
                            this.cast_queries();
                            this.current_query = null;
                            result =  true;
                        }
                        else if(mode=="conditions"){
                            result = true;
                        }
                        else if(mode=="select_query"){
                            this.current_query = null;
                            result=  true;
                        }
                        break;
                }
                //bind event
                if(result) {
                    this.bind(mode);

                    if (options && options["notice"]){
                        this.set_notice(options["notice"]);
                    }
                    else {
                        this.set_notice(this.notice[mode]);
                    }

                    this.current_mode = mode;
                }

                this.input.val("");
                this.input.focus();
            }
        };




        search.cast_queries = function(){
            this.queries = {};
            this.query_list.remove();
            this.query_container.append(this.template.query_list);
            this.query_list = $('#query_list');
        };






        //handler when certain query is selected
        //search.query_selected = function(query){
        //    if(this.current_mode=='select_query')
        //    this.current_query = query;
        //    this.switch_mode("conditions")
        //};


        //set the proper notification when switch the mode
        search.set_notice = function(txt){
            this.input.attr("placeholder",txt);
        };


        search.notice={
            full_text:"输入任意的关键字查询" ,
            select_query:"输入你想搜索的条件，比如名字，详细条件清单点下面的提示获得",
            conditions:"输入你要限定的条件"
        };


        //change the event of the input controller on runtime. Three modes: select_query, conditions, full text
        search.handler = {

            full_text: function(event){
                if(event.which==13){alert("还未完成,通讯服务器获得数据");}
                else if(event.which==51){
                    if(this.value.length==1){
                        event.data.obj.switch_mode("select_query");
                        WAYNE.change_mode(event,"select_query");
                    }
                }
            },

            select_query:function(event){
                //find buffer or get query and buffer it
                var obj = event.data.obj;
                if(event.which==51 && this.value.length==1){
                        event.data.obj.switch_mode("full_text");
                        WAYNE.change_mode(event,"full_text");
                }

                else if(event.which == 13){
//                    alert("还未完成，与服务器通讯，获得数据并帮定")
                }
                else if(event.which==40 || event.which==38){
                    //把方向键上下排除掉
                }
                else {

                    var buffer = obj.get_buffer(this.value);

                    if(!buffer){
                        obj.load_buffer(this.value,obj.bind_auto_complete);
                    }
                    else{
                        obj.bind_auto_complete(buffer,obj);
                    }
                }
            },

            conditions:function(event){
                //set the notification if necessary
                //when enter triggerred, switch mode to select_query
                //save the condition to container and UI container

                if(event.which==51 && this.value.length==1){
                    event.data.obj.switch_mode("full_text");
                    WAYNE.change_mode(event,"full_text");
                }
                else if(event.which==27){
                    //esc
                    event.data.obj.cancel();
                }
                else{
                    var context = event.data.obj;
                    if(event.which==13) {
                        var result = context.validate_condition();
                        if(result.success){
                            //bind query
                            context.bind_query();
                            context.current_query = null;
                            context.switch_mode("select_query");
                            WAYNE.change_mode(event,"select_query");
                        }
                        else{
                            context.show_warning(result.msg,"ERROR");
                        }
                    }
                }
            }
        };

        search.bind_query = function(){
            if(this.queries){
                this.queries = {};
            }
           this.queries[this.current_query["query_type"]]=this.get_conditions();
           this.query_list.find("#"+this.current_query["query_type"]).remove();
           this.query_list.append(this.template["query_item"]
              .replace(/!name!/g,this.current_query["name"])
              .replace(/!condition!/g,this.get_conditions())
              .replace(/!id!/g,this.current_query["query_type"]));

            //context.queries[context.current_query["query_type"]]= this.get_conditions();
        };

        search.get_conditions = function(){
            if(this.current_query){
              var parsed = this.condition_validator[this.current_query["parameter_type"]](this.input.val());
              if (parsed.success){
                  return parsed.result;
              }
            }
        };

       // String_Array,Number_Array,Time_Span,DateTime,String,Number
        search.condition_validator = {
            //always return {success:true/false,result:obj,msg:}

          string_array:function(condition_str){
             return {success:true,result:condition_str.split(/\s|,/)};
          },

          number_array:function(condition_str){
              var arr = condition_str.split(/[^0-9]+/);
              var suc = true;
              if(!arr || arr.length==0){
                  suc=false;
              }
              else{
                  for(var i in arr) {
                      if (!isFinite(arr[i])){
                          suc=false;
                      }
                  }
              }
              return {success:suc,result:arr,msg:"只能是数字"}
          },

          time_span:function(condition_str){

          },

          number_span:function(condition_str){
              var arr = condition_str.split(/[^0-9]+/);
              var suc = true;
              if(!arr ||arr.length != 2||!isFinite(arr[0]) || !isFinite(arr[1])) {
                  suc=false;
              }
              else{
                  arr = arr.sort();
              }
              return {success:suc,result:arr,msg:"只能是一个数字范围"}
          },

          date_time:function(condition_str){
              var date = new Date(Date.parse(condition_str));
              var suc = true;
              if( date== "Invalid Date"){
                   suc = false;
              }
              return {success:suc,result:date,msg:"只能是时间字符串"};
          },

          string:function(condition_str){
              return {success:true,result:condition_str.toString()};
          },

          number:function(condition_str){
              var result = {success:false,result:null,msg:"这个搜索条件只能接受数字"};
              if(isFinite(condition_str)){
                  result.success = true;
                  result.result = parseFloat(condition_str);
              }
              return result;
          }
        };


        //level:WARN,OK,ERROR
        search.show_warning = function(msg,level){
            alert(msg);
        };


        search.bind_auto_complete = function(data,obj){
            console.log(data);
            console.log(obj);
            //when a item is selected, should give the query object to current_query object and switch mode
            //to conditions

//            alert("bind_auto_complete is not finished");

            //put half second
            //here do something to generate the autocomplete

            var $target = $("#autoComplete-call>ul");
            if(data.length > 0) {
                $("#autoComplete-call>ul").empty();
                var data_template={my_data:data}
                var render = Mustache.render("{{#my_data}}<li name={{name}} is_explicit={{is_explicit}} query_type={{query_type}} parameter_type={{parameter_type}} introduction={{introduction}} query_type='{{query_type}}' >" +
                    "<p>{{introduction}}</p>"+
                    "</li>{{/my_data}}", data_template );
                $target.append(render);
            } else {
                $("#autoComplete-call>ul").empty();
                $target.append($("<p />").addClass("no_match").text("没有匹配内容..."))
            }
            //here to bind event to on_select_callback
            var obj=obj;
            var callback =  function(event){
                event.stopPropagation();
                console.log(event.data.obj);
                var obj=event.data.obj;
                var $target=$(this);
                var data={
                    name:$target.attr("name"),
                    introduction:$target.attr("introduction"),
                    parameter_type:$target.attr("parameter_type"),
                    query_type:$target.attr("query_type"),
                    is_explicit:$target.attr("is_explicit")
                };
                console.log(data);
                obj.current_query = data;
                if(!obj.query_types[obj.current_query['query_type']]){
                    obj.query_types[obj.current_query['query_type']] = obj.current_query;
                }
                obj.switch_mode("conditions",{notice:obj.current_query["introduction"]});
                WAYNE.change_to_select($("#autoComplete-call").attr("target"));
            };
            $("#autoComplete-call li").on("click",{obj:obj},callback);
            $("#autoComplete-call li").unbind("keyup").bind("keyup",{obj:obj},callback);

//            var on_select_callback = function(obj,data){
//                obj.current_query = data;
//                if(!obj.query_types[obj.current_query['query_type']]){
//                    obj.query_types[obj.current_query['query_type']] = obj.current_query;
//                }
//                obj.switch_mode("conditions",{notice:obj.current_query["introduction"]});
//            }

        };




        search.validate_condition = function(){
          return {success:true,msg:""};
        };

        search.get_buffer = function(key){
            if(!this.query_types_buffered) {this.query_types_buffered = {};}
              var mk_key = this.make_buffer_storage_key(this.entity,key);
            if(!this.query_types_buffered[mk_key]){
                if(window.localStorage){
                   if(localStorage[mk_key])
                       this.query_types_buffered[mk_key]= JSON.parse(localStorage[mk_key]);
                }
            }
                return this.query_types_buffered[mk_key];
        };

        search.make_buffer_storage_key = function(entity_name,key){
            return "QUERY_BUFFER_" + entity_name + "|" + key;
        };

        search.load_buffer = function(key,callback){
           // $.ajax(
             //   {success:function(){}} //write buffer, excute callback
            //);

//            alert("load_buffer has not been finished")

//            var data = [{name:"名字",introduction:"请输入s名字",parameter_type:'string',query_type:"StudentName",is_explicit:false}];
//
            var data = [{name:"按照名字查询",introduction:"输入学生的名字",parameter_type:'string',query_type:"StudentName",is_explicit:false},
                {name:"按监护人查找",introduction:"输入学生的监护人名字",parameter_type:'string',query_type:"StudentParent",is_explicit:false},
                {name:"按学校查询",introduction:"按学生的学校查找",parameter_type:'string',query_type:"StudentSchool",is_explicit:false}];


            this.query_types_buffered[this.make_buffer_storage_key(this.entity,key)]=data;
            localStorage[this.make_buffer_storage_key(this.entity,key)] =JSON.stringify(data);
            if (callback){
            callback(data,this);
            }
        };

        //save the condition combination as a view
        search.save = function(name){
            //save the user view

        };

        //init the input control and global parameter
        //type: the default mode of the input control
        //entity: which entity is searched
        //search_control: the selector of the input control
        //query_container: the selector of the query buffer area
        search.init = function(mode,entity,search_control,query_container){

            //1.put the input into the container
            this.search_control = $(search_control);
            this.search_control.append(this.template.input);
            this.input =   $('#search_input');
            //2. init the query container
            this.query_container =  $(query_container);
            this.query_container.append(this.template.query_list);
            this.query_list = $('#query_list');

            this.entity = entity;

            //3.change the input type
            this.current_mode = mode;

            this.switch_mode(mode);

            //4.bind the handle for one time
            this.bind(mode);

            //5. find the version number and compare the localstorage. If localstorage exists, return it.
           // if not in WIFI mode, in a smaller batch


            //6. wait for input
        };


        //bind the query_type_description to the input and
        // other possible controller. Invoke this function when a query type is selected
        search.bind = function(mode){
            //this.input.unbind("keyup");
            this.input.unbind("keyup").bind("keyup",{obj:this},this.handler[mode])
        };

        search.get_query_object = function(key){
          if (!this.get_buffer(key)){
              this.load_buffer(key);
          }
            return this.get_buffer(key);
        };

        //edit the conditions for a certain query
        search.edit = function(query_type){
            //add input text
            //set the current query to the query name
            //switch mode to conditions
            //delete the item from stored queries

            this.current_query = this.query_types[query_type];


            this.switch_mode("conditions",{notice:this.current_query["introduction"]});



            this.input.val(this.queries[query_type]);

            this.delete_query(query_type);
        };

        //re-init all the things when user cancel to input conditions for a query
        search.cancel= function(){
            //restore the select query mode
            this.current_query = null;
            this.switch_mode("select_query")
        };


        //delete a condition from the current combination
        search.delete_query = function(id){
            //remove from the hash
            //remove from the container
            this.queries[id]=null;
            this.query_list.find("#" + id).remove();
        };


        search.template = {
            input:"<input type='text' name='fname' class='search_input_class'" +
                "id='search_input'"+
                "placeholder='已经准备为您搜索一切,直接输入关键字开始搜索，或键入＃开始更为精确的搜索'/>",
            query_list:"<div id='query_list'></div>",
            query_item: "<div id='!id!'><span>!name!</span><span>!condition!</span><a href='#' onclick=Search.instance().delete_query('!id!')>delete</a><a href='#' onclick=Search.instance().edit('!id!')>edit</a></div>"
        };

        return search;
    }
};
var WAYNE=WAYNE ||{};
WAYNE.change_mode=function(event,mode){
  switch(mode){
      case "full_text":
          $(event.target).attr("autocomplete","").parent().removeClass("autoComplete");
          break;
      case "select_query":
          $(event.target).attr("autocomplete","experiment").parent().addClass("autoComplete");
          break;
      case "conditions":
          break;
  }

}
WAYNE.change_to_select=function(target){
    $("#"+target).attr("autocomplete","").parent().removeClass("autoComplete");
}
