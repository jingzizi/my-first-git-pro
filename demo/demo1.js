//获取页面url参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var transId = getQueryString('transId');        //交易ID
var channelId = getQueryString('channelId');    //渠道ID
var solutionId = getQueryString('solutionId');  //解决方案ID

//左侧导航数据和格式
var metadata = [
    {
        "APIstart": {  //开始
            "name":"开始",
            "index":"APIstart",  //id
            "type":"APIstart",
            "id":'A1',
        }
    },
    {
        "ruleGroup": {  //规则组
            "name":"规则组",
            "index":"ruleGroup",
            "type":"ruleGroup",
            "id":'A2',
        }
    },
    {
        "branch": {   //分支
            "name":"分支",
            "index":"branch",
            "type":"branch",
            "id":'A3',
        }
    },
    {
        "action": {  //动作
            "name":"动作",
            "index":"action",
            "type":"action",
            "id":'A4',
        }
    },
    {
        "end": {  //结束
            "name":"结束",
            "index":"end",
            "type":"end",
            "id":'A5',
        }
    }
];

//获取初始流程数据
$.ajax({
    type:'get',
    url:'getProcessJson.dox',
    data:{
        id:solutionId
    },
    dataType:'json',
    success:function(data){
        console.log(data);
        var odate = JSON.parse(data);
        console.log(odate.node);
        console.log(odate.line);
        loadJson(odate.node,odate.line);
    }
});

/**模型计数器*/
var modelCounter = 0;

var windows = jsPlumb.getSelector("#container .model"); //获取所有的实体 
var canvas = document.getElementById('canvas');
windows.jsp = instance;

//端点样式设置
var hollowCircle = {
	endpoint: ["Dot",{ cssClass: "endpointcssClass"}], //端点形状
	HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2 },
	paintStyle: {
		fill: "#62A8D1",
		radius: 6
	},		//端点的颜色样式
	isSource: true, //是否可拖动（作为连接线起点）
	connectorStyle:{ stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
    connectionType:'basic',
	isTarget: true, //是否可以放置（连接终点）
	maxConnections: -1
};

//基本连接线样式
var connectorPaintStyle = {
	stroke: "#62A8D1",
	strokeWidth: 2
};

/**
 * 初始化一个jsPlumb实例
 */
var instance = jsPlumb.getInstance({
		Endpoint:['Dot',{radius:2}],
		Connector:"StateMachine",
		DragOptions: { cursor: "pointer", zIndex: 2000 }, //拖动到时候
		ConnectionOverlays: [  //鼠标拉出来线的属性
			[ "Arrow", {
			    location: 1,
			    visible:true,
			    width:11,
			    length:11,
			    //direction:1,
			    id:"arrow",
			    foldback:0.8
			} ],
            [ "Label", {
                id: "label",
                cssClass: "aLabel"
            }]
        ],
	Container: "container"
});

//连线样式
instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });

//修改默认default
instance.importDefaults({
 	 ConnectionsDetachable:true,
	 ReattachConnections:true
});

/**
 * 设置左边菜单
 * @param Data
 */
function setLeftMenu(list){
	for(var obj in list){
		for(var tmp in list[obj]){
			var element_str = '<li class="'+list[obj][tmp].type+'" id="' + list[obj][tmp].index + '" model_type="' + tmp + '">' + list[obj][tmp].name + '</li>';
			$("#leftMenu").append(element_str);
		}
	}

	//拖拽设置
	$("#leftMenu li").draggable({
		helper: "clone",  //克隆形式
		scope: "plant",   //拖动和放置在同一个范围
	});

	//拖拽放置设置
	$("#container").droppable({
		scope: "plant",   //拖动和放置在同一个范围
		drop: function(event, ui){   //当可接受的元素在放置时触发
			CreateModel(ui, $(this));
		}
	});
}

//监听新的连接
instance.bind("connection", function (connInfo, originalEvent) {
    console.log(connInfo);
    //init(connInfo.connection);
});

//鼠标右键线条，是否删除
instance.bind("contextmenu", function (conn,originalEvent) {
     layer.confirm("要删除从 " + conn.source.getElementsByTagName("span")[0].innerHTML + "--" + conn.target.getElementsByTagName("span")[0].innerHTML + " 的连接么?", {
         btn: ['删除','取消'] //按钮
     }, function(){
         instance.detach(conn);
         layer.closeAll();
     }, function(){
         layer.closeAll();
     });
});
// instance.bind("dblclick", function (conn, originalEvent) {
//     layer.confirm("要删除从 " + conn.source.getElementsByTagName("span")[0].innerHTML + "--" + conn.target.getElementsByTagName("span")[0].innerHTML + " 的连接么?", {
//         btn: ['删除','取消'] //按钮
//     }, function(){
//         instance.detach(conn);
//         layer.closeAll();
//     }, function(){
//         layer.closeAll();
//     });
// });

