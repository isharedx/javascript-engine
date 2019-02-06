
(function (global) {
    var engine = function (template, data) {
        var _this = engine.prototype;

        _this.template = _this.parse(template);
        if(_this.default.debug) console.log('template', template);
        _this.data = data;

        return _this;
    };

    engine.prototype = {
        default: {
            line: 0,
            cache: true,
            debug: true,
        },
        options: {},
        buffer: {},
        parse: function (tpl = null) {
            var _counter = 0;
            var tpl = tpl ? tpl : this.template;
            return tpl
            /* 匹配并替换块开始标签 <view >*/
                .replace(new RegExp('<view([^<>]*)>', 'igm'), function ($, str, cursor) {
                    var reg_for = /\s+for="\s*{{\s*(\S*)\s*}}\s*"/i;
                    var reg_index = /\s+index="\s*{{\s*(\S*)\s*}}\s*"/i;
                    var reg_value = /\s+value="\s*{{\s*(\S*)\s*}}\s*"/i;
                    var reg_if = /\s+if="\s*{{\s*(\S*)\s*}}\s*"/i;
                    var reg_elseif = /\s+else-if="\s*{{\s*(\S*)\s*}}\s*"/i;
                    var reg_else = /\s+else(="\s*{{\s*(\S*)\s*}}\s*")?/i;

                    var matched_for = str.match(reg_for);
                    var matched_index = str.match(reg_index);
                    var matched_value = str.match(reg_value);
                    var matched_if = str.match(reg_if);
                    var matched_elseif = str.match(reg_elseif);
                    var matched_else = str.match(reg_else);

                    if (matched_for) {
                        var _data_name = matched_for[1];
                        var _iterator = 'i' + _counter++;
                        var _index = matched_index ? matched_index[1] : 'index';
                        var _value = matched_value ? matched_value[1] : 'value';

                        return '<% ' +
                            'for(var ' + _iterator + ' in ' + _data_name + '){' +
                            'var ' + _value + '=' + _data_name + '[' + _iterator + '];' +
                            'var ' + _index + '=' + _iterator + ';' +
                            ' %>';
                    }
                    else if (matched_if) {
                        return '<% if(' + matched_if[1] + ') { %>';
                    }
                    else if (matched_elseif) {
                        return '<% else if(' + matched_elseif[1] + ') { %>';
                    }
                    else if (matched_else) {
                        return '<% else { %>';
                    }
                    else
                        return $;
                })
                /* 匹配并替换块结束标签 </view> */
                .replace(new RegExp('</view>', 'igm'), '<% } %>');

        },
        compile: function (tpl = null) {
            var tpl = tpl ? tpl : this.template;
            if (this.default.debug) {
                tpl = '<% try{  with($data){ %>' + tpl + '<% } }catch(e){'
                    + "throw {"
                    + 'name:"Render Error",'
                    + "message:e.message,"
                    + "line:$line,"
                    + "};"
                    + "}";
                +'%>';
            }

            var is_new_engine = ''.trim;// '__proto__' in {}
            var replaces = is_new_engine
                ? ["$out='';", "$out+='", "';", "$out"]
                : ["$out=[];", "$out.push(", ");", "$out.join('')"];

            var main_code = tpl
                .replace(/<!--(.*)-->/igm, "")
                .replace(/(<%\s*}\s*)%>(\s*)<%/igm, "$2 $1")
                .replace(/\n/g, "<% ++$line; %>")
                .replace(/\\/g, "\\\\")
                .replace(/[\r]/g, "\\r")
                .replace(/[\t]/g, "\\t")
                .replace(/[\n]/g, "\\n")
                .replace(/'(?=[^%]*%>)/g, "\t")
                .split("'").join("\\'")
                .split("\t").join("'")
                .replace(/{{(.+?)}}/g, "';$out+=$1;$out+='")
                .split("<%").join(replaces[2])
                .split("%>").join(replaces[1]);

            var header_code = "var $data=$data||{},$line=" + this.default.line + "," + replaces[0] + replaces[1];
            var footer_code = "return " + replaces[3] + ";";

            var buffer = [].join('');
            buffer += header_code;
            buffer += main_code;
            buffer += footer_code;

            if (this.default.cache) {
                this.buffer = buffer;
            }

            if(this.default.debug) console.log('compile:buffer', buffer);
            return buffer;
        },
        render: function ($data, buffer = null) {
            var buffer = buffer ? buffer : this.buffer;
            var __render = new Function('$data', buffer);
            if(this.default.debug) console.log('render:__render', __render);
            return __render($data);
        },
        toHtml: function () {
            var tpl = this.template, data = this.data;
            var buffer = this.compile(tpl);
            return this.render(data,buffer);
        }
    }

    global.engine = engine;
})(window);