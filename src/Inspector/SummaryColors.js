import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryColors = ({selectedColors,
							    extents,
								segMap,
								frame}) => {

	const refColors = useRef("ColorsVis");

	let layout = {"height": 300,
				  "width": 300,
				  "marginTop": 10,
				  "marginRight": 10,
				  "marginBottom": 30,
				  "marginLeft": 30};

	let colorScale = d3.scaleSequential(d3.interpolateGreys);

	useEffect(() => {

		let binCount = 11;
		let histogramMargin = 30;

		if (selectedColors.length > 0) {

			let histogramHeight = (layout.height - layout.marginTop - layout.marginBottom) / Object.keys(segMap).length;

			let svgColors = d3.select(refColors.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgColors.select("#title")
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("transform", `translate(${layout.width / 2 + 10}, ${layout.height - 10})`)

			svgColors.selectAll(`.groups`)
						.data(Object.keys(segMap))
						.join("g")
						.attr("class", "groups")
						.attr("id", (d, i) => `group${d}`)
						.attr("transform", (d, i) => `translate(${0}, ${i * histogramHeight})`);

			for (let si=0; si < Object.keys(segMap).length; si++) {

				let s = Object.keys(segMap)[si];

				let allColors = selectedColors.map(c => c[s]);
				allColors = allColors.flat(1);

				let xScale = d3.scaleLinear()
								.domain(extents[s])
								.range([layout.marginLeft, layout.width - layout.marginRight])
								.nice();

				let histogram = d3.bin()
								.domain(xScale.domain())
								.thresholds(binCount)
								.value(a => a);

				let cBins = histogram(allColors);

				let yScale = d3.scaleLinear()
								.domain(d3.extent(cBins, d => d.length))
								.range([0, histogramHeight - histogramMargin]);

				let segGroup = svgColors.select(`#group${s}`);

				colorScale.domain(extents[s]);

				segGroup.selectAll(`.rect`)
							.data(cBins)
							.join("rect")
							.attr("class", `rect`)
							.attr("x", d => xScale(d.x0))
							.attr("y", d => histogramHeight - yScale(d.length))
							.attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
							.attr("height", d => yScale(d.length))
							.attr("fill", d => colorScale(d3.median(d)));

				segGroup.selectAll("#xAxis")
						.data([s])
						.join("g")
						.attr("id", `xAxis`)
						.attr("transform", `translate(${0}, ${histogramHeight})`)
						.call(d3.axisBottom(xScale).ticks(5).tickSize(3));

			}

		}

	}, [selectedColors, segMap, extents])

	return (
		<div>
			<svg ref={refColors}>
				<g id="xAxis" />
				<g id="yAxis" />
				<text id="title">color distribution</text>
			</svg>
		</div>
	)

}