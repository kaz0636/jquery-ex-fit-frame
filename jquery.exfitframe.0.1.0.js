/*
 * 	exFitFrame 0.1.0 - jQuery plugin
 *	written by Cyokodog	
 *
 *	Copyright (c) 2010 Cyokodog (http://d.hatena.ne.jp/cyokodog/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */
(function($){

    var isDisplayScrollBar = function(target, key){
        var val = target.css('overflow-' + key)
        if (val == 'scroll') return true;
        if (val == 'hidden') return false;
        if (val == 'auto' || target.attr('tagName') == 'HTML') {
            var method = (key == 'y' ? 'Height' : 'Width');
            return target.attr('client' + method) < target.attr('scroll' + method);
        }
        return false
    }

	var API = function(api){
		var api = $(api),api0 = api[0];
		for(var name in api0)
			(function(name){
				if($.isFunction( api0[name] ))
					api[ name ] = (/^get[^a-z]/.test(name)) ?
						function(){
							return api0[name].apply(api0,arguments);
						} : 
						function(){
							var arg = arguments;
							api.each(function(idx){
								var apix = api[idx];
								apix[name].apply(apix,arg);
							})
							return api;
						}
			})(name);
		return api;
	}


	$.ex = $.ex || {};

	$.ex.fitFrame = function(idx , targets , option){
		var o = this,
		c = o.config = $.extend({} , $.ex.fitFrame.defaults , option);
		c.targets = targets;
		c.target = c.targets.eq(idx);
		c.index = idx;
		c.size = {};
		o.initContents();
		c.target
			.css( c.css || {} )
			.attr('frameborder','0')
			.load(function(){
				o.initContents();
				!c.loadFit || o.fit();
				!c.load || c.load.apply(this,[o]);
			});
		o.fit();

        !(c.watchFit == true && !isNaN(c.watchFit)) || (c.watchFit = 100);
        !c.watchFit || o.watchFit(c.watchFit);
	}
    $.extend($.ex.fitFrame.prototype, {
		_fit : function(name){
			var o = this, c = o.config;
			if( !c.contents ) return o;
			var html = c.contents.find('html');
			html.css('overflow-' + (name == 'height' ? 'y' : 'x'),'hidden');
			setTimeout(function(){
				var size = o.getContainer(name)[name]();
				if (size) {
				    c.target[name](size);
					if(name == 'height' && isDisplayScrollBar(html,'x')){
						c.target[name](size+16);
					}
				    c.size[name] = c.target[name];
				}
			},1);
			return o;
		},
		fit : function(){
			var o = this, c = o.config;
			!c.widthFit || o.widthFit();
			!c.heightFit || o.heightFit();
			return o;
		},
		widthFit : function(){
			return this._fit('width');
		},
		heightFit : function(){
			return this._fit('height');
		},
		watchFit : function( time ){
			var o = this, c = o.config;
			if( c.watch ) clearInterval( c.watch )
			c.watch = setInterval(function(){
				$(['height','width']).each(function(){
					var name = this, container = o.getContainer( name );
					if( container ){
						if( c[ name + 'Fit'] && container[name]() != c.size[name] ) o[name + 'Fit']();
					}
				});
			} , time || c.watchFit);
			return o;
		},
		initContents : function(){
			var o = this, c = o.config;
			c.contents = o.getContents().find('html,body').css({
				'border':'none',
				'margin':0
			}).end();
		},
		getContents : function(){
			var o = this, c = o.config;
			try{
				return c.target.contents();
			}
			catch(e){}
			return undefined;
		},
		getContainer : function( name ){
			var o = this, c = o.config;
			return ( !c.contents || name == 'width' ) ? c.contents : c.contents.find('body') ;
		}
	});
	$.ex.fitFrame.defaults = {
		widthFit : true,
		heightFit : true,
		loadFit : true,
		watchFit : 500,
		css : null,
		load : null
	}
	$.fn.exFitFrame = function(option){
        var targets = this,api = [];
        targets.each(function(idx) {
            var target = targets.eq(idx);
            var obj = target.data('ex-fitFrame') || new $.ex.fitFrame( idx , targets , option);
            api.push(obj);
            target.data('ex-fitFrame',obj);
        });
        return option && option.api ? API(api) : targets;
	}
})(jQuery);
