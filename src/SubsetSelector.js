import React, {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

import { FrameMulti } from './FrameMulti.js';
import { VideoMulti } from './VideoMulti.js';
import { SegmentSelector } from './SegmentSelector.js';
import { SubsetDataWrapper } from './SubsetDataWrapper.js';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
// import TabPanel from '@mui/lab/TabPanel';

import { Allotment } from "allotment";
import "allotment/dist/style.css";

/* Parameters:
	- selectionImages: Dict {"images": [2D-array, 2D-array...], "segments": [2D-array, 2D-array...]}
	- segMap: optional, Dict {index: "Segment Name", ...}
	- data: [{var1:..., var2:..., ...}, {...}, ...]
*/
export const SubsetSelector = ({selectionImages={"images":[], "segments":[]},
								data=[],
								segMap={},
								_isVideo=false,
								_selection,
								_subset,
								_index="_uuid"}) => {

	function setIndices(range) {

		let hidden = document.getElementById(_selection);

	    if (hidden) {
	        hidden.value = JSON.stringify(Array.from(range));
	        var event = document.createEvent('HTMLEvents');
	        event.initEvent('input', false, true);
	        hidden.dispatchEvent(event);
	    }
	}

	function setSubset(subsetIndices) {
		let subsetInput = document.getElementById(_subset);

		if (subsetInput) {
			subsetInput.value = JSON.stringify(Array.from(subsetIndices));
			var event = document.createEvent('HTMLEvents');
	        event.initEvent('input', false, true);
	        subsetInput.dispatchEvent(event);
		}
	}

	return (
		<div>
			<SubsetDataWrapper
				data={data}
				orient="records"
				setIndices={setIndices}
				setSubset={setSubset}
				_index={_index} />
			{_isVideo
				? <VideoMulti images={selectionImages.images} overlays={selectionImages.segments} />
				: <FrameMulti images={selectionImages.images} overlays={selectionImages.segments} />
			}
		</div>
	)

}