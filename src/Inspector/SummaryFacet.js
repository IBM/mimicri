import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export const SummaryFacet = ({subsetID,
							  predictions,
							  selected,
							  handleSelection,
						   	  segMap,
						   	  layout={"height": 300,
									  "width": 900,
									  "marginTop": 10,
									  "marginRight": 50,
									  "marginBottom": 10,
									  "marginLeft": 50}}) => {

	const refFacet = useRef("FacetVis");

	useEffect(() => {

		if (predictions.length == 0) {

			let svgFacet = d3.select(refFacet.current)
							.attr("width", 0)
							.attr("height", 0);

		} 

		if (predictions.length > 0) {

			let padding = 2;

			let groupedPredictions = d3.group(predictions, d => d.label);

			let svgFacet = d3.select(refFacet.current);

			let groupHeight = 35;
			let groups = Array.from(groupedPredictions.keys()).sort();
			layout.height = groups.length * groupHeight + layout.marginBottom + layout.marginTop;

			svgFacet.attr("width", layout.width)
					.attr("height", layout.height);

			svgFacet.selectAll(".group")
					.data(groups)
					.join("g")
					.attr("class", "group")
					.attr("id", g => `group${g}`)
					.attr("transform", (d, i) => `translate(${0}, ${i * groupHeight + layout.marginTop})`);

			for (let g of groups) {

				let groupData = groupedPredictions.get(g);

				let isCounterfactual = groupData.filter(d => (d.r_prediction[1] < 0.5 && d.t_prediction[1] > 0.5) || (d.r_prediction[1] > 0.5 && d.t_prediction[1] < 0.5));
				let isNotCounterfactual = groupData.filter(d => (d.r_prediction[1] < 0.5 && d.t_prediction[1] < 0.5) || (d.r_prediction[1] > 0.5 && d.t_prediction[1] > 0.5));

				let proportionCounterfactual = isCounterfactual.length / groupData.length;
				let widthCounterfactual = (layout.width - layout.marginLeft - layout.marginRight) * proportionCounterfactual
				let proportionSame = 1 - proportionCounterfactual;

				let svgGroup = svgFacet.select(`#group${g}`);

				svgGroup.selectAll("#isCounterfactual")
					.data([proportionCounterfactual])
					.join("rect")
					.attr("id", "isCounterfactual")
					.attr("x", layout.marginLeft)
					.attr("y", padding)
					.attr("width", d => (layout.width - layout.marginLeft - layout.marginRight) * d)
					.attr("height", groupHeight - padding * 2)
					.attr("fill", "green")
					.attr("opacity", 0.8)
					.attr("cursor", "pointer")
					.on("click", function() {

						handleSelection(selected, isCounterfactual, `<b>${g}_counterfactuals</b> ${subsetID}`.trim());

						// console.log(isCounterfactual);

					});

				svgGroup.selectAll("#notCounterfactual")
					.data([proportionSame])
					.join("rect")
					.attr("id", "notCounterfactual")
					.attr("x", d => (layout.width - layout.marginRight) - (layout.width - layout.marginLeft - layout.marginRight) * d)
					.attr("y", padding)
					.attr("width", d => (layout.width - layout.marginLeft - layout.marginRight) * d)
					.attr("height", groupHeight - padding * 2)
					.attr("fill", "gray")
					.attr("opacity", 0.3)
					.attr("cursor", "pointer")
					.on("click", function() {

						handleSelection(selected, isNotCounterfactual, `<b>${g}_no counterfactuals</b> ${subsetID}`.trim());

						// console.log(isNotCounterfactual);

					});

				svgGroup.selectAll("#groupLabel")
					.data([g])
					.join("text")
					.attr("id", "groupLabel")
					.attr("text-anchor", "end")
					.attr("alignment-baseline", "middle")
					.attr("y", groupHeight / 2)
					.attr("x", layout.marginLeft - 10)
					.attr("font-family", "sans-serif")
					.attr("font-size", 15)
					.text(d => d);

			}

		}

	}, [predictions, selected])

	return (
		<svg ref={refFacet}>
			<g id="axis" />
			<g id="main" />
		</svg>
	)

}