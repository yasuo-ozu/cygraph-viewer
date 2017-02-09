var CygraphExpressionConst = (function () {
    function CygraphExpressionConst() {
        this.value = 0;
    }
    CygraphExpressionConst.prototype.calculate = function (variables) { return this.value; };
    CygraphExpressionConst.prototype.getVariables = function () { return []; };
    return CygraphExpressionConst;
}());
var CygraphExpressionVariable = (function () {
    function CygraphExpressionVariable() {
    }
    CygraphExpressionVariable.prototype.calculate = function (variables) {
        if (this.name in variables) {
            return variables[this.name];
        }
        else {
            throw name + "is not in variables";
        }
    };
    CygraphExpressionVariable.prototype.getVariables = function () { return [this.name]; };
    return CygraphExpressionVariable;
}());
var CygraphExpressionOperator = (function () {
    function CygraphExpressionOperator() {
        this.children = [];
    }
    CygraphExpressionOperator.prototype.calculate = function (variables) {
        var res = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var item = _a[_i];
            res.push(item.calculate(variables));
        }
        switch (this.op) {
            case "+": return res[0] + res[1];
            case "-": return res[0] - res[1];
            case "*": return res[0] * res[1];
            case "/": return res[0] / res[1];
        }
        throw "Bad op: " + this.op;
    };
    CygraphExpressionOperator.prototype.getVariables = function () {
        var a = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var item = _a[_i];
            var vret = item.getVariables();
            for (var _b = 0, vret_1 = vret; _b < vret_1.length; _b++) {
                var item2 = vret_1[_b];
                if (a.indexOf(item2) == -1)
                    a.push(item2);
            }
        }
        return a;
    };
    return CygraphExpressionOperator;
}());
var CygraphCompiler = (function () {
    function CygraphCompiler() {
    }
    CygraphCompiler.prototype.compile = function (code) {
        this.code = code;
        var item = this.compileExpression();
        this.code = this.code.trim();
        if (this.code[0] == "=") {
            this.code = this.code.slice(1);
            var newItem = new CygraphExpressionOperator();
            newItem.op = "-";
            newItem.children.push(this.compileExpression());
            newItem.children.push(item);
            item = newItem;
        }
        return item;
    };
    CygraphCompiler.prototype.compileExpressionInternal = function (priority) {
        var symbols = [
            [],
            ["*", "/"],
            ["+", "-"]
        ];
        if (priority == -1)
            priority = symbols.length - 1;
        this.code = this.code.trim();
        var ret = null;
        if (priority == 0) {
            if ("0123456789".indexOf(this.code[0]) > -1) {
                var item = new CygraphExpressionConst();
                while ("0123456789".indexOf(this.code[0]) > -1) {
                    item.value = item.value * 10 + +this.code[0];
                    this.code = this.code.slice(1);
                }
                if (this.code[0] === ".") {
                    var power = 1;
                    this.code = this.code.slice(1);
                    while ("0123456789".indexOf(this.code[0]) > -1) {
                        item.value += +this.code[0] / (power *= 10);
                        this.code = this.code.slice(1);
                    }
                }
                ret = item;
            }
            else if (this.code[0] == "(") {
                this.code = this.code.slice(1);
                var item = this.compileExpressionInternal(-1);
                this.code = this.code.trim();
                if (this.code[0] == ")")
                    this.code = this.code.slice(1);
                else {
                    console.log("')' needed");
                }
                ret = item;
            }
            else {
                var item = new CygraphExpressionVariable();
                item.name = this.code[0];
                this.code = this.code.slice(1);
                ret = item;
            }
        }
        else {
            var item = this.compileExpressionInternal(priority - 1);
            //while (true) {
            var i = void 0;
            for (i = 0; i < symbols[priority].length; i++) {
                if (this.code.indexOf(symbols[priority][i]) == 0)
                    break;
            }
            // if (a === null) break;
            if (i < symbols[priority].length) {
                this.code = this.code.slice(symbols[priority][i].length);
                var newItem = new CygraphExpressionOperator();
                newItem.children.push(item);
                newItem.children.push(this.compileExpressionInternal(priority));
                newItem.op = symbols[priority][i];
                item = newItem;
            }
            //}
            ret = item;
        }
        return ret;
    };
    CygraphCompiler.prototype.compileExpression = function () {
        return this.compileExpressionInternal(-1);
    };
    return CygraphCompiler;
}());
var CygraphRenderer = (function () {
    function CygraphRenderer(driver) {
        this.driver = driver;
    }
    CygraphRenderer.prototype.render = function (tree) {
        var variables = tree.getVariables();
        if (variables.length != 2) {
            console.log("two variables needed.");
            return;
        }
        var points = [];
        function distance2(a, b) {
            return (b[0] - a[0]) * (b[0] - a[0]) +
                (b[1] - a[1]) * (b[1] - a[1]);
        }
        var arg = {};
        arg[variables[0]] = 0;
        arg[variables[1]] = 0;
        var zoom = Math.abs(tree.calculate(arg));
        console.log(zoom);
        if (zoom < 1)
            zoom = 1;
        for (var i = 0; i < 500; i++) {
            for (var j = 0; j < 500; j++) {
                arg[variables[0]] = i;
                arg[variables[1]] = j;
                var res = tree.calculate(arg);
                if (Math.abs(res) < zoom * 0.005) {
                    this.driver.point(i, j);
                }
            }
        }
        // for (let p1 of points) {
        // 	let i = 0;
        // 	for (let p2 of points) {
        // 		if (distance2(p1, p2) <= 10) {
        // 			this.driver.line(p1[0], p1[1], p2[0], p2[1]);
        // 			if (++i >= 2) break;
        // 		}
        // 	}
        // }
    };
    return CygraphRenderer;
}());
//# sourceMappingURL=main.js.map