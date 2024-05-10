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

export const SummaryFilterTarget = ({data, targetFilterHeight, handleTargetFilter}) => {

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
	const targetSliderRef = React.useRef("targetSlider");
	const targetLabelRef = React.useRef("targetLabel");

	React.useEffect(() => {
		if (prevOpen.current === true && open === false) {
		  anchorRef.current.focus();
		}

		prevOpen.current = open;
	}, [open]);

	let layout = {"width": 60,
				  "marginTop": 10,
				  "marginRight": 20,
				  "marginBottom": 10,
				  "marginLeft": 10};

	let jitterX = 20;
	let jitterY = 5;

	useEffect(() => {

		if (data.length > 0) {

			let newAttributes = Object.keys(data[0]);
			setAttributes(newAttributes);

			d3.select(refFilter.current)
				.attr("width", 0)
				.attr("height", 0);

			d3.select(targetSliderRef.current)
				.style("display", "none");

			d3.select(targetLabelRef.current)
				.style("display", "none");

		}

		if (selectedAttribute && data.length > 0) {

			let selectedData = data.map(d => parseFloat(d[selectedAttribute]));

			layout.height = targetFilterHeight;

			let svgFilter = d3.select(refFilter.current)
								.attr("width", layout.width)
								.attr("height", layout.height);

			d3.select(targetSliderRef.current)
				.style("display", "block")
				.style("margin-top", `${layout.marginTop}px`)
				.style("margin-bottom", `${layout.marginBottom}px`)
				.style("height", `${layout.height - layout.marginTop - layout.marginBottom}px`);

			let yScale = d3.scaleLinear()
							.domain(d3.extent(selectedData))
							.range([layout.height - layout.marginBottom, layout.marginTop]);

			svgFilter.selectAll(".filterDistribution")
					.data(selectedData)
					.join("circle")
					.attr("class", "filterDistribution")
					.attr("cy", d => yScale(d) + Math.random() * jitterY - jitterY/2)
					.attr("cx", d => (layout.width - layout.marginLeft - layout.marginRight) / 2 + layout.marginLeft + Math.random() * jitterX - jitterX/2)
					.attr("r", 3)
					.attr("fill", "steelblue")
					.attr("opacity", 0.5);

			svgFilter.select("#axis")
					.attr("transform", `translate(${layout.width - layout.marginRight}, ${0})`)
					.call(d3.axisRight(yScale).tickSize(3));

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
					.attr("y1", d => yScale(d))
					.attr("x1", layout.marginLeft - 5)
					.attr("y2", d => yScale(d))
					.attr("x2", layout.width - layout.marginRight + 5)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "5 2 2 2")
					.attr("stroke-width", "2px");

			d3.select(targetLabelRef.current)
				.style("display", "grid")
				.selectAll(".targetLabels")
				.data([`>${Math.round(attributeMean * 100) / 100}`, `<=${Math.round(attributeMean * 100) / 100}`])
				.join("p")
				.attr("class", "targetLabels")
				.html(d => d);

		}

	}, [data, targetFilterHeight, selectedAttribute])

	useEffect(() => {

		let svgFilter = d3.select(refFilter.current);

		let selectedData = data.map(d => parseFloat(d[selectedAttribute]));

		let yScale = d3.scaleLinear()
						.domain(d3.extent(selectedData))
						.range([targetFilterHeight - layout.marginBottom, layout.marginTop]);

		svgFilter.selectAll("#threshold")
					.data([threshold])
					.join("line")
					.attr("id", "threshold")
					.attr("y1", d => yScale(d))
					.attr("x1", layout.marginLeft - 5)
					.attr("y2", d => yScale(d))
					.attr("x2", layout.width - layout.marginRight + 5)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "5 2 2 2")
					.attr("stroke-width", "2px");

		d3.select(targetLabelRef.current)
			.selectAll(".targetLabels")
			.data([`>${Math.round(threshold * 100) / 100}`, `<=${Math.round(threshold * 100) / 100}`])
			.join("p")
			.attr("class", "targetLabels")
			.html(d => d);

		handleTargetFilter(selectedAttribute, threshold);

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

		handleTargetFilter(null, null);
		setSelectedAttribute(null);

	};

	function handleClose(event, attr) {

		setSelectedAttribute(attr);

		setOpen(false);
	};

	function handleThreshold(event, value) {

		setThreshold(value);

	}

	let buttonStyle = {"height": "50px",
					   "padding": "0px 20px"};

	let containerStyle = {"display": "flex",
						  "flexDirection": "row",
						  "marginTop": "0px",
						  "justifyContent": "flex-end"};

	let sliderStyle = {"display": "flex",
					   "flexDirection": "row"};

	let labelStyle = {"display": "grid",
					  "gridTemplateRows":"auto auto",
					  "justifyContent":"space-around",
					  "alignItems":"center",
					  "marginLeft":"15px",
					  "marginRight":"5px"};

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
					Filter by Target
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
	        <div style={sliderStyle}>
				<svg ref={refFilter}>
					<g id="axis" />
					<g id="main" />
				</svg>
				<Slider ref={targetSliderRef}
						orientation="vertical"
						value={threshold}
						min={minMax[0]}
						max={minMax[1]}
						step={step}
						onChange={handleThreshold}
						aria-label="Default"
						valueLabelDisplay="auto" />
			</div>
			<div ref={targetLabelRef} style={labelStyle} />
		</div>
	)

}