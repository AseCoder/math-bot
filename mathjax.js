const canvas = require('canvas');
const fabric = require('fabric').fabric;

let mathjax;
require('mathjax').init({
	loader: {
		load: ['input/asciimath', 'output/svg', 'adaptors/liteDOM']
	},
	styles: {
		".MathJax_SVG svg > g, .MathJax_SVG_Display svg > g": {
			fill: "#00F",
			stroke: "#00F"
		}
	}
}).then(foo => mathjax = foo);

async function mathToSVG(math) {
	const node = await mathjax.asciimath2svgPromise(math, {
		em: 16,
		ex: 8,
		containerWidth: 80 * 16
	});

	const adaptor = mathjax.startup.adaptor;
	const svg = adaptor.innerHTML(node);
	return svg;
}

module.exports = async (math, resolution) => {
	// math is an array of equations
	const svgList = await Promise.all(math.map(x => mathToSVG(x)));
	console.log(svgList);

	const multi = resolution || 20;
	
	// find width and height multipliers
	let width = 0;
	let heights = [];

	svgList.forEach((svg, i) => {
		const widthIndex = svg.indexOf('width') + 7;
		const widthBegin = svg.slice(widthIndex);
		const widthEndIndex = widthIndex + widthBegin.indexOf('ex');
		const svgwidth = Math.floor(parseFloat(svg.slice(widthIndex, widthEndIndex)) * multi);
	
		const heightIndex = svg.indexOf('height') + 8;
		const heightBegin = svg.slice(heightIndex);
		const heightEndIndex = heightIndex + heightBegin.indexOf('ex');
		const svgheight = Math.floor(parseFloat(svg.slice(heightIndex, heightEndIndex)) * multi) + (i === svgList.length - 1 ? 8 : 25);

		if (width < svgwidth) width = svgwidth;

		heights.push(svgheight);
	});

	const height = heights.reduce((a, b) => a + b, 0);

	console.log('width', width);
	console.log('height', height);

	const ctx = new fabric.StaticCanvas(null);
	ctx.setDimensions({ width, height });
	ctx.add(new fabric.Rect({ width: width + 1, height: height + 1, left: -1, top: -1, fill: 'white'}))

	svgList.forEach((svg, i) => {
			fabric.loadSVGFromString(svg, (objects, options) => {
				const obj = fabric.util.groupSVGElements(objects, options);
				obj.scale(multi);
				obj.setPositionByOrigin(new fabric.Point(0, 4 + (heights.slice(0, i).reduce((a, b) => a + b, 0))), 'left', 'top')
				ctx.add(obj).renderAll();
			});
	});

	return fabric.util.getNodeCanvas(ctx.lowerCanvasEl).toBuffer();
};