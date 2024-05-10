import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { SummaryVideoArea } from "./SummaryVideoArea.js";
import { SummaryCentroidMap } from './SummaryCentroidMap.js';
import { SummaryRadials } from './SummaryRadials.js';
import { SummaryColors } from './SummaryColors.js';

import IconButton from '@mui/material/IconButton';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export const SummaryVideoRow = ({selected,
							title,
							segMap,
							handleDeleteSelection,
							extents}) => {

	const [selectedAreas, setSelectedAreas] = useState([]);
	const [selectedCentroids, setSelectedCentroids] = useState([]);
	const [selectedRadials, setSelectedRadials] = useState([]);
	const [selectedColors, setSelectedColors] = useState([]);
	const [frame, setFrame] = useState(0);

	const refSummaryRow = useRef("refSummaryRow");

	useEffect(() => {

		d3.select(refSummaryRow.current).html(title);

	}, [title])

	useEffect(() => {

		let newSelectedAreas = selected.map(s => s["areas"]);
		let newSelectedCentroids = selected.map(s => s["centroids"]).map(d => d[frame]);
		let newSelectedRadials = selected.map(s => s["radials"]).map(d => d[frame]);
		let newSelectedColors = selected.map(s => s["colors"]).map(d => d[frame]);

		setSelectedAreas(newSelectedAreas);
		setSelectedCentroids(newSelectedCentroids);
		setSelectedRadials(newSelectedRadials);
		setSelectedColors(newSelectedColors);
		
	}, [selected, segMap, frame])

	let rowStyle = {"fontFamily":"sans-serif",
					"marginLeft":"30px"};

	let titleStyle = {"display":"flex",
					  "flexDirection":"row",
					  "alignItems":"center",
					  "fontStyle":"italic"};

	let containerStyle = {"display":"flex"};

	return (
		<div style={rowStyle}>
			<div style={titleStyle}>
				<IconButton onClick={() => handleDeleteSelection(title)} aria-label="delete" size="small">
		        	<CancelOutlinedIcon fontSize="inherit" />
		        </IconButton>
				<p ref={refSummaryRow}></p>
			</div>
			<SummaryVideoArea selectedAreas={selectedAreas} segMap={segMap} extents={extents["areas"]} frame={frame} setFrame={setFrame} />
			<div style={containerStyle}>
				<SummaryCentroidMap selectedCentroids={selectedCentroids} segMap={segMap} frame={frame} />
				<SummaryRadials selectedRadials={selectedRadials} segMap={segMap} extents={extents["radials"]} frame={frame} />
				<SummaryColors selectedColors={selectedColors} segMap={segMap} extents={extents["colors"]} frame={frame} />
			</div>
		</div>
	)

}