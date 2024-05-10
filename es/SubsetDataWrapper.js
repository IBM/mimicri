import React, { useRef, useEffect, useState } from "react";
import { SubsetVis } from './SubsetVis.js';
export var SubsetDataWrapper = function SubsetDataWrapper(_ref) {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$orient = _ref.orient,
    orient = _ref$orient === void 0 ? "split" : _ref$orient,
    setIndices = _ref.setIndices,
    setSubset = _ref.setSubset,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "_uuid" : _ref$_index;
  var _useState = useState([]),
    processedData = _useState[0],
    setProcessedData = _useState[1];

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

  useEffect(function () {
    if (orient === "records" && Array.isArray(data)) {
      var indexData = data.map(function (d, i) {
        d["_uuid"] = i;
        return d;
      });
      setProcessedData(indexData);
    } else if (orient === "split" && data.constructor == Object) {
      var indices = data.index;
      var columns = data.columns;
      var values = data.data;
      var newProcessedData = [];
      for (var i = 0; i < indices.length; i++) {
        var row = {};
        for (var c = 0; c < columns.length; c++) {
          var colName = columns[c];
          var value = values[i][c];
          row[colName] = value;
        }
        newProcessedData.push(row);
      }
      var _indexData = newProcessedData.map(function (d, i) {
        d["_uuid"] = i;
        return d;
      });
      setProcessedData(newProcessedData);
    }
  }, []);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SubsetVis, {
    data: processedData,
    setIndices: setIndices,
    setSubset: setSubset,
    _index: _index
  }));
};