// 单击线条，打开编辑弹出框
instance.bind("click", function (conn, originalEvent) {
    console.log(conn);
    console.log(conn.id);
    var oID = conn.id;
    if(oID.indexOf('_')<0){
        //已经有系统ID,打开编辑窗口
        layer.open({
            type: 2,
            title: '编辑',
            shadeClose: true,
            shade: 0.8,
            area: ['900px','94%'],
            end: function () {  //点击关闭时发送请求

            },
            content: 'transitionAdd.dox?transitionid='+conn.id
        });
    }else{
        //未生成ID，发送请求，生成系统ID
        $.get('saveTransition.dox?cid='+channelId+'&pid='+transId+'&did='+solutionId,function(data){
            console.log(data);
            conn.id = data.transitionid;
            console.log(conn.id);
        },"json");
    }
});

/**
 * 添加模型
 * @param ui
 * @param selector
 */
function CreateModel(ui, selector){
	var modelId = $(ui.draggable).attr("id");
    var type = $(ui.draggable).attr("model_type");  //控件类型
	var id; //元素ID

    id = modelId + "_model_" + modelCounter++;

    //创建并注册控件
    function seqElemet(onames,types){  //onames 控件名称，types 区分规则组还是评分卡 1-规则组；2-评分卡

        //根据控件类型修改class、modelType(控件类型)、rulegrouptype（是否属于规则组，1-规则组；2-评分卡；0-其他）
        $(selector).append('<div class="model '+type+'" rulegrouptype="'+types+'" id="' + id
            + '" modelType="'+ type +'"><div class="fix_icon"></div>'
            + getModelElementStr(type,onames) + '</div>');

        var left = parseInt(ui.offset.left - $(selector).offset().left);
        var top = parseInt(ui.offset.top - $(selector).offset().top);

        $("#"+id).css("position","absolute").css("left",left).css("top",top);

        //添加连接点
        instance.addEndpoint(id, { anchors: "RightMiddle" }, hollowCircle);
        instance.addEndpoint(id, { anchors: "LeftMiddle" }, hollowCircle);
        instance.addEndpoint(id, { anchors: "TopCenter" }, hollowCircle);
        instance.addEndpoint(id, { anchors: "BottomCenter" }, hollowCircle);

        //注册实体可draggable，限制拖动区域
        $("#" + id).draggable({
            containment: "parent",
            handle:'h4',
            drag: function (event, ui) {
                instance.repaintEverything();
            },
            stop: function () {
                instance.repaintEverything();
            }
        });
	};

	if(type=='branch'){  //分支
        seqElemet('',0);
	};
	if(type=='action'){  //动作
        //发送请求获取ID，控件名称
        $.get('saveAction.dox?cid='+channelId+'&pid='+transId+'&did='+solutionId,function(data){
            console.log(data);
            id = data.actionid;
			//实例化控件
            seqElemet(data.actionname,0);
        },"json");
    };
	if(type=='ruleGroup'){  //规则组
        layer.confirm('请选择控件类型', {
            btn: ['规则组','评分卡'] //按钮
        }, function(){
            layer.closeAll();  //关闭窗口
            //发送请求获取ID
            $.get('ruleGroupSave.dox?channelId='+channelId+'&productId='+transId+'&solutionId='+solutionId+'&type=1',function(data){
                console.log(data);
                id = data.id;

                //实例化控件
                seqElemet(data.name,1);
            },"json");
        }, function(){

            layer.closeAll();//关闭窗口
            //发送请求，获取ID
            $.get('ruleGroupSave.dox?channelId='+channelId+'&productId='+transId+'&solutionId='+solutionId+'&type=2',function(data){
                console.log(data);
                id = data.id;

                //实例化控件
                seqElemet(data.name,2);
            },"json");
        });
	};
	if(type=='APIstart'){  //开始
        seqElemet('',0);
	};
    if(type=='end'){
        seqElemet('',0);   //结束
    };
}

/**
 * 创建控件中，可拖动的h4，修改按钮，编辑按钮
 * @param type
 * @returns {String}
 */
