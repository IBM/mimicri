import React, { useRef, useEffect, useState } from "react";
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
export var SubsetSelector = function SubsetSelector(_ref) {
  var _ref$selectionImages = _ref.selectionImages,
    selectionImages = _ref$selectionImages === void 0 ? {
      "images": [],
      "segments": []
    } : _ref$selectionImages,
    _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    _ref$_isVideo = _ref._isVideo,
    _isVideo = _ref$_isVideo === void 0 ? false : _ref$_isVideo,
    _selection = _ref._selection,
    _subset = _ref._subset,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "_uuid" : _ref$_index;
  function setIndices(range) {
    var hidden = document.getElementById(_selection);
    if (hidden) {
      hidden.value = JSON.stringify(Array.from(range));
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', false, true);
      hidden.dispatchEvent(event);
    }
  }
  function setSubset(subsetIndices) {
    var subsetInput = document.getElementById(_subset);
    if (subsetInput) {
      subsetInput.value = JSON.stringify(Array.from(subsetIndices));
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', false, true);
      subsetInput.dispatchEvent(event);
    }
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SubsetDataWrapper, {
    data: data,
    orient: "records",
    setIndices: setIndices,
    setSubset: setSubset,
    _index: _index
  }), _isVideo ? /*#__PURE__*/React.createElement(VideoMulti, {
    images: selectionImages.images,
    overlays: selectionImages.segments
  }) : /*#__PURE__*/React.createElement(FrameMulti, {
    images: selectionImages.images,
    overlays: selectionImages.segments
  }));
};