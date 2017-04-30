
// Author:  Anthony John Ripa
// Date:    4/30/2017
// SparseMultinomial : a datatype for representing sparse multinomials; an application of the sparseplacevalue datatype

class sparsemultinomial extends abstractpolynomial {

    constructor(base, pv) {
        if (arguments.length < 2) alert('sparsemultinomial expects 2 arguments');
        if (!Array.isArray(base)) alert('sparsemultinomial expects argument 1 (base) to be an array but found ' + typeof base);
        if (!(pv instanceof sparseplacevalue)) alert('sparsemultinomial expects argument 2 (pv) to be a sparseplacevalue');
        super();
        this.base = base
        this.pv = pv;
    }

    static parse(strornode) {
        console.log('new sparsemultinomial : ' + JSON.stringify(strornode))
        if (strornode instanceof String || typeof (strornode) == 'string') if (strornode.indexOf('base') != -1) { var a = JSON.parse(strornode); return new sparsemultinomial(a.base, new sparseplacevalue(a.pv.points)) }
        var node = (strornode instanceof String || typeof (strornode) == 'string') ? math.parse(strornode == '' ? '0' : strornode.replace('NaN', '(0/0)')) : strornode; //  2017.2  ''=0
        if (node.type == 'SymbolNode') {
            console.log('new sparsemultinomial : SymbolNode')
            //var base = [node.name, null];
            var base = [node.name];
            var pv = sparseplacevalue.parse("1E1");  //new sparseplacevalue([[0, 1]]);
            return new sparsemultinomial(base, pv);
        } else if (node.type == 'OperatorNode') {
            console.log('new sparsemultinomial : OperatorNode')
            var kids = node.args;
            var a = sparsemultinomial.parse(kids[0]);       // sparsemultinomial handles unpreprocessed kid   2015.11
            if (node.fn == 'unaryMinus') {
                var c = new sparsemultinomial([], sparseplacevalue.parse(0)).sub(a);
            } else if (node.fn == 'unaryPlus') {
                var c = new sparsemultinomial([], sparseplacevalue.parse(0)).add(a);
            } else {
                var b = sparsemultinomial.parse(kids[1]);   // sparsemultinomial handles unpreprocessed kid   2015.11
                var c = (node.op == '+') ? a.add(b) : (node.op == '-') ? a.sub(b) : (node.op == '*') ? a.times(b) : (node.op == '/') ? a.divide(b) : (node.op == '|') ? a.eval(b) : a.pow(b);
            }
            return c;
        } else if (node.type == 'ConstantNode') {
            //return new sparsemultinomial([1, null], sparseplacevalue.parse(Number(node.value)));
            return new sparsemultinomial([], sparseplacevalue.parse(Number(node.value)));
        } else if (node.type == 'FunctionNode') {   // Discard functions    2015.12
            alert('Syntax Error: sparsemultinomial expects input like 1, x, x*x, x^3, 2*x^2, or 1+x but found ' + node.name + '.');
            return sparsemultinomial.parse(node.args[0]);
        }
    }

    align(other) {  // 2017.2
        var base1 = this.base.slice();
        var base2 = other.base.slice();
        var base = [...new Set([...base1, ...base2])];
        //base.sort().reverse();
        //if (base[0] == 1) base.shift();
        alignmulti2base(this, base);
        alignmulti2base(other, base);
        this.pv = new sparseplacevalue(this.pv.points);     //  2017.2  Clean this's zeros
        function alignmulti2base(multi, basenew) {
            for (var i = 0; i < multi.pv.points.length; i++)
                alignmultidigit2base(multi, i, basenew);
            function alignmultidigit2base(multi, index, basenew) {
                var digitpowernew = [];
                var baseold = multi.base;
                var digitold = multi.pv.points[index]
                var digitpowerold = digitold[1];
                for (var i = 0; i < basenew.length; i++) {
                    var letter = basenew[i];
                    var posinold = baseold.indexOf(letter);
                    if (posinold == -1) { digitpowernew.push(0); }
                    else {  //  2017.4  manually check if defined
                        //var temp = digitpowerold[posinold] | 0;
                        if (typeof digitpowerold[posinold] === 'undefined') digitpowernew.push(0);
                        else digitpowernew.push(digitpowerold[posinold]);
                    }
                }
                if (digitpowernew.length != basenew.length) { alert('SparseMultinomial: alignment error'); throw new Error('SparseMultinomial: alignment error'); }
                multi.pv.points[index][1] = digitpowernew;
            }
            multi.base = basenew;
        }
    }

    toString() {
        var points = this.pv.points;
        var ret = '';
        for (var i = points.length - 1; i >= 0 ; i--) {     // reverse 2016.12
            var power = points[i][1];
            var digit = Math.round(points[i][0] * 1000) / 1000; // get() 2015.7
            if (digit != 0) {
                ret += '+';
                if (power.every(function (x) { return x == 0; }))
                    ret += digit;
                else {
                    ret += (digit != 1 ? (digit != -1 ? digit : '-') : '').toString();
                    for (var j = 0; j < power.length; j++) {
                        if (power[j] != 0) ret += this.base[j] + sup(power[j]);
                        if (power[j] == 1) ret += '*';
                    }
                    if (ret.slice(-1) == '*') ret = ret.slice(0, -1);
                }
            }
        }
        ret = ret.replace(/\+\-/g, '-');
        if (ret[0] == '+') ret = ret.substring(1);
        if (ret == '') ret = '0';
        return ret;
        function sup(x) {
            if (x == 1) return '';
            return (x != 1) ? '^' + x : '';
        }
    }

}
