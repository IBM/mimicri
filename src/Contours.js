import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const Contours = ({contours,
						  segMap,
						  cellScale=1/128}) => {

	const refContours = useRef("Contours");

	let layout = {"height": 300,
				  "width": 300,
				  "marginTop": 10,
				  "marginRight": 20,
				  "marginBottom": 40,
				  "marginLeft": 30};

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	useEffect(() => {

		if (contours) {

			let cellSize = cellScale * (layout.width - layout.marginLeft - layout.marginRight);

			let xScale = d3.scaleLinear()
							.domain([0, 1])
							.range([layout.marginLeft, layout.width - layout.marginRight]);

			let yScale = d3.scaleLinear()
							.domain([0, 1])
							.range([layout.height - layout.marginBottom, layout.marginTop]);

			let svgContours = d3.select(refContours.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgContours.select("#title")
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("transform", `translate(${layout.width / 2 + 10}, ${layout.height - 10})`)

			svgContours.select("#xAxis")
						.attr("transform", `translate(${0}, ${layout.height - layout.marginBottom})`)
						.call(d3.axisBottom(xScale).tickSize(3).ticks(5));

			svgContours.select("#yAxis")
						.attr("transform", `translate(${layout.marginLeft}, ${0})`)
						.call(d3.axisLeft(yScale).tickSize(3).ticks(5));

			svgContours.selectAll("#border")
						.data([0])
						.join("rect")
						.attr("id", "border")
						.attr("x", layout.marginLeft)
						.attr("y", layout.marginTop)
						.attr("width", layout.width - layout.marginLeft - layout.marginRight)
						.attr("height", layout.height - layout.marginTop - layout.marginBottom)
						.attr("fill", "none")
						.attr("stroke", "black")
						.attr("stroke-width", "1px");

			for (let s of Object.keys(segMap)) {

				let segmentContours = contours[s];

				let opacityScale = d3.scaleLog()
									.domain(d3.extent(segmentContours, d => d.value))
									.range([0, 1])

				svgContours.selectAll(`.cell${s}`)
							.data(segmentContours)
							.join("rect")
							.attr("class", `cell${s}`)
							.attr("x", d => xScale(d.x))
							.attr("y", d => yScale(d.y))
							.attr("width", cellSize)
							.attr("height", cellSize)
							.attr("fill", segmentColorScale(parseInt(s)))
							.attr("opacity", d => opacityScale(d.value))

			}

		}

	}, [contours, segMap])

	return (
		<div>
			<svg ref={refContours}>
				<g id="xAxis" />
				<g id="yAxis" />
				<text id="title">segment contours</text>
			</svg>
		</div>
	)

}