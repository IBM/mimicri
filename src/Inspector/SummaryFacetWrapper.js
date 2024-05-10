import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { SummaryFacet } from './SummaryFacet.js';
import { SummaryFilterSource } from './SummaryFilterSource.js';
import { SummaryFilterTarget } from './SummaryFilterTarget.js';

export const SummaryFacetWrapper = ({predictions=[],
								  	sourceDemographics,
								  	targetDemographics,
								  	selected,
								  	handleSelection,
								  	segMap,
								  	_index="eid"}) => {

	let groupHeight = 35;
	let baseLayout = {"width": 900,
					  "marginTop": 10,
					  "marginRight": 50,
					  "marginBottom": 10,
					  "marginLeft": 50}

	const [subsets, setSubsets] = useState([]);
	const [layouts, setLayouts] = useState(baseLayout);
	const [uniqueLabels, setUniqueLabels] = useState([]);
	const [layoutHeight, setLayoutHeight] = useState(0);
	const [targetFilterHeight, setTargetFilterHeight] = useState(0);
	const [gridLayout, setGridLayout] = useState({"display":"grid",
												  "gridColumn":"2/3",
												  "gridRow":"2/3",
								                  "gridTemplateColumns":"1fr",
								                  "gridTemplateRows":"1fr",
								                  "gridGap":"0px",
								              	  "width": "900px"});

	// Keep track of attributes and thresholds used for subsets
	const [createSubsets, setCreateSubsets] = useState({});

	useEffect(() => {

		setSubsets([{"label":"", "values":predictions}]);

		let uniqueLabels = Array.from(new Set(predictions.map(p => p.label)));
		setUniqueLabels(uniqueLabels);

		let newLayoutHeight = uniqueLabels.length * groupHeight + baseLayout.marginBottom + baseLayout.marginTop;
		setLayoutHeight(newLayoutHeight);

		setLayouts({...baseLayout, "height": newLayoutHeight});

	}, [predictions])

	useEffect(() => {

		if (!createSubsets.source && !createSubsets.target) {

			setSubsets([{"label":"", "values":predictions}]);
			setLayouts({...baseLayout, "height":layoutHeight});
			setGridLayout({"display":"grid",
						   "gridColumn":"2/3",
						   "gridRow":"2/3",
		                   "gridTemplateColumns":"1fr",
		                   "gridTemplateRows":"1fr",
		                   "gridGap":"0px",
		                   "width": "900px"});
		} else {

			let newSubsets = [];

			// If split by source
			if (createSubsets.source) {

				let sourceAttribute = createSubsets.source.attribute;
				let sourceThreshold = createSubsets.source.threshold;

				let lessThanIndex = new Set(sourceDemographics.filter(d => parseFloat(d[sourceAttribute]) <= sourceThreshold).map(d => d[_index]));
				let moreThanIndex = new Set(sourceDemographics.filter(d => parseFloat(d[sourceAttribute]) > sourceThreshold).map(d => d[_index]));

				let lessThan = predictions.filter(p => lessThanIndex.has(p.sID));
				let moreThan = predictions.filter(p => moreThanIndex.has(p.sID));

				newSubsets = [{"label":`Source: ${sourceAttribute} <= ${sourceThreshold}`, "values":lessThan}, {"label":`Source: ${sourceAttribute} > ${sourceThreshold}`, "values":moreThan}];

			}

			if (createSubsets.target) {

				let targetAttribute = createSubsets.target.attribute;
				let targetThreshold = createSubsets.target.threshold;

				if (newSubsets.length == 0) {

					let lessThanIndex = new Set(targetDemographics.filter(d => parseFloat(d[targetAttribute]) <= targetThreshold).map(d => d[_index]));
					let moreThanIndex = new Set(targetDemographics.filter(d => parseFloat(d[targetAttribute]) > targetThreshold).map(d => d[_index]));

					let lessThan = predictions.filter(p => lessThanIndex.has(p.tID));
					let moreThan = predictions.filter(p => moreThanIndex.has(p.tID));

					newSubsets = [{"label":`Target: ${targetAttribute} <= ${targetThreshold}`, "values":moreThan}, {"label":`Target: ${targetAttribute} > ${targetThreshold}`, "values":lessThan}];

				} else {

					let sourceAttribute = createSubsets.source.attribute;
					let sourceThreshold = createSubsets.source.threshold;

					let sourceLessThan = newSubsets[0]["values"];
					let sourceMoreThan = newSubsets[1]["values"];

					let lessThanIndex = new Set(targetDemographics.filter(d => parseFloat(d[targetAttribute]) <= targetThreshold).map(d => d[_index]));
					let moreThanIndex = new Set(targetDemographics.filter(d => parseFloat(d[targetAttribute]) > targetThreshold).map(d => d[_index]));

					let SLTL = sourceLessThan.filter(p => lessThanIndex.has(p.tID));
					let SLTM = sourceLessThan.filter(p => moreThanIndex.has(p.tID));

					let SMTL = sourceMoreThan.filter(p => lessThanIndex.has(p.tID));
					let SMTM = sourceMoreThan.filter(p => moreThanIndex.has(p.tID));

					newSubsets = [{"label":`Source: ${sourceAttribute} <= ${sourceThreshold} Target: ${targetAttribute} > ${targetThreshold}`, "values":SLTM},
								  {"label":`Source: ${sourceAttribute} > ${sourceThreshold} Target: ${targetAttribute} > ${targetThreshold}`, "values":SMTM},
								  {"label":`Source: ${sourceAttribute} <= ${sourceThreshold} Target: ${targetAttribute} <= ${targetThreshold}`, "values":SLTL},
								  {"label":`Source: ${sourceAttribute} > ${sourceThreshold} Target: ${targetAttribute} <= ${targetThreshold}`, "values":SMTL}];

				}

			}

			setSubsets(newSubsets);

			if (createSubsets.source && createSubsets.target) {

				let newLayout = {...baseLayout, "height":layoutHeight, "width": baseLayout.width / 2};

				setLayouts([newLayout, newLayout, newLayout, newLayout]);
				setGridLayout({"display":"grid",
							   "gridColumn":"2/3",
							   "gridRow":"2/3",
			                   "gridTemplateColumns":"1fr 1fr",
			                   "gridTemplateRows":"1fr 1fr",
			                   "gridGap":"0px",
			               	   "width": "900px"});

				setTargetFilterHeight(layoutHeight * 2);

			} else if (createSubsets.source) {

				let newLayout = {...baseLayout, "height":layoutHeight, "width": baseLayout.width / 2};

				setLayouts([newLayout, newLayout]);
				setGridLayout({"display":"grid",
							   "gridColumn":"2/3",
							   "gridRow":"2/3",
			                   "gridTemplateColumns":"1fr 1fr",
			                   "gridTemplateRows":"1fr",
			                   "gridGap":"0px",
			                   "width": "900px"});

				setTargetFilterHeight(0);

			} else if (createSubsets.target) {

				let newLayout = {...baseLayout, "height":layoutHeight, "width": baseLayout.width};

				setLayouts([newLayout, newLayout]);
				setGridLayout({"display":"grid",
							   "gridColumn":"2/3",
							   "gridRow":"2/3",
			                   "gridTemplateColumns":"1fr",
			                   "gridTemplateRows":"1fr 1fr",
			                   "gridGap":"0px",
			                   "width": "900px"});

				setTargetFilterHeight(layoutHeight * 2);

			}

		}

	}, [createSubsets])

	function handleSourceFilter(attribute, threshold) {

		if (!attribute && !threshold) {

			let newCreateSubsets = {...createSubsets};

			delete newCreateSubsets["source"];

			setCreateSubsets(newCreateSubsets);
			
		} else {

			let newCreateSubsets = {...createSubsets, "source":{"attribute":attribute, "threshold":threshold}};

			setCreateSubsets(newCreateSubsets);
			
		}

	}

	function handleTargetFilter(attribute, threshold) {

		if (!attribute && !threshold) {

			let newCreateSubsets = {...createSubsets};

			delete newCreateSubsets["target"];

			setCreateSubsets(newCreateSubsets);
			
		} else {

			let newCreateSubsets = {...createSubsets, "target":{"attribute":attribute, "threshold":threshold}};

			setCreateSubsets(newCreateSubsets);
			
		}

	}

	let formStyle = {"display":"grid",
	                 "gridTemplateColumns":"auto auto",
	                 "gridTemplateRows":"auto auto",
	                 "gridGap":"0px"};

	let targetFilterStyle = {"gridColumn":"1/2", "gridRow":"2/3"};

	let sourceFilterStyle = {"gridColumn":"2/3", "gridRow":"1/2"};

	let visLayout = {"display":"grid",
	                 "gridTemplateColumns":"auto auto 1fr",
	                 "gridTemplateRows":"auto auto 1fr",
	                 "gridGap":"0px",
	             	 "width":"900px"};

	return (
		<div style={formStyle}>
			<div style={targetFilterStyle}>
	        	<SummaryFilterTarget data={targetDemographics} targetFilterHeight={targetFilterHeight} handleTargetFilter={handleTargetFilter} />
	        </div>
	        <div style={sourceFilterStyle}>
	        	<SummaryFilterSource data={sourceDemographics} handleSourceFilter={handleSourceFilter} />
	        </div>
        	<div style={gridLayout}>
        		{subsets.map((s, i) => {
        			return <SummaryFacet key={`subset${i}`} subsetID={s["label"]} predictions={s["values"]} selected={selected} handleSelection={handleSelection} layout={layouts[i]} />
        		})}
        	</div>
	    </div>
	)
}