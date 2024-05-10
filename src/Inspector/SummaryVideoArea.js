import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryVideoArea = ({selectedAreas,
							  extents,
							  segMap,
							  frame,
							  setFrame}) => {

	const refVideoArea = useRef("VideoArea");

	let layout = {"height": 120,
				  "width": 1200,
				  "marginTop": 20,
				  "marginRight": 10,
				  "marginBottom": 20,
				  "marginLeft": 30};

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	function getExtent(data) {

		let dropNan = data.filter(d => !isNaN(parseFloat(d))).sort((a, b) => a - b);

		let mean = d3.mean(dropNan, d => d);

		let min = d3.min(dropNan, d => d);
		let max = d3.max(dropNan, d => d);

		return [min, mean, max]

	}

	function getFrameExtents(frames) {

		let result = [];

		for (let f of frames) {

			let frameSummary = getExtent(f);
			result.push(frameSummary);

		}

		return result

	}

	useEffect(() => {

		if (selectedAreas.length > 0) {

			let allExtent = [d3.min(Object.keys(extents).map(e => d3.min(extents[e]))), d3.max(Object.keys(extents).map(e => d3.max(extents[e])))];

			let svgVideoAreas = d3.select(refVideoArea.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgVideoAreas.select("#title")
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("transform", `translate(${layout.width / 2 + 10}, ${layout.marginTop})`)

			svgVideoAreas.select("#main")
						.selectAll(`.groups`)
						.data(Object.keys(segMap))
						.join("g")
						.attr("class", "groups")
						.attr("id", (d, i) => `group${d}`);

			let frameCount = selectedAreas[0].length;

			let xScale = d3.scaleLinear()
							.domain([0, frameCount-1])
							.range([layout.marginLeft, layout.width - layout.marginRight]);

			let yScale = d3.scaleLinear()
								.domain(allExtent)
								.range([layout.height - layout.marginBottom, layout.marginTop]);

			svgVideoAreas.selectAll("#xAxis")
						.attr("transform", `translate(${0}, ${layout.height - layout.marginBottom})`)
						.call(d3.axisBottom(xScale).ticks(5).tickSize(3));

			let frameWidth = xScale(1) - xScale(0);

			function dragUpdated(e, d) {
				let changeX = e.dx;

				let el = d3.select(this);
				let elX = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);

				let newX = elX + changeX;

				if (newX < 0) {
					newX = 0;
				}

				if (newX > (layout.width - layout.marginRight - frameWidth / 2)) {
					newX = layout.width - layout.marginRight - frameWidth / 2;
				}

				if (newX < layout.marginLeft - frameWidth / 2) {
					newX = layout.marginLeft - frameWidth / 2;
				}

				el.attr("transform", `translate(${newX}, 0)`);
			}

			function dragEnd(e, d) {
				let el = d3.select(this);
				let xStart = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]) - layout.marginLeft;

				let niceX = Math.round((xStart + frameWidth / 2) / frameWidth);

				setFrame(niceX);
			}

			let drag = d3.drag()
						.on("drag", dragUpdated)
						.on("end", dragEnd)

			let brush = svgVideoAreas.selectAll("#brushRect")
									.data([1])
									.join("rect")
									.attr("id", "brushRect")
									.attr("x", 0)
									.attr("y", 0)
									.attr("transform", `translate(${layout.marginLeft + frameWidth * frame - frameWidth / 2}, 0)`)
									.attr("width", frameWidth)
									.attr("height", layout.height)
									.attr("fill", "black")
									.attr("opacity", "0.2")
									.style("cursor", "move")
									.call(drag);

			for (let si=0; si < Object.keys(segMap).length; si++) {

				let s = Object.keys(segMap)[si];

				let allFrames = [];

				for (let f=0; f < frameCount; f++) {

					let frameMeta = selectedAreas.map(a => a[f][s]);
					allFrames.push(frameMeta);

				}

				let frameExtents = getFrameExtents(allFrames);

				let area = d3.area()
							.x((d, i) => xScale(i))
							.y0(d => yScale(d[0]))
							.y1(d => yScale(d[2]));

				let segGroup = svgVideoAreas.select(`#group${s}`);

				let line = d3.line()
							.x((d, i) => xScale(i))
							.y(d => yScale(d[1]));

				segGroup.selectAll(`.area`)
							.data([frameExtents])
							.join("path")
							.attr("class", `area`)
							.attr("d", area)
							.attr("fill", segmentColorScale(parseInt(s)))
							.attr("opacity", 0.25);

				segGroup.selectAll(`.path`)
							.data([frameExtents])
							.join("path")
							.attr("class", `path`)
							.attr("d", line)
							.attr("fill", "none")
							.attr("stroke", segmentColorScale(parseInt(s)))
							.attr("stroke-width", 2);

			}

		}

	}, [selectedAreas, segMap, extents, frame])

	return (
		<div>
			<svg ref={refVideoArea}>
				<text id="title">area distribution over time</text>
				<g id="xAxis" />
				<g id="yAxis" />
				<g id="main" />
				<rect id="brushRect" />
			</svg>
		</div>
	)

}