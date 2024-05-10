import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { SummaryRow } from "./SummaryRow.js";

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export const SummarySubset = ({selected,
							   segMap={},
							   extents,
							   handleSelection,
							   _index="eid"}) => {

	const [selectedSegments, setSelectedSegments] = useState({});

	let segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10)
		 					  .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

	useEffect(() => {

		setSelectedSegments(JSON.parse(JSON.stringify(segMap)));

	}, [segMap])

	function toggleCheckbox(s) {

		let selected = Object.keys(selectedSegments);

		if (selected.indexOf(s) >= 0) {

			let newSelectedSegments = JSON.parse(JSON.stringify(selectedSegments));
			delete newSelectedSegments[s];

			setSelectedSegments(newSelectedSegments);

		} else {

			let newSelectedSegments = JSON.parse(JSON.stringify(selectedSegments));
			newSelectedSegments[s] = segMap[s];

			setSelectedSegments(newSelectedSegments);

		}
	}

	function handleDeleteSelection(label) {

		handleSelection(selected, [], label);
		
	}

	let controls = {"display":"flex",
					"margin": "30px 0px 10px 30px",
					"flexDirection":"row"};

	return (
		<div>
			<FormGroup style={controls}>
				{Object.keys(segMap).map((seg, i) => <FormControlLabel key={`${seg}${i}`} control={<Checkbox defaultChecked style={{color: segmentColorScale(parseInt(seg))}} onChange={() => toggleCheckbox(seg)} />} label={segMap[seg] ? segMap[seg] : seg} />)}
	    	</FormGroup>
			{Object.keys(selected).map(s => {
					return <SummaryRow key={s}
									   title={s}
									   selected={selected[s]}
									   segMap={selectedSegments}
									   extents={extents}
									   handleDeleteSelection={handleDeleteSelection} />
			})}
		</div>
	)

}