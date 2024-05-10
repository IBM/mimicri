import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';

import ControlPointIcon from '@mui/icons-material/ControlPoint';

import { HistogramSelector } from './HistogramSelector.js';

export const SubsetFilter = ({data=[],
							  handleRules,
							  deleteRule}) => {

	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);

	const [attributes, setAttributes] = useState({}); // Attributes in data set and set of unique values
	const [selection, setSelection] = useState({}); // Selected range for each attribute in data set

	const [histogramSelectors, setHistogramSelectors] = useState([]); // Histogram selectors to show

	useEffect(() => {

		if (data.length > 0) {
			let allAttributes = Object.keys(data[0]);
			let newAttributes = {};
			let newSelection = [];

			for (let a of allAttributes) {
				let uniqueValues = new Set(data.filter(d => d[a] != '').map(d => Number(d[a])));

				// The following lines filter out attributes with no records
				if (Array.from(uniqueValues).length === 0 || Array.from(uniqueValues)[0] === undefined) {
					continue;
				}

				newAttributes[a] = uniqueValues;
				newSelection[a] = d3.extent(uniqueValues);
			}

			setAttributes(newAttributes);
			setSelection(newSelection);
		}
		
	}, [data])

	function handleToggle() {
		setOpen((prevOpen) => !prevOpen);
	};

	function handleClose(event, attr) {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
		  return;
		}

		setOpen(false);

		if (attr) {

			if (histogramSelectors.includes(attr)) {
				return;
			} else {
				let newHistogramSelectors = [...histogramSelectors, attr];
				setHistogramSelectors(newHistogramSelectors);
				handleRules([attr, d3.extent(Array.from(attributes[attr]))]);

				return;
			}

		}
	};

	function updateSelectors(attr) {

		for (let i = 0; i < histogramSelectors.length; i++) {

			let a = histogramSelectors[i];

			if (attr === a) {

				let newHistogramSelectors = histogramSelectors.slice(0, i).concat(histogramSelectors.slice(i+1, ));
				setHistogramSelectors(newHistogramSelectors);

				let newSelection = {...selection};
				let uniqueValues = new Set(data.filter(d => d[attr] != '').map(d => Number(d[attr])));
				newSelection[attr] = d3.extent(uniqueValues);

				setSelection(newSelection);

				deleteRule(attr);

			}

		}

	}

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
		  event.preventDefault();
		  setOpen(false);
		} else if (event.key === 'Escape') {
		  setOpen(false);
		}
	}

	function handleSelection(attr, newSelectionRange) {
		let newSelection = {...selection};
		newSelection[attr] = newSelectionRange;
		setSelection(newSelection);
	}

	function handleChangeComplete(attr, newSelectionRange) {
		let newSelection = {...selection};
		newSelection[attr] = newSelectionRange;
		setSelection(newSelection);

		handleRules([attr, newSelectionRange]);
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpen = React.useRef(open);

	React.useEffect(() => {
		if (prevOpen.current === true && open === false) {
		  anchorRef.current.focus();
		}

		prevOpen.current = open;
	}, [open]);

	let formStyle = {"width": "250px",
					 "marginTop": "10px"};

	let buttonStyle = {"height": "50px",
					   "padding": "0px 20px"};

	return (
		<div style={formStyle}>
	        <Button
				ref={anchorRef}
				id="composition-button"
				style={buttonStyle}
				aria-controls={open ? 'composition-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup="true"
				onClick={handleToggle}
				startIcon={<ControlPointIcon />}>
				Add Filter
	        </Button>
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
			                  	{Object.keys(attributes).map((attr, i) => {
									return <MenuItem key={`filter${i}`} onClick={(e) => handleClose(e, attr)}>{attr}</MenuItem>})}
	                  		</MenuList>
	                	</ClickAwayListener>
	              	</Paper>
	            </Grow>
	          	)}
	        </Popper>
	        <div id="histogramContainer">
	        	{histogramSelectors.map((attr, i) => {
					return <HistogramSelector
								key={i}
								attr={attr}
								values={Array.from(attributes[attr])}
								data={data}
								handleSelection={handleSelection}
								selection={selection[attr]}
								handleChangeComplete={handleChangeComplete}
								updateSelectors={updateSelectors} />
				})}
	        </div>
	    </div>
	)
}