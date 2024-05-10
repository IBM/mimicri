import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryCentroidMap = ({selectedCentroids,
							 		segMap,
							 		frame}) => {

	const refCentroids = useRef("CentroidMap");

	let layout = {"height": 300,
				  "width": 300,
				  "marginTop": 10,
				  "marginRight": 20,
				  "marginBottom": 40,
				  "marginLeft": 30};

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	useEffect(() => {

		let binSize = 0.025;

		if (selectedCentroids.length > 0) {

			let binCounts = {};

			for (let c of selectedCentroids) {

				for (let s of Object.keys(segMap)) {

					let sCentroid = c[s];

					let xBin = Math.floor(sCentroid[1] / binSize);
					let yBin = Math.floor(sCentroid[0] / binSize);

					let binID = `${xBin}${yBin}`;

					if (!binCounts[binID]) {
						binCounts[binID] = {"x": xBin, "y": yBin};

						for (let si of Object.keys(segMap)) {
							binCounts[binID][si] = 0;
						}
					}
					
					binCounts[binID][s]++;

				}

			}

			let centroidMatrix = [];

			for (let b of Object.keys(binCounts)) {
				centroidMatrix.push(binCounts[b]);
			}

			let cellSize = (layout.width - layout.marginLeft - layout.marginRight) * binSize;

			let maxOpacity = 1 / Object.keys(segMap).length;

			let xScale = d3.scaleLinear()
							.domain([0, 1])
							.range([layout.marginLeft, layout.width - layout.marginRight]);

			let yScale = d3.scaleLinear()
							.domain([0, 1])
							.range([layout.height - layout.marginBottom, layout.marginTop]);

			let svgCentroids = d3.select(refCentroids.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgCentroids.select("#title")
					.attr("text-anchor", "middle")
					.attr("font-family", "sans-serif")
					.attr("transform", `translate(${layout.width / 2 + 10}, ${layout.height - 10})`)

			svgCentroids.select("#xAxis")
						.attr("transform", `translate(${0}, ${layout.height - layout.marginBottom})`)
						.call(d3.axisBottom(xScale).tickSize(3).ticks(5));

			svgCentroids.select("#yAxis")
						.attr("transform", `translate(${layout.marginLeft}, ${0})`)
						.call(d3.axisLeft(yScale).tickSize(3).ticks(5));

			svgCentroids.selectAll("#border")
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

			svgCentroids.selectAll(`.groups`)
						.data(Object.keys(segMap))
						.join("g")
						.attr("class", "groups")
						.attr("id", (d, i) => `group${d}`);

			for (let s of Object.keys(segMap)) {
				let sScale = d3.scaleLinear()
								.domain(d3.extent(centroidMatrix, c => c[s]))
								.range([0, 1])

				let segGroup = svgCentroids.select(`#group${s}`);

				segGroup.selectAll(`.cell`)
					.data(centroidMatrix)
					.join("rect")
					.attr("class", `cell`)
					.attr("x", d => cellSize * d.x + layout.marginLeft)
					.attr("y", d => cellSize * d.y + layout.marginTop)
					.attr("width", cellSize)
					.attr("height", cellSize)
					.attr("fill", d => segmentColorScale(parseInt(s)))
					.attr("opacity", d => sScale(d[s]))
			}

		}

	}, [selectedCentroids, segMap, frame])

	return (
		<div>
			<svg ref={refCentroids}>
				<g id="xAxis" />
				<g id="yAxis" />
				<text id="title">centroids distribution</text>
			</svg>
		</div>
	)

}