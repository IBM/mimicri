import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export const SummaryFilterSource = ({data, handleSourceFilter}) => {

	const [selectedAttribute, setSelectedAttribute] = useState(null);
	const [attributes, setAttributes] = useState([]);
	const [threshold, setThreshold] = useState(0);
	const [minMax, setMinMax] = useState([0, 1]);
	const [step, setStep] = useState(1);

	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);

	// return focus to the button when we transitioned from !open -> open
	const prevOpen = React.useRef(open);

	const refFilter = useRef("FilterVis");
	const sourceSliderRef = React.useRef("sourceSlider");
	const sourceLabelRef = React.useRef("sourceLabel");

	React.useEffect(() => {
		if (prevOpen.current === true && open === false) {
		  anchorRef.current.focus();
		}

		prevOpen.current = open;
	}, [open]);

	let layout = {"height": 60,
				  "width": 900,
				  "marginTop": 10,
				  "marginRight": 50,
				  "marginBottom": 20,
				  "marginLeft": 50};

	let jitterX = 5;
	let jitterY = 20;

	useEffect(() => {

		if (data.length > 0) {

			let newAttributes = Object.keys(data[0]);
			setAttributes(newAttributes);

			d3.select(refFilter.current)
				.attr("width", 0)
				.attr("height", 0);

			d3.select(sourceSliderRef.current)
				.style("display", "none");

			d3.select(sourceLabelRef.current)
				.style("display", "none");

		}

		if (selectedAttribute && data.length > 0) {

			let selectedData = data.map(d => parseFloat(d[selectedAttribute]));

			let svgFilter = d3.select(refFilter.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			d3.select(sourceSliderRef.current)
				.style("display", "block")
				.style("margin-left", `${layout.marginLeft}px`)
				.style("margin-right", `${layout.marginRight}px`)
				.style("width", `${layout.width - layout.marginLeft - layout.marginRight}px`);

			let xScale = d3.scaleLinear()
							.domain(d3.extent(selectedData))
							.range([layout.marginLeft, layout.width - layout.marginRight]);

			svgFilter.selectAll(".filterDistribution")
					.data(selectedData)
					.join("circle")
					.attr("class", "filterDistribution")
					.attr("cx", d => xScale(d) + Math.random() * jitterX - jitterX/2)
					.attr("cy", d => (layout.height - layout.marginTop - layout.marginBottom) / 2 + layout.marginTop + Math.random() * jitterY - jitterY/2)
					.attr("r", 3)
					.attr("fill", "steelblue")
					.attr("opacity", 0.5);

			svgFilter.select("#axis")
					.attr("transform", `translate(${0}, ${layout.height - layout.marginBottom})`)
					.call(d3.axisBottom(xScale).tickSize(3));

			svgFilter.select("#axis").select(".domain").attr("stroke", "none");

			let attributeMean = Math.round(d3.mean(selectedData) * 100) / 100;
			setThreshold(attributeMean);

			let attributeExtent = d3.extent(selectedData);
			if (attributeExtent[0] == attributeExtent[1]) {
				attributeExtent = [attributeExtent[0] - 1, attributeExtent[1] + 1];
			}
			setMinMax(attributeExtent);
			setStep((attributeExtent[1] - attributeExtent[0]) / 10);

			svgFilter.selectAll("#threshold")
					.data([attributeMean])
					.join("line")
					.attr("id", "threshold")
					.attr("x1", d => xScale(d))
					.attr("y1", layout.marginTop - 5)
					.attr("x2", d => xScale(d))
					.attr("y2", layout.height - layout.marginBottom + 5)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "5 2 2 2")
					.attr("stroke-width", "2px");

			d3.select(sourceLabelRef.current)
				.style("display", "grid")
				.selectAll(".sourceLabels")
				.data([`<=${Math.round(attributeMean * 100) / 100}`, `>${Math.round(attributeMean * 100) / 100}`])
				.join("p")
				.attr("class", "sourceLabels")
				.html(d => d);

		}

	}, [data, selectedAttribute])

	useEffect(() => {

		let svgFilter = d3.select(refFilter.current);

		let selectedData = data.map(d => parseFloat(d[selectedAttribute]));

		let xScale = d3.scaleLinear()
						.domain(d3.extent(selectedData))
						.range([layout.marginLeft, layout.width - layout.marginRight]);

		svgFilter.selectAll("#threshold")
					.data([threshold])
					.join("line")
					.attr("id", "threshold")
					.attr("x1", d => xScale(d))
					.attr("y1", layout.marginTop - 5)
					.attr("x2", d => xScale(d))
					.attr("y2", layout.height - layout.marginBottom + 5)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "5 2 2 2")
					.attr("stroke-width", "2px");

		d3.select(sourceLabelRef.current)
			.selectAll(".sourceLabels")
			.data([`<=${Math.round(threshold * 100) / 100}`, `>${Math.round(threshold * 100) / 100}`])
			.join("p")
			.attr("class", "sourceLabels")
			.html(d => d);

		handleSourceFilter(selectedAttribute, threshold);

	}, [threshold])

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
		  event.preventDefault();
		  setOpen(false);
		} else if (event.key === 'Escape') {
		  setOpen(false);
		}
	}

	function handleOpen() {
		setOpen((prevOpen) => !prevOpen);
	};

	function handleDeselect() {

		handleSourceFilter(null, null);
		setSelectedAttribute(null);

	};

	function handleClose(event, attr) {

		setSelectedAttribute(attr);
		handleSourceFilter(attr, d3.mean(data, d => d[attr]));

		setOpen(false);

	};

	function handleThreshold(event, value) {

		setThreshold(value);

	}

	let buttonStyle = {"height": "50px",
					   "padding": "0px 20px 0px 50px"};

	let containerStyle = {"display": "flex",
						  "flexDirection": "column",
						  "alignItems": "flex-start"};

	let labelStyle = {"display": "grid",
					  "gridTemplateColumns":"auto auto",
					  "justifyContent":"space-around",
					  "width":"100%"};

	return (
		<div style={containerStyle}>
			{selectedAttribute
			? 	<Button
					ref={anchorRef}
					id="composition-button"
					style={buttonStyle}
					aria-controls={open ? 'composition-menu' : undefined}
					aria-expanded={open ? 'true' : undefined}
					aria-haspopup="true"
					onClick={handleDeselect}
					startIcon={<CancelOutlinedIcon />}>
					{`${selectedAttribute}`}
		        </Button>
		    :   <Button
					ref={anchorRef}
					id="composition-button"
					style={buttonStyle}
					aria-controls={open ? 'composition-menu' : undefined}
					aria-expanded={open ? 'true' : undefined}
					aria-haspopup="true"
					onClick={handleOpen}
					startIcon={<ControlPointIcon />}>
					Filter by Source
		        </Button>
			}
	        <Popper
	        	style={{"zIndex": 1}}
				open={open}
				anchorEl={anchorRef.current}
				role={undefined}
				placement="bottom-start"
				transition
				disablePortal>
				{({ TransitionProps, placement }) => (
	            <Grow
	              	{...TransitionProps}
	              	style={{
		              	maxHeight: '300px',
		              	overflow: 'scroll',
		                transformOrigin:
	                  		placement === 'bottom-start' ? 'left top' : 'left bottom'}}>
	              	<Paper>
	                	<ClickAwayListener onClickAway={handleClose}>
	                  		<MenuList
			                    autoFocusItem={open}
			                    id="composition-menu"
			                    aria-labelledby="composition-button"
			                    onKeyDown={handleListKeyDown}>
			                  	{attributes.map((attr, i) => {
									return <MenuItem key={`filter${i}`} onClick={(e) => handleClose(e, attr)}>{attr}</MenuItem>})}
	                  		</MenuList>
	                	</ClickAwayListener>
	              	</Paper>
	            </Grow>
	          	)}
	        </Popper>
			<svg ref={refFilter}>
				<g id="axis" />
				<g id="main" />
			</svg>
			<Slider ref={sourceSliderRef}
					value={threshold}
					min={minMax[0]}
					max={minMax[1]}
					step={step}
					onChange={handleThreshold}
					aria-label="Default"
					valueLabelDisplay="auto" />
			<div ref={sourceLabelRef} style={labelStyle} />
		</div>
	)

}