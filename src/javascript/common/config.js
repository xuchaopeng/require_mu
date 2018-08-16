(function() {
	var date = new Date().getTime();
	require.config({
		baseUrl: './javascript/',
		paths: {
			common:'page/common.min',
			juicer: 'plugin/juicer',
			jquery: 'plugin/jquery',
			index: 'page/index.min.js?'+date
		}
	})
})();