import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { styled } from '@mui/system';

import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';

import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

export const HistogramSelector = ({layout={"height": 30, "width": 180, "margin": 12, "marginLeft": 10, "marginTop": 3},
									attr="",
									values=[],
									data=[],
									handleSelection,
									selection,
									handleChangeComplete,
									updateSelectors}) => {

	// const [selected, setSelected] = useState([0, 0])

	let bins = 12;

	const ref = useRef("svgHistogram");
	const filterRef = useRef("filterRef");
	const deleteRef = useRef("deleteButton");

	function getTicks(n) {
		if (n <= 5) {
			return n
		}

		while (n > 5) {
			n = Math.floor(n / 2);
		}

		return n
	}

	function formatTick(n) {
		let formatted = d3.format(".2~r")(n);

		if (formatted === "NaN") {
			return n
		}

		return formatted
	}

	useEffect(() => {

		d3.select(deleteRef.current).style("visibility", "hidden");

		d3.select(filterRef.current)
			.on("mouseover", () => { d3.select(deleteRef.current).style("visibility", "visible") })
			.on("mouseout", () => { d3.select(deleteRef.current).style("visibility", "hidden") })

	}, [])

	useEffect(() => {

		let svgContainer = d3.select(ref.current);
		let svg = svgContainer.select("svg");

		if (values.length === 0 || values[0] === undefined) {
			svgContainer.style("display", "none");
			return;
		}

		if (values.length < 20) {
			svgContainer.style("display", "flex");

			let filteredData = data.filter(d => d[attr] != '');

			let histogramBins = d3.groups(filteredData, d => parseFloat(d[attr]));

			let xScale = d3.scaleBand()
							.domain(histogramBins.map(b => b[0]).sort((a, b) => a - b))
							.range([layout.marginLeft, layout.width - layout.margin])

			let yScale = d3.scaleLinear()
							.domain([0, d3.max(histogramBins, b => b[1].length)])
							.range([layout.height - layout.margin, layout.marginTop])

			svg.selectAll(".bars")
				.data(histogramBins)
				.join("rect")
				.attr("class", "bars")
				.attr("x", d => xScale(d[0]))
				.attr("y", d => yScale(d[1].length))
				.attr("width", d => xScale.bandwidth() - 1)
				.attr("height", d => yScale(0) - yScale(d[1].length))
				.attr("fill", "steelblue")

			svg.select("#x-axis")
				.attr("transform", `translate(0, ${layout.height - layout.margin})`)
				.call(d3.axisBottom(xScale).tickSize(0).ticks(getTicks(values.length)).tickFormat(formatTick))
		} else {
			svgContainer.style("display", "flex");

			var histogram = d3.bin()
							.value(d => parseFloat(d[attr]))
							.domain(d3.extent(values))
							.thresholds(bins);

			let filteredData = data.filter(d => d[attr] != '');

			var histogramBins = histogram(filteredData);

			let xScale = d3.scaleLinear()
							.domain([d3.min(histogramBins, b => b.x0), d3.max(histogramBins, b => b.x1)])
							.range([layout.marginLeft, layout.width - layout.margin])

			let yScale = d3.scaleLinear()
							.domain([0, d3.max(histogramBins, b => b.length)])
							.range([layout.height - layout.margin, layout.marginTop])

			svg.selectAll(".bars")
				.data(histogramBins)
				.join("rect")
				.attr("class", "bars")
				.attr("x", d => xScale(d.x0))
				.attr("y", d => yScale(d.length))
				.attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
				.attr("height", d => yScale(0) - yScale(d.length))
				.attr("fill", "steelblue")

			svg.select("#x-axis")
				.attr("transform", `translate(0, ${layout.height - layout.margin})`)
				.call(d3.axisBottom(xScale).tickSize(0).ticks(getTicks(values.length)).tickFormat(formatTick))
		}

	}, [data, values, attr])

	useEffect(() => {
		
		let svgContainer = d3.select(ref.current);
		let svg = svgContainer.select("svg");

		svg.selectAll(".bars")
			.attr("opacity", d => {
				if (values.length < 20) {
					// if (attr.startsWith("own_or")) {
					// 	console.log(d, selection, parseFloat(d[0]), parseFloat(d[0]) >= selection[0] && parseFloat(d[0]) <= selection[1])
					// }
					return (parseFloat(d[0]) >= selection[0] && parseFloat(d[0]) <= selection[1]) ? 1.0 : 0.25
				} else {
					return d.x0 >= selection[0] && d.x1 <= selection[1] ? 1.0 : 0.25
				}
			})

	}, [selection])

	function handleChange(e, v) {
		handleSelection(attr, v);
	}

	function valuetext(v) {
		return v
	}

	let filterStyle = {"display": "flex",
					   "alignItems": "center"};

	let emptyTitleStyle = {"marginBottom": "0px",
						  	"fontSize": "12px",
						  	"fontFamily": "sans-serif",
							"color": "red"};

	let titleStyle = {"margin": `2px 0px 0px ${layout.margin}px`,
					  "fontSize": "12px",
					  "fontFamily": "sans-serif",
					  "width": layout.width,
					  "overflow": "hidden"};

	let containerStyle = {"display": "flex",
						  "flexDirection": "column",
						  "padding": "0px"};

	let sliderStyle = {"width": layout.width - layout.margin - layout.marginLeft,
					   "marginLeft": `${layout.marginLeft}px`,
					   "padding": "0px",
					   "position": "absolute",
					   "top": layout.height - layout.margin,
					   "left": "0px",
					   ".MuiSlider-thumb": { "width": "10px", "height": "10px", "color": "white", "border": "solid 2px steelblue" }};

	let histogramSelectorStyle = {"position": "relative"};

	let deleteButtonStyle = {"visibility": "hidden"};

	return (
		<div style={filterStyle} ref={filterRef}>
			<div style={containerStyle} ref={ref}>
				<p style={titleStyle}>{attr}</p>
				<div style={histogramSelectorStyle}>
					<Slider
					 	sx={sliderStyle}
				        getAriaLabel={() => attr}
				        value={selection}
				        onChange={(e, v) => handleSelection(attr, v)}
				        onChangeCommitted={(e, v) => handleChangeComplete(attr, v)}
				        valueLabelDisplay="auto"
				        getAriaValueText={valuetext}
				        min={isNaN(Math.min(...values)) ? 0 : Math.min(...values)}
				        max={isNaN(Math.max(...values)) ? 0 : Math.max(...values)}
				        size="small"/>
					<svg width={layout.width} height={layout.height}>
						<g id="x-axis"/> 
					</svg>
			    </div>
		    </div>
		    <IconButton ref={deleteRef}
		    			onClick={() => updateSelectors(attr)}
		    			aria-label="delete">
	        	<ClearIcon />
	      	</IconButton>
		</div>
	)

}