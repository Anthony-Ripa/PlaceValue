
// Author : Anthony John Ripa
// Date : 11/18/2015
// Laurent : a datatype for representing Laurent polynomials; an application of the PlaceValue datatype

function laurent(arg, pv) {
    console.log('laurent : arguments.length=' + arguments.length);
    if (arguments.length < 2) {
        var base;
        var pv;
        if (isNaN(arg)) {
            if ((arg instanceof String || typeof (arg) == 'string') && arg.indexOf('base') != -1) {    // if arg is json of laurent-object
                var argObj = JSON.parse(arg);
                console.log('argObj=' + JSON.stringify(argObj));
                base = argObj.base;
                console.log('argObj.base=' + JSON.stringify(argObj.base));
                pv = argObj.pv;
                console.log('argObj.pv=' + JSON.stringify(argObj.pv));
            } else if(arg != arg) {    // If arg is %   2015.8
                base = 1;
                pv = [arg];
            } else {
                parse(this, arg);
                return;
            }
        } else {
            base = 1;
            pv = [arg];
        }
        this.base = base;
        this.pv = new placevalue(pv);
        console.log("laurent : this.pv=" + JSON.stringify(this.pv));
    } else {
        this.base = arg;
        if (pv instanceof placevalue)
            this.pv = pv;
        else if (typeof pv == 'number') {
            console.log("laurent: typeof pv == 'number'");
            this.pv = new placevalue(pv)
            console.log(this.pv.toString());
        }
        else
            alert('laurent: bad arg typeof(arg2)=' + typeof (pv));
    }
    function parse(me, strornode) {
        console.log('<strornode>')
        console.log(strornode)
        console.log('</strornode>')
        var node = (strornode instanceof String || typeof (strornode) == 'string') ? math.parse(strornode.replace('NaN', '(0/0)')) : strornode;
        if (node.type == 'SymbolNode') {
            console.log('SymbolNode')
            base = node.name;
            //pv = 10;
            me.base = base;
            me.pv = new placevalue(1, 1);   // 1E1 not 10 so 1's place DNE not 0.   2015.9
        } else if (node.type == 'OperatorNode') {
            console.log('OperatorNode')
            var kids = node.args;
            //var a = new laurent(kids[0].type == 'OperatorNode' ? kids[0] : kids[0].value || kids[0].name);
            var a = new laurent(kids[0]);       // laurent handles unpreprocessed kid   2015.11
            if (node.fn == 'unaryMinus') {
                var c = new laurent(0).sub(a);
            } else if (node.fn == 'unaryPlus') {
                var c = new laurent(0).add(a);
            } else {
                //var b = new laurent(kids[1].type == 'OperatorNode' ? kids[1] : kids[1].value || kids[1].name);
                var b = new laurent(kids[1]);   // laurent handles unpreprocessed kid   2015.11
                var c = (node.op == '+') ? a.add(b) : (node.op == '-') ? a.sub(b) : (node.op == '*') ? a.times(b) : (node.op == '/') ? a.divide(b) : (node.op == '|') ? a.eval(b) : a.pow(b);
            }
            me.base = c.base;
            me.pv = c.pv;
        }
    }
}

laurent.prototype.tohtml = function () { // Replacement for toStringInternal 2015.7
    return this.pv.tohtml() + ' base ' + this.base;
}

laurent.prototype.toString = function () {
    return laurent.toStringXbase(this.pv, this.base);
}

laurent.prototype.add = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.add(other.pv));
}

laurent.prototype.sub = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.sub(other.pv));
}

laurent.prototype.times = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.times(other.pv));
}

laurent.prototype.divide = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.divide(other.pv));
}

laurent.prototype.pointadd = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.pointadd(other.pv));
}

laurent.prototype.pointsub = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.pointsub(other.pv));
}

laurent.prototype.pointtimes = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.pointtimes(other.pv));
}

laurent.prototype.pointdivide = function (other) {
    this.align(other);
    return new laurent(this.base, this.pv.pointdivide(other.pv));
}

laurent.prototype.align = function (other) {    // Consolidate alignment    2015.9
    if (this.pv.whole.mantisa.length == 1 && this.pv.exp == 0) this.base = other.base;
    if (other.pv.whole.mantisa.length == 1 && other.pv.exp == 0) other.base = this.base;
    if (this.base != other.base) { alert('Different bases : ' + this.base + ' & ' + other.base); return new laurent('0/0') }
}

laurent.prototype.pow = function (other) { // 2015.6
    return new laurent(this.base, this.pv.pow(other.pv));
}

laurent.toStringXbase = function (pv, base) {                        // added namespace  2015.7
    console.log('laurent: pv = ' + pv);
    var x = pv.whole.mantisa;
    var exp = pv.exp;						// exp for negative powers	2015.8
    console.log('laurent.toStringXbase: x=' + x);
    if (x[x.length - 1] == 0 && x.length > 1) {     // Replace 0 w x.length-1 because L2R 2015.7
        x.pop();                                    // Replace shift with pop because L2R 2015.7
        return laurent.toStringXbase(new placevalue(x), base);  // added namespace  2015.7
    }
    var ret = '';
    var str = x//.toString().replace('.', '');
    var maxbase = x.length - 1 + exp;				// exp for negative powers	2015.8
    for (var i = str.length-1; i >=0 ; i--) {        // power is index because whole is L2R  2015.7 
	var power = i + exp;
        var digit = Math.round(1000 * str[i]) / 1000;   // power is index because whole is L2R  2015.7 
        if (digit != 0) {
            ret += '+';
            if (power == 0)
                ret += digit;
            else if (power == 1)
                ret += coefficient(digit) + base;
            else
                ret += coefficient(digit) + base + sup(power);
        }
        console.log('laurent.toStringXbase: power=' + power + ', digit=' + digit + ', ret=' + ret);
    }
    ret = ret.replace(/\+\-/g, '-');
    if (ret[0] == '+') ret = ret.substring(1);
    if (ret == '') ret = '0';
    return ret;
    function coefficient(digit) { return (digit == 1 ? '' : digit == -1 ? '-' : digit).toString() + (isFinite(digit) ? '' : '*') }
    function sup(x) {
	if (x == 1) return '';
        return pretty(x);
        function ugly(x) { return (x != 1) ? '^' + x : ''; }
        function pretty(x) {
            return x.toString().split('').map(
                function (x) { return { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }[x]; }).join('');
        }
    }
}

laurent.prototype.eval = function (base) {
    var sum = 0;
    for (var i = 0; i < this.pv.whole.mantisa.length; i++) {
        var pow = Math.pow(base, i + this.pv.exp);  // offset by exp    2015.8
        if (this.pv.whole.get(i)!=0) sum += this.pv.whole.get(i) * pow  // Skip 0 to avoid %    2015.8
        //alert(this.pv.exp+','+this.pv.whole.get(i)+','+(i+this.pv.exp)+','+sum)
    }
    return new laurent(sum);  // interpret as number  2015.8
}
