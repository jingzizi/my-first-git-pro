/**模型计数器*/
var modelCounter = 0;
var dataSet = [];

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
		//console.log(list[obj]);
		for(var tmp in list[obj]){
			//console.log(list[obj][tmp]);
			var element_str = '<li class="'+list[obj][tmp].type+'" id="' + list[obj][tmp].index + '" model_type="' + tmp + '">' + list[obj][tmp].name + '</li>';
			$("#leftMenu").append(element_str);
		}
	}
	//拖拽设置
	$("#leftMenu li").draggable({
		helper: "clone",  //克隆形式
		scope: "plant",   //拖动和放置在同一个范围
	});
	$("#container").droppable({
		scope: "plant",   //拖动和放置在同一个范围
		drop: function(event, ui){   //当可接受的元素在放置时触发
			CreateModel(ui, $(this));
		}
	});
}

//监听新的连接
instance.bind("connection", function (connInfo, originalEvent) {
		//console.log(connInfo);
	    init(connInfo.connection);
	  
});


//双击线条，是否删除
instance.bind("dblclick", function (conn, originalEvent) {
	    if (confirm("要删除从 " + conn.source.getElementsByTagName("span")[0].innerHTML 
			   + " —— " + conn.target.getElementsByTagName("span")[0].innerHTML + " 的连接么?")){
				    instance.detach(conn);
			   }
});

// 单击线条，打开编辑弹出框
instance.bind("click", function (conn, originalEvent) {
	    //window.open('http://www.baidu.com');
	    console.log(originalEvent);
	    window.showModalDialog('thehtml.html')
});

/**
 * 添加模型
 * @param ui
 * @param selector
 */
function CreateModel(ui, selector){
	var modelId = $(ui.draggable).attr("id");
	//请求后台数据，获取数据ID，替换ID

	var id = modelId + "_model_" + modelCounter++;
	var type = $(ui.draggable).attr("model_type");  //控件类型
	//根据控件类型修改class
	$(selector).append('<div class="model '+type+'" id="' + id 
			+ '" modelType="'+ type +'"><div class="fix_icon"></div>' 
			+ getModelElementStr(type) + '</div>');
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
}

/**
 * 创建控件内部元素
 * @param type
 * @returns {String}
 */
 // 显示规则列表
function getModelElementStr(type){
	var list = '';
	for(var data in metadata){
		for(var data_type in metadata[data]){
			var model_data = metadata[data][data_type];
			//console.log(model_data);
			if(type == model_data.type){
				list += '<h4><span index="' 
					+ model_data.index + '">' 
					+ model_data.name 
					+ '</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div>'
					+ '</h4>';
				list += '<ul>'
				var properties = model_data.properties;
				list += parseProperties(properties);
				list += '</ul>';
			}
		}
	}
	return list;
}
/**
 * 循环遍历properties
 * @param obj
 * @returns {String}
 */
 //解析规则组中规则
function parseProperties(obj){
	var str = "";
	for(var i =0;i<obj.length;i++){
		if(obj[i].properties == undefined){
			str += '<li id="'+obj[i].id+'">' + obj[i].text + '</li>';
		}else{
			str += arguments.callee(obj[v].properties);
		}
	}
	return str;
}


//删除节点
function removeElement(obj){
	var element = $(obj).parents(".model");
	if(confirm("确定删除该控件？"))
		instance.remove(element);
}

//编辑节点

var sURL = "http://www.baidu.com";
	//将父窗口对象传给子窗口
var vArguments = window;
var sFeatures = "dialogHeight:200px;dialogWidth:450px";

function editModel(obj){
	var element = $(obj).parents(".model");
	var oId = element.attr('id');

	window.showModalDialog(sURL,vArguments,sFeatures);
	//alert(oId);

};
//点击测试
$('#testto').click(function(){
	totest();
});


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
            	BlockId:elem.attr('id'),
            	BlockType:elem.attr('modeltype'),
                BlockContent:elem.find('h4').find('span').text(),
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
				aLines.push({
					lineIndex:'demo_line_'+i,
					source:sourceId,
					target:targetId,
					label:label
				});
			}

			//回显数据
			loadJson(blocks,aLines);

			//发送数据给后台

		}else{ 
			alert("请检查模型连线是否正确"); 
			return false; 
		} 
	}else{
		alert("请选择模型"); 
	} 
}

//保存
function doSave(){
	exportData();
};


//检测数据回显
function totest(){
	var blocks = [
			{BlockId: "APIstart_model_0", BlockContent: "接口开始1",BlockType:'APIstart',BlockX: 57, BlockY: 30},
			{BlockId: "APIstart_model_1", BlockContent: "接口开始2",BlockType:'APIstart',BlockX: 180, BlockY: 400}
		];
	var aLines = [
			{lineIndex: "demo_line_0", source: "APIstart_model_0", target: "APIstart_model_1", label: "接口开始.A1 = 接口开始.A2"}
		];
	loadJson(blocks,aLines);
};

//节点信息，线条信息
var loadJson = function(oNodes,oLines){
	console.log(oNodes);
	console.log(oLines);
		oNodes.map(function(value,index,array){
			var _block = eval(value);
			newNode(_block.BlockId,_block.BlockContent,_block.BlockType, _block.BlockX, _block.BlockY);
		});

		instance.batch(function() {
			for (var i = 0; i < windows.length; i++) {
            	initNode(windows[i], true);
        	}

		  	for (var i = 0;i< oLines.length; i++) {
		  		instance.connect({
		  			source:oLines[i].source,
		  			target:oLines[i].target,
		  			type:'basic'
		  		})
		    }
		});
		return true;
}


//根据JSON数据创建元素
var newNode = function(id, name,type, x, y){
    var d = document.createElement("div");
        d.className = "model "+type;
        d.id = id;
        d.modeltype = type;
        d.innerHTML = '<h4><span index="'+type+'">'+name+'</span><div class="editbox"><div class="fix_icon" onclick="editModel(this)"></div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);"></a></div></h4>'+ '<div class="ep"></div>';
        d.style.left = x+ "px";
        d.style.top = y+ "px";
        d.style.position = 'absolute';

        //instance.getContainer().appendChild(d);
        $('#container').append(d);
        initNode(d,id);  //初始化元素
        return d;
}
//初始化元素
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
//鼠标单击线条，删除线条
// instance.bind("click", function (c) {
//     instance.deleteConnection(c);
// });