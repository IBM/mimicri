import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryRadials = ({selectedRadials,
								segMap,
								extents,
								frame}) => {

	const refRadial = useRef("Radial");

	let layout = {"height": 300,
				  "width": 300,
				  "margin": 30};

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	function isIQR(data) {

		let positions = data[0].length;

		for (let i = 0; i < positions; i++) {

			let allPositionValues = Array.from(new Set(data.map(d => d[i])));

			if (allPositionValues.length < 5) {
				return false
			}

		}

		return true

	}

	function getIQR(data) {

		let dropNan = data.filter(d => !isNaN(parseFloat(d))).sort((a, b) => a - b);

		let median = d3.median(dropNan, d => d);

		let middleIndex = dropNan.length / 2;

		let top = dropNan.filter((d, i) => i > middleIndex);
		let bottom = dropNan.filter((d, i) => i < middleIndex);

		let Q3 = d3.median(top, d => d);
		let Q1 = d3.median(bottom, d => d);

		let min = d3.min(dropNan, d => d);
		let max = d3.max(dropNan, d => d);

		return [min, Q1, median, Q3, max]

	}

	function getFlat(data) {

		let result = [];

		for (let d of data) {

			for (let i = 0; i < d.length; i++) {

				result.push({"direction":i, "value": d[i]});

			}

		}

		return result

	}

	useEffect(() => {

		let plotSize = 300;

		if (selectedRadials.length > 0) {

			layout.width = Object.keys(segMap).length * plotSize;

			let svgRadial = d3.select(refRadial.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			svgRadial.selectAll(`.groups`)
						.data(Object.keys(segMap))
						.join("g")
						.attr("class", "groups")
						.attr("id", (d, i) => `group${d}`)
						.attr("transform", (d, i) => `translate(${plotSize * i + plotSize / 2}, ${(plotSize - layout.margin) / 2})`);

			svgRadial.selectAll(`.titles`)
						.data(Object.keys(segMap))
						.join("text")
						.attr("class", "titles")
						.attr("text-anchor", "middle")
						.attr("transform", (d, i) => `translate(${plotSize * i + plotSize / 2}, ${layout.height - 10})`)
						.attr("font-family", "sans-serif")
						.text(d => `contours ${segMap[d]}`);

			for (let s of Object.keys(segMap)) {

				let segData = selectedRadials.map(r => r[s]);

				// Plot IQR if five or more unique data values selected
				if (isIQR(segData)) {

					let allDirections = [];

					for (let direction = 0; direction < segData[0].length; direction++) {

						let directionData = segData.map(d => d[direction]);

						allDirections.push(getIQR(directionData));

					}

					let scaleX = d3.scaleBand()
									.domain([0, 1, 2, 3, 4, 5, 6, 7])
									.range([0, 2 * Math.PI]);

					let scaleY = d3.scaleRadial()
									.domain(extents)
									.range([0, plotSize / 2 - layout.margin]);

					let plotGroup = svgRadial.select(`#group${s}`);

					let barWidth = scaleX.bandwidth();

					plotGroup.selectAll(`.prediction`).remove();

					plotGroup.selectAll(`.bars`)
								.data(allDirections)
								.join("path")
								.attr("class", `bars`)
								.attr("d", d3.arc()
											.innerRadius(d => scaleY(d[1]))
											.outerRadius(d => scaleY(d[3]))
											.startAngle((d, i) => scaleX(i) - barWidth / 2)
											.endAngle((d, i) => scaleX(i) + barWidth / 2))
								.attr("fill", segmentColorScale(parseInt(s)));

					plotGroup.selectAll(`.whisker`)
							.data(allDirections)
							.join("line")
							.attr("class", `whisker`)
							.attr("x1", (d, i) => scaleY(d[0]) * Math.sin(scaleX(i)))
							.attr("y1", (d, i) => - scaleY(d[0]) * Math.cos(scaleX(i)))
							.attr("x2", (d, i) => scaleY(d[4]) * Math.sin(scaleX(i)))
							.attr("y2", (d, i) => - scaleY(d[4]) * Math.cos(scaleX(i)))
							.attr("stroke", segmentColorScale(parseInt(s)));
							// .attr("stroke-width", 2);

					plotGroup.selectAll(`.mid`)
								.data(allDirections)
								.join("path")
								.attr("class", `mid`)
								.attr("d", d3.arc()
											.innerRadius(d => scaleY(d[2]) - 0.5)
											.outerRadius(d => scaleY(d[2]) + 0.5)
											.startAngle((d, i) => scaleX(i) - barWidth / 2)
											.endAngle((d, i) => scaleX(i) + barWidth / 2))
								.attr("fill", "white");

					let dashArray = Math.PI / 6 / 5;

					plotGroup.selectAll(`.axis`)
								.data([extents[1], extents[1], extents[1]])
								.join("path")
								.attr("class", `axis`)
								.attr("d", d3.arc()
											.innerRadius(d => scaleY(d) - 0.5)
											.outerRadius(d => scaleY(d) + 0.5)
											.startAngle((d, i) => 0 - Math.PI / 12 + (i * dashArray * 2))
											.endAngle((d, i) => 0 - Math.PI / 12 + (i * dashArray * 2) + dashArray))
								.attr("fill", "black");

					plotGroup.selectAll(`.axisLabelMax`)
								.data([extents[1]])
								.join("text")
								.attr("class", `axisLabelMax`)
								.text(d => d)
								.attr("text-anchor", "middle")
								.attr("x", 0)
								.attr("y", -plotSize / 2 + 27)
								.attr("font-size", 11)
								.attr("font-family", "sans-serif");

					plotGroup.selectAll(`.axisLabelMin`)
								.data(["0.0"])
								.join("text")
								.attr("class", `axisLabelMin`)
								.text(d => d)
								.attr("text-anchor", "middle")
								.attr("alignment-baseline", "middle")
								.attr("x", 0)
								.attr("y", 0)
								.attr("font-size", 11)
								.attr("font-family", "sans-serif");

				} else {

					let flattened = getFlat(segData);

					let scaleX = d3.scaleBand()
									.domain([0, 1, 2, 3, 4, 5, 6, 7])
									.range([0, 2 * Math.PI]);

					let scaleY = d3.scaleRadial()
									.domain(extents)
									.range([0, plotSize / 2 - layout.margin]);

					let plotGroup = svgRadial.select(`#group${s}`);

					let barWidth = scaleX.bandwidth();

					plotGroup.selectAll(`.bars`).remove();
					plotGroup.selectAll(`.whisker`).remove();
					plotGroup.selectAll(`.mid`).remove();

					plotGroup.selectAll(`.prediction`)
								.data(flattened)
								.join("path")
								.attr("class", `prediction`)
								.attr("d", d3.arc()
											.innerRadius(d => scaleY(d.value) - 1)
											.outerRadius(d => scaleY(d.value) + 1)
											.startAngle((d, i) => scaleX(d.direction) - barWidth / 2)
											.endAngle((d, i) => scaleX(d.direction) + barWidth / 2))
								.attr("fill", segmentColorScale(parseInt(s)));

					let dashArray = Math.PI / 6 / 5;

					plotGroup.selectAll(`.axis`)
								.data([extents[1], extents[1], extents[1]])
								.join("path")
								.attr("class", `axis`)
								.attr("d", d3.arc()
											.innerRadius(d => scaleY(d) - 0.5)
											.outerRadius(d => scaleY(d) + 0.5)
											.startAngle((d, i) => 0 - Math.PI / 12 + (i * dashArray * 2))
											.endAngle((d, i) => 0 - Math.PI / 12 + (i * dashArray * 2) + dashArray))
								.attr("fill", "black");

					plotGroup.selectAll(`.axisLabelMax`)
								.data([extents[1]])
								.join("text")
								.attr("class", `axisLabelMax`)
								.text(d => d)
								.attr("text-anchor", "middle")
								.attr("x", 0)
								.attr("y", -plotSize / 2 + 27)
								.attr("font-size", 11)
								.attr("font-family", "sans-serif");

					plotGroup.selectAll(`.axisLabelMin`)
								.data(["0.0"])
								.join("text")
								.attr("class", `axisLabelMin`)
								.text(d => d)
								.attr("text-anchor", "middle")
								.attr("alignment-baseline", "middle")
								.attr("x", 0)
								.attr("y", 0)
								.attr("font-size", 11)
								.attr("font-family", "sans-serif");

				}

			}

		}

	}, [selectedRadials, segMap, extents])

	return (
		<div>
			<svg ref={refRadial}>
			</svg>
		</div>
	)

}