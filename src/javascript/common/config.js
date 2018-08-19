(function() {
	var date = new Date().getTime();
	require.config({
		baseUrl: './javascript/',
		paths: {
			common:'page/common.min',
			juicer: 'plugin/juicer',
			jquery: 'plugin/jquery',
			index: 'page/index.min.js?'+date,
			DateUtils : 'page/dateutils.min',
			NanoScroll:'plugin/jquery.nanoScroller'
		},
		//一般哪些非AMD规范的模块，通过shim,可以以AMD方式来使用
		//一般多个依赖的模块文件的可以用shim来配置
		//一般 哪些作为插件使用，而不到导出任何变量的‘模块们’  ex : NanoScroll
		shim:{
			DateUtils : {
				deps :[],            //依赖
				exports:'DateUtils'  //暴露的全局变量（模块的全局变量）
			},
			NanoScroll :['jquery']
		},
		//一些第三方JS插件的依赖关系是事先设定好的，不太好修改依赖模块的名称，而如果某个模块有多个版本或有其他模块和它同名，则使用上面的配置都无法解决问题
		//在newmodule.js和oldmodule.js中都有require(‘foo’)调用，要解决冲突只需要这样配置即可
		map:{
			'some/newmodule':{
	            'foo': 'foo1.2'
	        },
	        'some/oldmodule':{
	            'foo':'foo1.0'
	        }
		}
	})
})();