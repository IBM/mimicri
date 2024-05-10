import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { SummaryFacetWrapper } from "./Inspector/SummaryFacetWrapper.js";
import { SummarySubset } from "./Inspector/SummarySubset.js";
import { SummaryVideoSubset } from "./Inspector/SummaryVideoSubset.js";

export const Inspector = ({predictions,
						   demographics,
						   segMap={},
						   _index="eid",
						   _isVideo=false}) => {

	const [selected, setSelected] = useState({});
	const [selectedSegments, setSelectedSegments] = useState(JSON.parse(JSON.stringify(segMap)));
	const [sourceDemographics, setSourceDemographics] = useState([]);
	const [targetDemographics, setTargetDemographics] = useState([]);
	const [extents, setExtents] = useState({"radials":[0, 1], "areas":[0, 1], "colors":[0, 255]});

	useEffect(() => {

		if (!_isVideo) {
			let newExtents = {};

			let radials = predictions.map(p => p["radials"]);
			let newMaxRadial = d3.max(Object.keys(radials).map(r => d3.max(Object.keys(radials[r]).map(s => d3.max(radials[r][s])))));
			newExtents["radials"] = [0, Math.round(newMaxRadial * 100) / 100];

			let areas = predictions.map(p => p["areas"]);
			let colors = predictions.map(p => p["colors"]);

			let newAreaExtents = {};
			let newColorExtents = {};

			for (let s of Object.keys(segMap)) {
				let sArea = d3.extent(areas.map(a => a[s]));
				newAreaExtents[s] = sArea;

				let sColorMax = d3.max(colors.map(c => d3.max(c[s])));
				newColorExtents[s] = [0, sColorMax];
			}

			newExtents["areas"] = newAreaExtents;
			newExtents["colors"] = newColorExtents;

			setExtents(newExtents);	
		} else {
			let newExtents = {};

			let radials = predictions.map(p => p["radials"]);
			let newMaxRadial = d3.max(radials.map(idFrames => d3.max(idFrames.map(frame => d3.max(Object.keys(segMap).map(s => d3.max(frame[s])))))));
			newExtents["radials"] = [0, Math.round(newMaxRadial * 100) / 100];

			let areas = predictions.map(p => p["areas"]);
			let areaMin = d3.min(areas.map(frames => d3.min(frames.map(segments => d3.min(Object.keys(segMap).map(s => segments[s]))))));
			let areaMax = d3.max(areas.map(frames => d3.max(frames.map(segments => d3.max(Object.keys(segMap).map(s => segments[s]))))));
			let newAreaExtents = {"all": [areaMin, areaMax]};

			let colors = predictions.map(p => p["colors"]);
			let newColorExtents = {};

			for (let s of Object.keys(segMap)) {
				let sColorMax = d3.max(colors.map(idFrames => d3.max(idFrames.map(frame => d3.max(frame[s])))));
				newColorExtents[s] = [0, sColorMax];
			}

			newExtents["areas"] = newAreaExtents;
			newExtents["colors"] = newColorExtents;

			setExtents(newExtents);	
		}		

	}, [_isVideo])

	useEffect(() => {

		let sources = new Set(predictions.map(p => p.sID));
		let targets = new Set(predictions.map(p => p.tID));

		let newSourceDemographics = demographics.filter(d => sources.has(d[_index]));
		let newTargetDemographics = demographics.filter(d => targets.has(d[_index]));

		setSourceDemographics(newSourceDemographics);
		setTargetDemographics(newTargetDemographics);

	}, [predictions, demographics])

	function handleSelection(selected, selection, label) {

		let selectedLabels = Object.keys(selected);

		if (selectedLabels.indexOf(label) >= 0 && selection.length > 0) {

			// Update threshold
			let newSelection = JSON.parse(JSON.stringify(selected));
			newSelection[label] = selection;

			setSelected(newSelection);

		} else if (selectedLabels.indexOf(label) >= 0 && selection.length == 0) {

			// Remove attribute and threshold
			let newSelection = JSON.parse(JSON.stringify(selected));
			delete newSelection[label];

			setSelected(newSelection);

		} else if (selectedLabels.indexOf(label) == -1 && selection.length > 0) {

			// Add new attribute and threshold
			let newSelection = JSON.parse(JSON.stringify(selected));
			newSelection[label] = selection;

			setSelected(newSelection);

		}
	}

	let overviewStyle = {"display": "flex"};

	return (
		<div>
			<div style={overviewStyle}>
				<SummaryFacetWrapper sourceDemographics={sourceDemographics}
									targetDemographics={targetDemographics}
									predictions={predictions}
									selected={selected}
									handleSelection={handleSelection}
									segMap={segMap}
									_index={_index} />
			</div>
			{_isVideo
			? <SummaryVideoSubset selected={selected}
								   segMap={segMap}
								   extents={extents}
								   handleSelection={handleSelection} />
			: <SummarySubset selected={selected}
							   segMap={segMap}
							   extents={extents}
							   handleSelection={handleSelection} />}
		</div>
	)

}