function getModelElementStr(type,mNames){
    var list = '';
    //根据左侧导航数据创建
    for(var data in metadata){
        for(var data_type in metadata[data]){
            var model_data = metadata[data][data_type];
            if(type == model_data.type){
                if(type=='APIstart'||type=='end'||type=='branch'){  //开始或结束或分支，没有编辑按钮，名称固定
                    list += '<h4><span index="'
                        + model_data.index + '">'
                        + model_data.name
                        + '</span><div class="editbox"><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div>'
                        + '</h4>';
                }else if(type=='action'){  //动作，有编辑按钮，名称根据后台显示
                    list += '<h4><span index="'
                        + model_data.index + '">'
                        + mNames
                        + '</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div>'
                        + '</h4>';
                }else if(type=='ruleGroup'){  //规则组，有编辑按钮，名称根据后台显示
                    list += '<h4><span index="'
                        + model_data.index + '">'
                        + mNames
                        + '</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div>'
                        + '</h4>';
                    list += '<ul></ul>'
                }
            }
        }
    }
    return list;
}

/**
 * 解析规则组或评分卡中的规则
 * @param obj
 * @returns {String}
 */
 //解析规则组中规则
function parseRuleList(obj){
    var str = "";
    for(var i =0;i<obj.length;i++){
        str += '<li>' + obj[i] + '</li>';
    }
    return str;
}

//删除控件
function removeElement(obj){
	var element = $(obj).parents(".model");
	var oId = element.attr('id');
	var type = element.attr('modeltype');

    layer.confirm('确认删除该控件？', {
        btn: ['删除','取消'] //按钮
    }, function(){
        if(type=='action'){  //删除动作
            //发送请求，删除动作
            $.get('delAction.dox?actionid='+oId,function(data){
                if(data.msg=='删除成功'){
                    //console.log(data);
                    instance.remove(element);
                }
            },"json");
        }else if(type=='APIstart'||type=='end'){  //删除开始或者结束
            instance.remove(element);
        }else if(type=='ruleGroup'){
            //发送请求，删除规则组
            $.get('delGroup.dox?id='+oId,function(data){
                console.log(data);
                if(data){
                    instance.remove(element);
                }
            },"json");
        }else if(type=='branch'){  //删除分支
            instance.remove(element);
        }
        layer.closeAll();
    }, function(){
        layer.closeAll();
    });
}

//编辑控件
function editModel(obj){

	var element = $(obj).parents(".model");
	var type = element.attr('modeltype');
	var oId = element.attr('id');
	var ruletype = element.attr('rulegrouptype'); //规则组中区分 ，规则组还是评分卡 1-规则组；2-评分卡

	if(type=='action'){  //编辑动作
        layer.open({
            type: 2,
            title: '编辑',
            shadeClose: true,
            shade: 0.8,
            area: ['900px','94%'],
            end: function () {  //点击关闭时发送请求，修改动作名称
                $.get('queryAction.dox?actionid='+oId,function(data){
                    console.log(data);
                    element.find('h4').find('span').html(data.actionModel.actionname);
                },"json");
            },
            content: 'actionAdd.dox?actionid='+oId //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
        });
	};
	if(type=='ruleGroup'){ //编辑规则组
        layer.open({
            type: 2,
            title: '编辑',
            shadeClose: true,
            shade: 0.8,
            area: ['900px','94%'],
            end: function () {  //点击关闭时发送请求，获取规则或评分列表
                $.get('ruleListProcess.dox?id='+oId+'&type='+ruletype,function(data){
                    console.log(data);
                    var oStr = parseRuleList(data);  //解析返回的规则或评分列表
                    element.find('ul').empty();
                    element.find('ul').append(oStr);  //将返回的规则列表放在控件中
                },"json");
            },
            content: 'ruleGroupEdit.htm?id='+oId+'&type='+ruletype
        });
	};
};

//保存节点和连线数据
function exportData() { 
	var retStr = ''; 
	//判断控件是否为空
	if($("#container").children().length > 0){ 
		 //获取控件信息
		var blocks=[];                          
         $("#container .model").each(function(idx, elem){
            var elem=$(elem);                           
            blocks.push({
            	BlockId:elem.attr('id'),   //id
            	BlockType:elem.attr('modeltype'),  //控件类型
                ruleGrouptype:elem.attr('ruleGrouptype'),  //区分规则组还是评分卡
                BlockContent:elem.find('h4').find('span').text(),  //文本显示内容
                BlockX:parseInt(elem.css("left"), 10),
                BlockY:parseInt(elem.css("top"), 10)
            });                              
        });

		//连接线
		var connections = instance.getAllConnections();

		//判断连接线是否为空
		if(connections.length > 0){ 
			//获取连接线
			var aLines = [];
			for(var i = 0; i < connections.length; i++){ 
				var sourceId = connections[i].sourceId; 
				var targetId = connections[i].targetId; 
				var label = connections[i].getOverlay("label").label;
				var id = connections[i].id;
				aLines.push({
					id:id,
					source:sourceId,
					target:targetId,
					label:label
				});
		}

		//发送数据给后台
            $.ajax({
                type:'post',
                url:'processStructure.dox',
                data:{
                    id:solutionId,
                    json1:JSON.stringify(blocks),
                    json2:JSON.stringify(aLines)
                },
                dataType:'json',
                success:function(data){
                    console.log(data);
                    if(data){  //保存成功
                        layer.msg('<span style="color:#fff">保存成功！</span>',{time:1500},function(){
                            window.history.go(-1);
                        });
                    }
                }
            });
        }else{
			alert("请检查模型连线是否正确"); 
			return false; 
		} 
	}else{
		alert("请选择模型"); 
	} 
}

