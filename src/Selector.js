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
	- mainImage: Dict {"images": [2D-array], "segments": [2D-array]}
	- selectionImages: Dict {"images": [2D-array, 2D-array...], "segments": [2D-array, 2D-array...]}
	- segMap: optional, Dict {index: "Segment Name", ...}
	- data: [{var1:..., var2:..., ...}, {...}, ...]
	- selectSource: true if user selects subset from source, false if selecting targets
*/
export const Selector = ({mainImage={"images":[], "segments":[]},
						  selectionImages={"images":[], "segments":[]},
						  data=[],
						  segMap={},
						  selectSource=true,
						  _isVideo=false,
						  _selection,
						  _segment,
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

	function setSegments(segmentList) {
		let segmentInput = document.getElementById(_segment);

		if (segmentInput) {
			segmentInput.value = JSON.stringify(Array.from(segmentList));
			var event = document.createEvent('HTMLEvents');
	        event.initEvent('input', false, true);
	        segmentInput.dispatchEvent(event);
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

	let mainLayout = {"display":"flex",
					  "flexDirection":"row"};

	let imageLayout = {"display":"flex",
					  "flexDirection":"column",
					  "height":"1000px"};

	let fontStyle = {"fontFamily": "sans-serif"};

	let tabStyle = {"marginLeft": "0px"};

	return (
		<div style={imageLayout}>
			<Allotment vertical={true}>
				<Allotment.Pane snap preferredSize={"600px"}>
					<Box>
						<Button disabled sx={{ "&.MuiButtonBase-root": {"padding": "10px 0px 20px 0px", "color": "rgba(0, 0, 0, 0.6)"} }}>select recombinant segment</Button>
					</Box>
					<SegmentSelector
						image={mainImage.images[0]}
						segmentation={mainImage.segments[0]}
						segMap={segMap}
						setSegments={setSegments}
						isVideo={_isVideo} />
				</Allotment.Pane>
				<Allotment.Pane snap>
					<Box>
						{selectSource
							? <Button disabled sx={{ "&.MuiButtonBase-root": {"padding": "10px 0px 10px 0px", "color": "rgba(0, 0, 0, 0.6)"} }}>source images</Button>
							: <Button disabled sx={{ "&.MuiButtonBase-root": {"padding": "10px 0px 10px 0px", "color": "rgba(0, 0, 0, 0.6)"} }}>target images</Button>
						}
					</Box>
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
				</Allotment.Pane>
			</Allotment>
		</div>
	)

}