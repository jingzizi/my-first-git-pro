/**
 * 元数据
 */
// var metadata = [
// {
// 	"student": {
// 		"name":"学生会",
// 		"index":"student",
// 		"type":"student",
// 		"properties": {
// 			"id": {
// 				"des":"id"
// 			},
// 			"name": {
// 				"des":"姓名"
// 			},
// 			"title": {
// 				"des":"职务"
// 			},
// 			"phone": {
// 				"des":"电话"
// 			},
// 			"email": {
// 				"des":"邮箱"
// 			}
// 		}
// 	}
// },
// {
// 	"computer": {
// 		"name":"计算机社团",
// 		"index":"computer",
// 		"type":"computer",
// 		"properties": {
// 			"id": {
// 				"des":"id"
// 			},
// 			"name": {
// 				"des":"姓名"
// 			},
// 			"title": {
// 				"des":"职务"
// 			},
// 			"phone": {
// 				"des":"电话"
// 			},
// 			"email": {
// 				"des":"邮箱"
// 			}
// 		}
// 	}
// },
// {
// 	"RedCross": {
// 		"name":"红十字会",
// 		"index":"RedCross",
// 		"type":"RedCross",
// 		"properties": {
// 			"id": {
// 				"des":"id"
// 			},
// 			"name": {
// 				"des":"姓名"
// 			},
// 			"title": {
// 				"des":"职务"
// 			},
// 			"phone": {
// 				"des":"电话"
// 			},
// 			"email": {
// 				"des":"邮箱"
// 			}
// 		}
// 	}
// }
// ];
var metadata = [
{
	"APIstart": {
		"name":"接口开始",
		"index":"APIstart",  //id
		"type":"APIstart",
		"id":'A1',
		"properties":[]
	}
},
{
	"ruleGroup": {
		"name":"规则组",
		"index":"ruleGroup",
		"type":"ruleGroup",
		"id":'A2',
		"properties": [
			{
				'id':10,
				'text':'产品规则1'
			},
			{
				'id':11,
				'text':'信贷规则1'
			},
			{
				'id':12,
				'text':'风险类规则1'
			}
		]
	}
},
{
	"branch": {
		"name":"分支",
		"index":"branch",
		"type":"branch",
		"id":'A3',
		"properties":[]
	}
},
{
	"action": {
		"name":"动作",
		"index":"action",
		"type":"action",
		"id":'A4',
		"properties":[]
	}
},
{
	"end": {
		"name":"结束",
		"index":"end",
		"type":"end",
		"id":'A5',
		"properties":[]
	}
}
];