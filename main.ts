interface CygraphExpression {
	calculate(variables: any): number;
	getVariables(): string[];
}

class CygraphExpressionConst implements CygraphExpression {
	value: number = 0;
	calculate(variables: any): number { return this.value; }
	getVariables(): string[] { return []; }
}

class CygraphExpressionVariable implements CygraphExpression {
	name: string;
	calculate(variables: any): number {
		if (this.name in variables) {
			return variables[this.name];
		} else {
			throw name + "is not in variables";
		}
	}
	getVariables(): string[] { return [this.name]; }
}

class CygraphExpressionOperator implements CygraphExpression {
	op: string;
	children: CygraphExpression[] = [];
	calculate(variables: any): number {
		let res: number[] = [];
		for (let item of this.children) res.push(item.calculate(variables));
		switch (this.op) {
			case "+": return res[0] + res[1];
			case "-": return res[0] - res[1];
			case "*": return res[0] * res[1];
			case "/": return res[0] / res[1];
		}
		throw "Bad op: " + this.op;
	}
	getVariables(): string[] { 
		let a: string[] = [];
		for (let item of this.children) {
			let vret = item.getVariables();
			for (let item2 of vret) {
				if (a.indexOf(item2) == -1) a.push(item2);
			}
		}
		return a;
	}
}

class CygraphCompiler {

	code: string;

	compile(code: string): CygraphExpression {
		this.code = code;
		let item = this.compileExpression();
		this.code = this.code.trim();
		if (this.code[0] == "=") {
			this.code = this.code.slice(1);
			let newItem = new CygraphExpressionOperator();
			newItem.op = "-";
			newItem.children.push(this.compileExpression());
			newItem.children.push(item);
			item = newItem;
		}
		return item;
	}

	compileExpressionInternal(priority: number): CygraphExpression {
		let symbols = [ 
			[],
			["*", "/"],
			["+", "-"]
		];
		if (priority == -1) priority = symbols.length - 1;
		this.code = this.code.trim();
		let ret: CygraphExpression = null;
		if (priority == 0) {
			if ("0123456789".indexOf(this.code[0]) > -1) {
				let item = new CygraphExpressionConst();
				while ("0123456789".indexOf(this.code[0]) > -1) {
					item.value = item.value * 10 + +this.code[0];
					this.code = this.code.slice(1);
				}
				if (this.code[0] === ".") {
					let power = 1;
					this.code = this.code.slice(1);
					while ("0123456789".indexOf(this.code[0]) > -1) {
						item.value += +this.code[0] / (power *= 10);
						this.code = this.code.slice(1);
					}
				}
				ret = item;
			} else if (this.code[0] == "(") {
				this.code = this.code.slice(1);
				let item = this.compileExpressionInternal(-1);
				this.code = this.code.trim();
				if (this.code[0] == ")") this.code = this.code.slice(1);
				else {
					console.log("')' needed");
				}
				ret = item;
			} else {
				let item = new CygraphExpressionVariable();
				item.name = this.code[0];
				this.code = this.code.slice(1);
				ret = item;
			}
		} else {
			let item: CygraphExpression = this.compileExpressionInternal(priority - 1);
			//while (true) {
				let i: number;
				for (i = 0; i < symbols[priority].length; i++) {
					if (this.code.indexOf(symbols[priority][i]) == 0) break;
				}
				// if (a === null) break;
				if (i < symbols[priority].length) {
					this.code = this.code.slice(symbols[priority][i].length);
					let newItem = new CygraphExpressionOperator();
					newItem.children.push(item);
					newItem.children.push(this.compileExpressionInternal(priority));
					newItem.op = symbols[priority][i];
					item = newItem;
				}
			//}
			ret = item;
		}
		return ret;
	}

	compileExpression(): CygraphExpression {
		return this.compileExpressionInternal(-1);
	}

}

interface CygraphRendererDriver {
	draw(path: string, attr: any): any;
	line(x0: number, y0: number, x1: number, y1: number): any;
	point(x0: number, y0: number): any;
}
class CygraphRenderer {
	driver: CygraphRendererDriver;
	constructor(driver: CygraphRendererDriver) {
		this.driver = driver;
	}

	render(tree: CygraphExpression) {
		let variables = tree.getVariables();
		if (variables.length != 2) {
			console.log("two variables needed.");
			return;
		}
		let points = [];
		function distance2(a: number[], b: number[]) {
			return (b[0] - a[0]) * (b[0] - a[0]) + 
				(b[1] - a[1]) * (b[1] - a[1]);
		}
		let arg: any = {};
		arg[variables[0]] = 0;
		arg[variables[1]] = 0;
		let zoom: number = Math.abs(tree.calculate(arg));
		console.log(zoom);
		if (zoom < 1) zoom = 1;
		for (let i = 0; i < 500; i++) {
			for (let j = 0; j < 500; j++) {
				arg[variables[0]] = i;
				arg[variables[1]] = j;
				let res: number = tree.calculate(arg);
				if (Math.abs(res) < zoom * 0.005) {
					this.driver.point(i, j);
					// points.push([i, j]);
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
	}



}