//点击保存数据，输出数据
function doSave(){
    var flowName = $('#modelName').val();
    if($.trim(flowName)==''||$.trim(flowName)==null){
        layer.alert('流程名称不能为空')
        return;
    }else{
        exportData();
    }
};

//节点信息，线条信息，进行回显
var loadJson = function(oNodes,oLines){
	console.log(oNodes);
	console.log(oLines);
		oNodes.map(function(value,index,array){
			var _block = eval(value);
			newNode(_block.BlockId,_block.BlockContent,_block.BlockType,_block.ruleGrouptype, _block.BlockX, _block.BlockY);
		});

		instance.batch(function() {
            // for (var i = 0; i < windows.length; i++) {
            	// initNode(windows[i], true);
        	// }

		  	for (var i = 0;i< oLines.length; i++) {
		  		var c = instance.connect({
		  			source:oLines[i].source,
		  			target:oLines[i].target,
		  			type:'basic'
		  		});
                c.id = oLines[i].id;  //修改回显的数据中的线ID
                //console.log(c);
		    }
		});
		return true;
}


//根据JSON数据创建元素
var newNode = function(id, name,type,ruleGrouptype, x, y){
    var d = document.createElement("div");
        d.className = "model "+type;
        d.id = id;
        d.setAttribute('modeltype',type);
        d.setAttribute('ruleGrouptype',ruleGrouptype);

        if(type=='APIstart'||type=='branch'||type=='end'){
            d.innerHTML = '<h4><span index="'+type+'">'+name+'</span><div class="editbox"><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div></h4>'+ '<div class="ep"></div>';
        }else if(type=='ruleGroup'){
            //发送请求，获取规则或者评分列表
            $.get('ruleListProcess.dox?id='+id+'&type='+ruleGrouptype,function(data){
                console.log(data);
                var oStr = parseRuleList(data);  //解析返回的规则或评分列表
                d.innerHTML = '<h4><span index="'+type+'">'+name+'</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div></h4><ul>'+oStr+'</ul>'+ '<div class="ep"></div>';
             },"json");
        }else if(type=='action'){
            d.innerHTML = '<h4><span index="'+type+'">'+name+'</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div></h4>'+ '<div class="ep"></div>';
        }

        d.style.left = x+ "px";
        d.style.top = y+ "px";
        d.style.position = 'absolute';

        //instance.getContainer().appendChild(d);
        $('#container').append(d);
        initNode(d,id);  //初始化元素
        return d;
}

//初始化元素,可进行拖拽，添加可连线的点
var initNode = function(el,oid) {

       // 初始化元素可拖拽  
       $(".model").draggable({
			containment: "parent",
			handle:'h4',
			drag: function (event, ui) {
				instance.repaintEverything();
			},
			stop: function () {
				instance.repaintEverything();
				
			}
		});

    	//给元素添加连线的点
    	instance.addEndpoint(oid, { anchors: "RightMiddle" }, hollowCircle);
		instance.addEndpoint(oid, { anchors: "LeftMiddle" }, hollowCircle);
		instance.addEndpoint(oid, { anchors: "TopCenter" }, hollowCircle);
		instance.addEndpoint(oid, { anchors: "BottomCenter" }, hollowCircle);

		//设置连接的源实体，就是这一头  
       instance.makeSource(el, { 
           filter: ".ep",  
           anchor: "Continuous",    
           maxConnections: 2,  
           connectorStyle:{ stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
           connectionType:'basic',
           extract:{
                "action":"the-action"
            },
           onMaxConnections: function (info, e) {  
               alert("Maximum connections (" + info.maxConnections + ") reached");  
           }  
       });  
 		
 	   //设置连接的目标，就是那一头 
       instance.makeTarget(el, {  
           dropOptions: { hoverClass: "dragHover" },  
           anchor: "Continuous",  
           allowLoopback: true  
       });  
 
       instance.fire("jsPlumbDemoNodeAdded", el); //立即生效  
   };

//自动避免连线源锚点和目标锚点在同一节点上  
instance.bind('beforeDrop', function (conn) {  
   if (conn.sourceId === conn.targetId) {  
          return false  
    } else {  
          return true  
    }  
});
