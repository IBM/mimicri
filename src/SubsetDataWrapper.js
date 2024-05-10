import React, {useRef, useEffect, useState} from "react";

import { SubsetVis } from './SubsetVis.js';

export const SubsetDataWrapper = ({data=[],
								   orient="split",
								   setIndices,
								   setSubset,
								   _index="_uuid"}) => {

	const [processedData, setProcessedData] = useState([]);

	// function newSetIndices(range) {

	// 	let hidden = document.getElementById(_selection);

	//     if (hidden) {
	//         hidden.value = JSON.stringify(Array.from(range));
	//         var event = document.createEvent('HTMLEvents');
	//         event.initEvent('input', false, true);
	//         hidden.dispatchEvent(event);
	//     }
	// }

	// const [setIndices, setSetIndices] = useState(() => newSetIndices);

	// useEffect(() => {

	// 	function newSetIndices(range) {

	// 		let hidden = document.getElementById(_selection);

	// 		console.log("setting indices... ", range, hidden);

	// 	    if (hidden) {
	// 	        hidden.value = JSON.stringify(Array.from(range));
	// 	        var event = document.createEvent('HTMLEvents');
	// 	        event.initEvent('input', false, true);
	// 	        hidden.dispatchEvent(event);
	// 	    }
	// 	}

	// 	setSetIndices(() => newSetIndices);

	// }, [_selection])

	useEffect(() => {

		if (orient === "records" && Array.isArray(data)) {
			let indexData = data.map((d, i) => {d["_uuid"] = i; return d});

			setProcessedData(indexData);
		} else if (orient === "split" && data.constructor == Object) {

			let indices = data.index;
			let columns = data.columns;
			let values = data.data;

			let newProcessedData = [];

			for (let i=0; i<indices.length; i++) {

				let row = {};

				for (let c=0; c<columns.length; c++) {

					let colName = columns[c];
					let value = values[i][c];

					row[colName] = value;

				}

				newProcessedData.push(row);

			}

			let indexData = newProcessedData.map((d, i) => {d["_uuid"] = i; return d});

			setProcessedData(newProcessedData);
		}

	}, [])

	return (
		<div>
			<SubsetVis 
				data={processedData}
				setIndices={setIndices}
				setSubset={setSubset}
				_index={_index} />
		</div>
	)

}