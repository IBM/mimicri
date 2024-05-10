import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryArea = ({selectedAreas,
							  extents,
							  segMap}) => {

	const refArea = useRef("Area");

	let layout = {"height": 300,
				  "width": 300,
				  "marginTop": 10,
				  "marginRight": 10,
				  "marginBottom": 30,
				  "marginLeft": 30};

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	useEffect(() => {

		let binCount = 20;
		let histogramMargin = 30;

		if (selectedAreas.length > 0) {

			let histogramHeight = (layout.height - layout.marginTop - layout.marginBottom) / Object.keys(segMap).length;

			let svgAreas = d3.select(refArea.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgAreas.select("#title")
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("transform", `translate(${layout.width / 2 + 10}, ${layout.height - 10})`)

			svgAreas.selectAll(`.groups`)
						.data(Object.keys(segMap))
						.join("g")
						.attr("class", "groups")
						.attr("id", (d, i) => `group${d}`)
						.attr("transform", (d, i) => `translate(${0}, ${i * histogramHeight})`);

			for (let si=0; si < Object.keys(segMap).length; si++) {

				let s = Object.keys(segMap)[si];

				let xScale = d3.scaleLinear()
								.domain(extents[s])
								.range([layout.marginLeft, layout.width - layout.marginRight])
								.nice();

				let histogram = d3.bin()
								.domain(xScale.domain())
								.thresholds(binCount)
								.value(a => a[parseInt(s)]);

				let sBins = histogram(selectedAreas);

				let yScale = d3.scaleLinear()
								.domain(d3.extent(sBins, d => d.length))
								.range([0, histogramHeight - histogramMargin]);

				let segGroup = svgAreas.select(`#group${s}`);

				segGroup.selectAll(`.rect`)
							.data(sBins)
							.join("rect")
							.attr("class", `rect`)
							.attr("x", d => xScale(d.x0))
							.attr("y", d => histogramHeight - yScale(d.length))
							.attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
							.attr("height", d => yScale(d.length))
							.attr("fill", segmentColorScale(parseInt(s)));

				segGroup.selectAll("#xAxis")
						.data([s])
						.join("g")
						.attr("id", `xAxis`)
						.attr("transform", `translate(${0}, ${histogramHeight})`)
						.call(d3.axisBottom(xScale).ticks(5).tickSize(3));

			}

		}

	}, [selectedAreas, segMap, extents])

	return (
		<div>
			<svg ref={refArea}>
				<g id="xAxis" />
				<g id="yAxis" />
				<text id="title">area distribution</text>
			</svg>
		</div>
	)

}