import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { SubsetFilter } from './SubsetFilter.js';

export const SubsetVis = ({data=[],
						   scale=3,
						   setIndices,
						   setSubset,
						   _index="_uuid"}) => {

	const refContainer = useRef("Container");
	const refUnit = useRef("UnitVis");
	const refIcicle = useRef("IcicleVis");
	// const refTooltip = useRef("Tooltip");
	const refStats = useRef("Stats");
	const refShow = useRef("Show");
	const refFilter = useRef("Filters");
	const refSubset = useRef("SubsetContainer");

	const [base, setBase] = useState("All");
	const [layers, setLayers] = useState([]);

	const [rules, setRules] = useState([[]]);

	let layout = {"height": 60, "width": 900, "margin": 10};

	const icicleHeight = 50;

	function getLayout(n, cols, isFixed = false) {

		if (n < cols) {
			return [1, n]
		}

		let fullRows = Math.floor(n / cols);
		let rowsRemainder = n - fullRows * cols;

		if (rowsRemainder == 0) {
			return [fullRows, cols]
		} else if (!isFixed && rowsRemainder > 0) {
			let fullCols = Math.floor(n / fullRows);
			let colsRemainder = n - fullCols * fullRows;

			if (colsRemainder == 0) {
				return [fullRows, fullCols]
			} else {
				return [fullRows, fullCols + 1]
			}
		} else {
			return [fullRows + 1, cols]
		}

	}

	function layoutIcicle(children, total, width, startX=0, depth=0, margin) {

		let icicles = [];
		let xIncrement = startX;

		for (let c of children) {

			icicles.push({"x": xIncrement,
						  "y": (icicleHeight) * depth,
						  "width": c.data.length / total * width,
						  "height":icicleHeight,
						  "attribute": c.attribute,
						  "label":c.label,
						  "depth":depth,
						  "data": c.data,
						  "isRule":c.isRule});

			icicles = icicles.concat(layoutIcicle(c.children, total, width, xIncrement, depth+1, margin));

			xIncrement = xIncrement + c.data.length / total * width;
		}

		return icicles
	}

	function getSelectionSize(layers) {

		let result;
		let resultSize;
		let resultDepth;

		for (let l of layers) {
			if (l.isRule && !result) {
				resultSize = l.data.length;
				result = l.data;
				resultDepth = l.depth;
			} else if (l.isRule && l.depth > resultDepth) {
				resultSize = l.data.length;
				result = l.data;
				resultDepth = l.depth;
			}
		}

		resultSize = resultSize ? resultSize : 0;
		result = result ? result : [];

		return [result, resultSize];

	}

	function getLayers(data, rules, isRule=false) {

		if (rules.length === 0) {
			return []
		}

		let firstRule = rules[0];
		let otherRules = rules.slice(1,);

		let result = {};

		if (firstRule.length === 0) {

			result.data = data;
			result.attribute = "All";
			result.isRule = true;
			result.label = "All";
			result.children = getLayers(data, rules.slice(1,), true);

		} else if (Array.isArray(firstRule[1])) {

			let attribute = firstRule[0];
			let range = firstRule[1];

			let subgroup1 = data.filter(d => d[attribute] >= range[0] && d[attribute] <= range[1]);
			let subgroup2 = data.filter(d => d[attribute] < range[0] || d[attribute] > range[1]);

			return [{"attribute": attribute, "isRule": isRule ? true : false, "data":subgroup1, "label":`${range[0]} <= ${attribute} <= ${range[1]}`, "children":getLayers(subgroup1, rules.slice(1,), isRule ? true : false)},
					{"attribute": attribute, "isRule":false, "data":subgroup2, "label":`${attribute} < ${range[0]} or ${attribute} > ${range[1]}`, "children":getLayers(subgroup2, rules.slice(1,))}]
		} else {

			let attribute = firstRule[0];
			let attrValue = firstRule[1];

			let subgroup1 = data.filter(d => d[attribute] == attrValue);
			let subgroup2 = data.filter(d => d[attribute] != attrValue);

			return [{"attribute": attribute, "isRule": isRule ? true : false, "data":subgroup1, "label":`${attribute} = ${attrValue}`, "children":getLayers(subgroup1, rules.slice(1,), isRule ? true : false)},
					{"attribute": attribute, "isRule":false, "data":subgroup2, "label":`${attribute} != ${attrValue}`, "children":getLayers(subgroup2, rules.slice(1,))}]
		}

		return [result];

	}

	function flattenLayout(layers) {

		let maxDepth = d3.max(layers, l => l.depth);
		let childrenNodes = layers.filter(l => l.depth === maxDepth);
		childrenNodes.sort((a, b) => a.x - b.x);

		let result = [];

		for (let c of childrenNodes) {
			let childData = c.data.map(d => {d.isRule = c.isRule; return d});
			childData.sort((a, b) => a._uuid - b._uuid);
			result = result.concat(childData);
		}

		return result

	}

	useEffect(() => {

		let newLayers = getLayers(data, rules, true);
		setLayers(newLayers);

	}, [data, rules])

	useEffect(() => {

		if (layers.length > 0 && layers[0].data.length > 0 && layers[0].data.length < 10000) {

			// Define unit vis svg
			let svgUnit = d3.select(refUnit.current);

			// Define icicle vis svg
			let svgIcicle = d3.select(refIcicle.current);

			// Get rows and cols needed for unit vis
			let [rows, cols] = getLayout(layers[0].data.length, 300);

			// Calculate svg width/height for unit vis
			layout.height = rows * scale + layout.margin * 2;
			layout.width = cols * scale + layout.margin * 2;

			d3.select(refSubset.current).style("min-width", `${layout.width + 250}px`);

			svgUnit.attr("height", layout.height)
				   .attr("width", layout.width);

			// Create icicle bar for base layer
			let icicleLayout = [];

			icicleLayout.push({"x": 0,
						  "y": 0,
						  "width": layout.width - layout.margin * 2,
						  "height":icicleHeight,
						  "attribute": layers[0].attribute,
						  "label": layers[0].label,
						  "depth":0,
						  "data": layers[0].data,
						  "isRule": layers[0].isRule});

			// Get layout for icicle plot
			icicleLayout = icicleLayout.concat(layoutIcicle(layers[0].children, layers[0].data.length, layout.width - layout.margin * 2, 0, 1, layout.margin));

			// Get the number of items in the selected group
			let [selection, selectionSize] = getSelectionSize(icicleLayout);

			setSubset(selection.map(s => s[_index]));

			d3.select(refStats.current)
				.html(`<span style="background-color:steelblue; color:white;">${"&nbsp;"+selectionSize+"&nbsp;"}</span><span style="color:steelblue;"></span>&nbsp;of ${data.length} total items in current subset`);

			let unitData = flattenLayout(icicleLayout);

			// Plot unit vis
			let unitLayer = svgUnit.select("#units");

			let units = unitLayer.selectAll(".units")
					.data(unitData)
					.join("rect")
					.attr("class", "units")
					.attr("x", (d, i) => Math.floor(i / rows) * scale + layout.margin)
					.attr("y", (d, i) => (i - Math.floor(i / rows) * rows) * scale + layout.margin)
					.attr("width", scale - 1)
					.attr("height", scale - 1)
					.attr("fill", "steelblue")
					.attr("opacity", (d) => d.isRule ? 1 : 0.25)

			// Plot icicle plot
			svgIcicle.attr("height", (d3.max(icicleLayout, d => d.depth + 1)) * icicleHeight + layout.margin * 2)
					 .attr("width", layout.width);

			let icicleLayer = svgIcicle.select("#icicles");

			icicleLayer.selectAll(".icicles")
				.data(icicleLayout)
				.join("rect")
				.attr("class", "icicles")
				.attr("fill", "steelblue")
				.attr("opacity", (d, i) => d.isRule ? 1 : 0.25)
				.attr("x", d => d.x + layout.margin)
				.attr("y", d => d.y + layout.margin)
				.attr("width", d => d.width > 2 ? d.width - 2 : 0)
				.attr("height", d => d.height - 1)
				.style("cursor", "pointer")
				.on("click", function (e, d) {

					if (d.attribute === "All") {

						return

					} else if (d.attribute === base) {

						setBase("All");

						let newLayers = getLayers(data, rules, true);
						setLayers(newLayers);

						d3.select(refFilter.current).style("display", "block");

						return;

					} else if (d.attribute != base) {

						setBase(d.attribute);

						let slicedRules = [[]];
						let subsetData = d.data;

						for (let r=0; r<rules.length; r++) {

							let ruleAttribute = rules[r][0];

							if (ruleAttribute === d.attribute) {
								slicedRules = rules.slice(r,);
							}

						}

						let newLayers = getLayers(subsetData, slicedRules, d.isRule).filter(l => l.data.length > 0);
						setLayers(newLayers);

						d3.select(refFilter.current).style("display", "none");

					}
					
				})

			let icicleLabels = svgIcicle.select("#icicleLabels");

			icicleLabels.selectAll(".icicleLabel")
				.data(icicleLayout)
				.join("text")
				.attr("class", "icicleLabel")
				.text(function(d) {

					let labelWithCount = `${d.label} [${d.data.length}]`

					let estimateWidth = labelWithCount.length * 12;

					if (d.width <= 3 * 12) {
						return ""
					} else if (estimateWidth > d.width) {

						let extra = (estimateWidth - d.width) / 12;
						let truncate = labelWithCount.slice(0, labelWithCount.length - 3 - extra);

						return `${truncate}...`

					} else {
						return `${labelWithCount}`
					}
				})
				.attr("text-anchor", "start")
				.attr("alignment-baseline", "middle")
				.attr("x", d => d.x + layout.margin + 8)
				.attr("y", d => d.y + icicleHeight / 2 + 1)
				.attr("fill", (d, i) => d.isRule ? "white" : "black")
				.attr("font-family", "sans-serif")
				.attr("font-weight", 300)
				.style("cursor", "default")

			let maxBrushWidth = Math.ceil(50 / rows) * scale;

			let startIndex = 0;
			let endIndex = maxBrushWidth / scale * rows + startIndex;

			let selectedItems = units.filter(function (u, i) {
				return i >= startIndex && i <= endIndex;
			}).data();

			selectedItems = selectedItems.map(s => s[_index]);

			setIndices(selectedItems);

			d3.select(refShow.current)
				.html(`Showing items ${startIndex} to ${endIndex}`)

			function dragUpdated(e, d) {
				let changeX = e.dx;

				let el = d3.select(this);
				let elX = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);

				let newX = elX + changeX;

				if (newX < 0) {
					newX = 0;
				}

				if ((newX + maxBrushWidth) > cols * scale) {
					newX = layout.width - layout.margin * 2 - maxBrushWidth;
				}

				el.attr("transform", `translate(${newX}, 0)`);
			}

			function dragEnd(e, d) {
				let el = d3.select(this);
				let xStart = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);

				let niceX = Math.round(xStart / scale) * scale;

				el.attr("transform", `translate(${niceX}, 0)`);

				let xEnd = niceX + maxBrushWidth;

				let selectedItems = units.filter(function (u, i) {
					let ux = Math.floor(i / rows) * scale + layout.margin;
					return ux >= xStart && (ux + scale - 1) <= xEnd;
				}).data();

				selectedItems = selectedItems.map(s => s[_index]);

				let startIndex = niceX / scale * rows;
				let endIndex = maxBrushWidth / scale * rows + startIndex;

				endIndex = endIndex > layers[0].data.length ? layers[0].data.length : endIndex;

				d3.select(refShow.current)
					.html(`Showing items ${startIndex} to ${endIndex}`)

				setIndices(selectedItems);
			}

			let drag = d3.drag()
						.on("drag", dragUpdated)
						.on("end", dragEnd);

			svgUnit.selectAll("#brushRect")
				.data([1])
				.join("rect")
				.attr("id", "brushRect")
				.attr("x", layout.margin)
				.attr("y", 0)
				.attr("transform", "translate(0, 0)")
				.attr("width", maxBrushWidth)
				.attr("height", layout.height)
				.attr("fill", "black")
				.attr("opacity", "0.2")
				.style("cursor", "move")
				.call(drag);

		} else if (layers.length > 0 && layers[0].data.length >= 10000) {

			// Define unit vis svg
			d3.select(refUnit.current).select("#units").selectAll("*").remove();
			d3.select(refUnit.current).selectAll("#brushRect").remove();

			// Define icicle vis svg
			let svgIcicle = d3.select(refIcicle.current);

			d3.select(refSubset.current).style("min-width", `${layout.width + 250}px`);

			// Create icicle bar for base layer
			let icicleLayout = [];

			icicleLayout.push({"x": 0,
						  "y": 0,
						  "width": layout.width - layout.margin * 2,
						  "height":icicleHeight,
						  "attribute": layers[0].attribute,
						  "label": layers[0].label,
						  "depth":0,
						  "data": layers[0].data,
						  "isRule": layers[0].isRule});

			// Get layout for icicle plot
			icicleLayout = icicleLayout.concat(layoutIcicle(layers[0].children, layers[0].data.length, layout.width - layout.margin * 2, 0, 1, layout.margin));

			// Get the number of items in the selected group
			let [selection, selectionSize] = getSelectionSize(icicleLayout);

			setSubset(selection);

			setSubset(selection.map(s => s[_index]));

			d3.select(refStats.current)
				.html(`<span style="background-color:steelblue; color:white;">${"&nbsp;"+selectionSize+"&nbsp;"}</span><span style="color:steelblue;"></span>&nbsp;of ${data.length} total items in current subset`);

			// Plot icicle plot
			svgIcicle.attr("height", (d3.max(icicleLayout, d => d.depth + 1)) * icicleHeight + layout.margin * 2)
					 .attr("width", layout.width);

			let icicleLayer = svgIcicle.select("#icicles");

			icicleLayer.selectAll(".icicles")
				.data(icicleLayout)
				.join("rect")
				.attr("class", "icicles")
				.attr("fill", "steelblue")
				.attr("opacity", (d, i) => d.isRule ? 1 : 0.25)
				.attr("x", d => d.x + layout.margin)
				.attr("y", d => d.y + layout.margin)
				.attr("width", d => d.width > 2 ? d.width - 2 : 0)
				.attr("height", d => d.height - 1)
				.style("cursor", "pointer")
				.on("click", function (e, d) {

					if (d.attribute === "All") {

						return

					} else if (d.attribute === base) {

						setBase("All");

						let newLayers = getLayers(data, rules, true);
						setLayers(newLayers);

						d3.select(refFilter.current).style("display", "block");

						return;

					} else if (d.attribute != base) {

						setBase(d.attribute);

						let slicedRules = [[]];
						let subsetData = d.data;

						for (let r=0; r<rules.length; r++) {

							let ruleAttribute = rules[r][0];

							if (ruleAttribute === d.attribute) {
								slicedRules = rules.slice(r,);
							}

						}

						let newLayers = getLayers(subsetData, slicedRules, d.isRule).filter(l => l.data.length > 0);
						setLayers(newLayers);

						d3.select(refFilter.current).style("display", "none");

					}
					
				})

			let icicleLabels = svgIcicle.select("#icicleLabels");

			icicleLabels.selectAll(".icicleLabel")
				.data(icicleLayout)
				.join("text")
				.attr("class", "icicleLabel")
				.text(function(d) {

					let labelWithCount = `${d.label} [${d.data.length}]`

					let estimateWidth = labelWithCount.length * 12;

					if (d.width <= 3 * 12) {
						return ""
					} else if (estimateWidth > d.width) {

						let extra = (estimateWidth - d.width) / 12;
						let truncate = labelWithCount.slice(0, labelWithCount.length - 3 - extra);

						return `${truncate}...`

					} else {
						return `${labelWithCount}`
					}
				})
				.attr("text-anchor", "start")
				.attr("alignment-baseline", "middle")
				.attr("x", d => d.x + layout.margin + 8)
				.attr("y", d => d.y + icicleHeight / 2 + 1)
				.attr("fill", (d, i) => d.isRule ? "white" : "black")
				.attr("font-family", "sans-serif")
				.attr("font-weight", 300)
				.style("cursor", "default");

		}

	}, [layers])

	function handleRules(extent) {

		let attr = extent[0];

		for (let i = 0; i < rules.length; i++) {

			let ruleAttr = rules[i][0];

			if (ruleAttr === attr) {

				rules[i] = extent;
				let newRules = [...rules];
				setRules(newRules);

				return;

			}

		}

		let newRules = [...rules, extent];
		setRules(newRules);

		return;
		
	}

	function deleteRule(attr) {

		for (let i = 0; i < rules.length; i++) {

			let ruleAttr = rules[i][0];

			if (ruleAttr === attr) {

				let newRules = rules.slice(0, i).concat(rules.slice(i+1, ));
				setRules(newRules);

			}

		}

	}

	let containerStyle = {"display": "flex",
						  "flexDirection": "column",
						  "margin": "10px 0px"};

	// let tooltipStyle = {"background": "white",
	// 					"fontFamily": "sans-serif",
	// 					"padding": "10px 20px",
	// 					"border": "solid black 1px",
	// 					"borderRadius": "3px",
	// 					"visibility": "hidden"};

	let subsetContainer = {"display": "flex"};

	let statsContainerStyle = {"padding": layout.margin,
							   "fontFamily": "sans-serif"};

	return (
		<div ref={refContainer} style={containerStyle} >
			{/*<div id="tooltip" style={tooltipStyle} ref={refTooltip}>
			</div>*/}
			<div style={subsetContainer} ref={refSubset}>
				<svg ref={refIcicle}>
					<g id="icicles" />
					<g id="icicleLabels" />
				</svg>
				<div ref={refFilter}>
					<SubsetFilter data={data} handleRules={handleRules} deleteRule={deleteRule} />
				</div>
			</div>
			<div style={statsContainerStyle}>
				<div ref={refStats} />
				<div ref={refShow} />
			</div>
			<svg ref={refUnit}>
				<g id="units" />
			</svg>
		</div>
	)

}