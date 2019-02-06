// 节点分成三种类型:一种是普通文本节点，一种是块级节点，一种是变量节点
const root = [];
let parent;
function parse(str){
    const matches = str.match(/<view/);
    const isBlock = (matches[0] === '<view');
    const endIndex = matches.index;

    const chars = str.slice(0, matches ? endIndex : str.length);
    if(chars.length) {
        //...创建文本节点
    }

    if(!matches) return;

    // 字符串 "<view" 长度为5
    str = str.slice(endIndex + 5);
    const leftStart = matches[0];
    const rightEnd = isBlock ? '</view>' : '}}';
    const rightEndIndex = str.indexOf(rightEnd);
    const expression = str.slice(0, rightEndIndex)

    if(isBlock) {
        if( "如果是块级节点" ) {
            //...创建块级节点 el

            parent = el;
        } else if( "是块级节点的闭合节点（endfor、endif ..）" ) {
            parent = parent.parent;
        }
    } else {
        //...创建变量节点 el
    }

    (parent ? parent.children : root).push(el);
    parse(str.slice(rightEndIndex + 2));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// 代码整个放在一个立即执行函数里面
let assign = function (template,data) {
    let i=0, length = data.length,fragment = '';

    function replace(obj) {
        let t,key,reg;

        for(key in obj){
            reg = new RegExp('{{' + key + '}}','ig');
            t = (t || template).replace(reg,obj[key]);
        }
        return t;
    }

    for (; i<length; i++){
        fragment += replace(data[i]);
    }

    return fragment;
};

(function () {
    let cache = {};// 用来缓存，有时候一个模板要用多次，这时候，我们直接用缓存就会很方便

    // template绑定在this上，这里的this指是window
    this.template = function template(str,data) {

        // 只有模板才有非字母数字字符，用来判断传入的是模板id还是模板字符串，
        // 如果是模板id的话，判断是否有缓存，没有缓存的话调用template；
        // 如果是模板字符串的话，就调用new Function()解析编译
        let fn = !/\W/.test(str) ? cache[str] = cache[str] || template(document.getElementById(str).innerHTML):new Function('obj',
            "let p=[],print=function () {p.push.apply(p,arguments);};"+"with(obj){p.push('"+
            str.replace(/[\r\t\n]/g," ") /* 去除换行制表符 \t\n\r */
                .split("<view").join("\t") /* 将左分隔符变成 \t */
                .replace(/((^|<\/view>)[^\t]*)'/g,"$1\r") /* 去掉模板中单引号的干扰 */
                .replace(/\t=(.*?)<\/view>/g,"',$1,'") /* 将 html 中的变量变成 ",xxx," 的形式, 如：\t=users[i].url%> 变成  '，users[i].url,' */
                .split("\t").join("');") /* 这时候只有 js 语句前面才有 "\t" ,  将 \t 变成 ');  这样就可把 html 标签添加到数组p中，而js语句不需要 push 到里面。*/
                .split("</view>").join("p.push('")
                .split("\r").join("\\'") /* 将上面可能出现的干扰的单引号进行转义 */
            +"');}return p.join('');" /* 将数组 p 变成字符串 */
        );

        return data?fn(data):fn;
    }
})();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var TemplateEngine = function(html, options) {
    var re = /{{([^}}]+)?}}/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n',
        cursor = 0;
    var add = function (line, js) {
        js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while (match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
    var TemplateEngine = function (html, options) {
        var re = /{{([^}}]+)?}}/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n',
            cursor = 0;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code += 'return r.join("");';
        return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
    }
}

