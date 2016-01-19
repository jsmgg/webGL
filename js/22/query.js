(function(document,window){
var Tool = {
	type : function(p){
		p =Object.prototype.toString.call(p);
		p = /\[object (\w+)\]/i.exec(p);
		return (p[1]||'').toLocaleLowerCase();
	},
	trim : function(str){
		return str===null?'':(str+'').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');
	},
    /**
     * 获取url参数.
     * @param {String} [name] 参数名称，无此参数时返回所有参数
     * @return {String|Object} name存在时返回相应的值，否则返回所有参数
     */
    getUrlParam: function(name) {
        var url = window.location.search.substr(1);
        if (!url) {
            return null;
        }
        url = decodeURI(url);
        if (name) {
            var value = new RegExp('(?:^|&)' + name + '=([^&]*)(&|$)', 'g').exec(url);
            return value && window.decodeURIComponent(value[1]) || '';
        }
        var result = {};
        var reg = /(?:^|&)([^&=]+)=([^&]*)(?=(&|$))/g;
        var item;
        while (item = reg.exec(url)) {
            result[item[1]] = window.decodeURIComponent(item[2]);
        }
        return result;
    }
};// end Tool

function Query(selector, doc){
	var type = Tool.type(selector), items;
	if(selector instanceof Element || selector instanceof Node){
		items=[selector];
	}else if(selector instanceof NodeList){
        items = [].slice.call(selector);
    }else if(type === 'string'){
        doc && doc instanceof Query && (doc = doc[0]);
		items = [].slice.call((doc && doc.querySelectorAll ? doc : document).querySelectorAll(selector)||[]);
	}else if(selector instanceof Query){
        return selector;
    }else if(selector === window){
        items = [window];
    }else{
		throw selector+' IS ERROR TYPE:'+type+'！！！';
	}
    items.__proto__ = Query.prototype;
    return items;
}


// Event
var Handles={},mggid=0;
Query.prototype.bind = function(eventType,handle){
	var types;
	if(Tool.type(handle)!=='function')return this;
	if(Tool.type(eventType)!=='string'){
		return this;
	}
	types = eventType.split(',');
	eventType = types.shift();
	this.forEach(function(item,i){
		var _id = item.mggid;
		_id || (item.mggid=_id=++mggid);
		if(Handles[eventType+_id]){
			Handles[eventType+_id].push(handle);
		}else{
			Handles[eventType+_id] = [handle];
			item.addEventListener(eventType,(function(key,self){
				return (Handles[key].handle =function(e){
					var handles = Handles[key]||[],returnValue=false;
					handles.forEach(function(fn){//有一个阻止就阻止
						false===fn.call(self,e)?(returnValue=true):false;
					});
					e && returnValue&&(e.stopPropagation(),e.preventDefault());
				})
			})(eventType+_id,item),false);
		}
	});
	return types.length? this.bind(types.join(','),handle):this;
};
['click','mouseup','mousedown','touchstart','touchend','touchmove','focus','blur'].forEach(function(name){
	Query.prototype[name] = function(handle){
		return Tool.type(handle)==='function'?this.bind(name,handle):this.trigger(name);
	}
});
['forEach', 'push', 'concat'].forEach(function( name ) {
    Query.prototype[name] = Array.prototype[ name ];
});
Query.prototype.unbind = function(eventType,handle){
	var self = this,fn;
	if(Tool.type(handle)==='function'){
		fn = function(key,item){
			var fns = Handles[key]||[],index;
			fns.forEach(function(item,i){
				if(item===handle){
					index=i;
				}
			});
			index!==undefined && fns.splice(index,1);
			fns.length==0 && self.unbind.call(Query(item),eventType);
		}
	}else if(Tool.type(eventType)==='string'){
		fn = function(key,item){
			Handles[key] && Handles[key].handle && item.removeEventListener(key.replace(/\d+$/,''),Handles[key].handle,false);
			Handles[key]=null;
		}
	}else {
		fn = function(key,item){
			var k,reg = new RegExp('[a-z]'+key+'$','i');
			for(k in Handles){
				if(reg.test(k)){
					Handles[k] && Handles[k].handle && item.removeEventListener(k.replace(/\d+$/,''),Handles[k].handle,false);
					Handles[k]=null;
				}
			}
		}
	}
	self.forEach(function(item,i){
		var keys = (eventType||'').split( ',' );
        keys.length ? keys.forEach( function( key ) {
            fn( key + item.mggid, item);
        } ) : fn( item.mggid , item );
	});
	return self;
}
Query.prototype.trigger = function(eventName,e){
	var self = this ,key;
	self.forEach(function(item){
		key = eventName+item.mggid;
		Handles[key] && Handles[key].handle && Handles[key].handle(e);
	});
    return self;
}
// end Event
//Query
Query.prototype.removeClass = function(clazz){
	this.forEach(function(item){
		var old = item.className||'',
			cur = ' '+old.replace(/[\t\r\n\f]/g,'')+' ';
		while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
			cur = cur.replace( " " + clazz + " ", " " );
		}
		cur = Tool.trim(cur);
		old!= cur && (item.className=cur);
	});
	return this;
}
Query.prototype.addClass = function(clazz){
	this.forEach(function(item){
		var old = item.className||'',
			cur = ' '+old.replace(/[\t\r\n\f]/g,'')+' ';
		if( cur.indexOf( " " + clazz + " " ) < 0 ){
			cur+=clazz+' ';
		}
		cur = Tool.trim(cur);
		old!= cur && (item.className=cur);
	});
	return this;
}
Query.prototype.hasClass = function(clazz){
	var has = false;
	this.forEach(function(item){
		var cur;
		if( !has){
			cur = ' '+(item.className||'').replace(/[\t\r\n\f]/g,'')+' ';
			cur.indexOf( " " + clazz + " " ) >= 0 && (has = true);
		}
	});
	return has;
}
Query.prototype.html = function(html){
	if(html !== undefined) {
        this.forEach(function(item){
            item.innerHTML = html;
        });
        return this;
    }else{
        return this[0].innerHTML;
    }
}
Query.prototype.attr = function(name, val){
	if(val === undefined){
        return this[0].getAttribute(name)||'';
    }else{
        this.forEach(function(item){
            item.setAttribute(name, val);
        });
        return this;
    }
}
Query.prototype.hide = function(){
        this.forEach(function(item){
            item.style.display = 'none';
        });
        return this;
}
Query.prototype.show = function(){
        this.forEach(function(item){
            item.style.display = 'block';
        });
        return this;
}
Query.prototype.css = function(){
    var arg = arguments,
        len = arg.length;
    if( len == 2 ) {
        this.forEach(function(item){
            item.style[arg[0]] = arg[1];
        });
        return this;
    } else if( len == 1) {
        return this[0].style[ arg[0] ];
    } else {
        return this;
    }
}
Query.prototype.delegate = function(type, handle, attr) {
    var type = type || 'click',
        body = document.body,
        attr = attr || 'name';
        handle = handle||function(){};
    this.forEach(function(item){
        (function(parentNode){
            $(parentNode).unbind( 'type' ).bind(type , function(e){
                var target = e.target , name;
                while(target){
                    name = $(target).attr( attr );
                    if(name && /^js_/.test(name)){
                        return handle.call(target, e, name);//这里可以继续根据返回值决定是否继续往上查找
                    }else if(target === parentNode || target === body){
                        break;
                    }else{
                        target = target.parentNode;
                    }
                }
            } , false);
        })(item);
    });
    return this;
}
//end Query
window.$ = function(selector, doc){
	return Query(selector, doc);
}
$.tool = Tool;
})(document,window);