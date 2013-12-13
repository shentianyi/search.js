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
    create_new: function(){
        //private

        //public
        var search = {};


        search.queries = {};

        search. current_mode = 'full_text';

        search.entity = "";


        //the input controller
        search.input = null;

        search.current_query = null;

        //the list controller
        search.query_list = null;

        search.search_control=null;

        search.query_container=null;

        //change the behavior of the input control
        search.switch_mode = function(mode){
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
                        this.current_query = null;
                        if(mode=="full_text"){
                            this.cast_queries();
                            result =  true
                        }
                        else if(mode=="query_select"){
                            result=  true
                        }
                        break;
                }
                //set the onkeyup event
                if(result) {
                    this.input.bind("keyup",this.handler[mode])
                    this.set_notice(this.notice[mode]);
                    this.current_mode = mode;

                }
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
        search.select_query = function(query){
            if(this.current_mode=='select_query')
            this.current_query = query;
            this.switch_mode("conditions")
        };


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
                if(event.which==13){alert(this.value);}
                else if(event.which==16){
                    if(this.value.length==1){
                        this.switch_mode("select_query");
                    }
                }
            },
            input_conditions:function(){

            },
            select_conditions:function(){


            }
        };

        //the query type description working under process
        search.current_condition = null;

        //buffer query types from server.Buffer into the local storage if possible
        // {"Course":{"k":[{},{},{}]},"Student":{}}
        search.bufferred_query_types = {};

        //get a query_type_description. Trigger by text_changed event of the input control
        search.get_query_type_by_key = function(){


        };

        search.query_types_buffered = {};

        //save the condition combination as a view
        search.save = function(name){};


        //init the input control and global parameter
        //type: the default mode of the input control
        //entity: which entity is searched
        //search_control: the selector of the input control
        //query_container: the selector of the query buffer area
        search.init = function(mode,entity,search_control,query_container){

            //1.put the input into the container
            this.search_control =   $(search_control)
            this.search_control.append(this.template.input);
            this.input =   $('#search_input');
            //2. init the query container
            this.query_container =  $(query_container)
            this.query_container.append(this.template.query_list);
            this.query_list = $('#query_list');

            this.entity = entity;

            //3.change the input type
            this.current_mode = mode;

            this.switch_mode(mode);

            //4.bind the handle for one time
            this.bind(mode);
            //4. wait for input
        };




        //bind the query_type_description to the input and
        // other possible controller. Invoke this function when a query type is selected
        search.bind = function(mode){
            //this.input.unbind("keyup");
            this.input.unbind("keydown").bind("keydown",this.handler[mode])
        };

        //edit the conditions for a certain query
        search.edit = function(query){
            //add input text
            //set the current query to the query name
            //switch mode to conditions
            //delete the item from stored queries
        };



        //re-init all the things when user cancel to input conditions for a query
        search.cancel= function(){
            //restore the select query mode
            this.switch_mode("select_query")
        };


        //delete a condition from the current combination
        search.delete_query = function(){
            //remove from the hash
            //remove from the container
        };

        //add a condition to the current combination
        search.add_query = function(){
            //add to the container
            //add to the hash
        };



        search.template = {
            input:"<input type='text' name='fname' class='search_input_class'" +
                "id='search_input'" +
                "placeholder='已经热切准备为您搜索一切,直接输入关键字开始搜索，或键入＃开始更为精确的搜索'/>",
            query_list:"<div id='query_list'></div>"
        };

        return search;
    }
};