function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { FrameRender } from './FrameRender.js';
import { VideoRender } from './VideoRender.js';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
export var SegmentSelector = function SegmentSelector(_ref) {
  var _ref$image = _ref.image,
    image = _ref$image === void 0 ? [] : _ref$image,
    _ref$segmentation = _ref.segmentation,
    segmentation = _ref$segmentation === void 0 ? [] : _ref$segmentation,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    setSegments = _ref.setSegments,
    _ref$isVideo = _ref.isVideo,
    isVideo = _ref$isVideo === void 0 ? false : _ref$isVideo,
    _selection = _ref._selection;
  var _useState = useState([]),
    uniqueSegments = _useState[0],
    setUniqueSegments = _useState[1];
  var _useState2 = useState(new Set()),
    selectedSegments = _useState2[0],
    setSelectedSegments = _useState2[1];
  var _useState3 = useState(segmentation),
    overlay = _useState3[0],
    setOverlay = _useState3[1];
  var _useState4 = useState(false),
    open = _useState4[0],
    setOpen = _useState4[1];
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // const [segmentColor, setSegmentColor] = useState(() => segmentColorScale);

  useEffect(function () {
    if (isVideo) {
      var newUniqueSegments = Array.from(new Set(segmentation[0].flat())).filter(function (segNum) {
        return segNum != 0;
      });
      newUniqueSegments.sort(function (a, b) {
        return a - b;
      });
      setUniqueSegments(newUniqueSegments);
      setSelectedSegments(new Set(newUniqueSegments));
    } else {
      var _newUniqueSegments = Array.from(new Set(segmentation.flat())).filter(function (segNum) {
        return segNum != 0;
      });
      _newUniqueSegments.sort(function (a, b) {
        return a - b;
      });
      setUniqueSegments(_newUniqueSegments);
      setSelectedSegments(new Set(_newUniqueSegments));
    }

    // let newSegmentColorScale = d3.scaleOrdinal(d3.schemeGnBu[newUniqueSegments.length + 2].slice(2,))
    //  					.domain(newUniqueSegments);

    // setSegmentColor(() => newSegmentColorScale);
  }, []);
  useEffect(function () {
    if (isVideo) {
      var newOverlay = [];
      for (var _iterator = _createForOfIteratorHelperLoose(segmentation), _step; !(_step = _iterator()).done;) {
        var frame = _step.value;
        var newFrame = frame.map(function (row) {
          return row.map(function (cell) {
            return selectedSegments.has(cell) ? cell : 0;
          });
        });
        newOverlay.push(newFrame);
      }
      setOverlay([].concat(newOverlay));
    } else {
      var _newOverlay = segmentation.map(function (row) {
        return row.map(function (cell) {
          return selectedSegments.has(cell) ? cell : 0;
        });
      });
      setOverlay([].concat(_newOverlay));
    }
  }, [selectedSegments]);
  function toggleCheckbox(s) {
    var newSelectedSegments;
    if (selectedSegments.has(s)) {
      selectedSegments["delete"](s);
      newSelectedSegments = new Set(selectedSegments);
    } else {
      selectedSegments.add(s);
      newSelectedSegments = new Set(selectedSegments);
    }
    setSelectedSegments(newSelectedSegments);
    setSegments(Array.from(newSelectedSegments));
  }

  // function startRecombine() {
  // 	let hidden = document.getElementById(_selection);
  //     let selection = JSON.stringify(Array.from(selectedSegments));

  //     if (hidden) {
  //         hidden.value = selection;
  //         var event = document.createEvent('HTMLEvents');
  //         event.initEvent('input', false, true);
  //         hidden.dispatchEvent(event);
  //     }

  //     handleClose();
  // }

  function handleClose() {
    setOpen(false);
  }
  function handleOpen() {
    setOpen(true);
  }
  var selectorLayout = {
    "display": "flex",
    "marginBottom": "20px",
    "marginLeft": "10px"
  };
  var recombineButton = {
    "marginTop": "15px"
  };
  var controls = {
    "minWidth": "200px",
    "maxWidth": "250px",
    "margin": "0px 20px 0px 0px"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: selectorLayout
  }, /*#__PURE__*/React.createElement(FormGroup, {
    style: controls
  }, uniqueSegments.map(function (seg, i) {
    return /*#__PURE__*/React.createElement(FormControlLabel, {
      key: i,
      control: /*#__PURE__*/React.createElement(Checkbox, {
        defaultChecked: true,
        style: {
          color: segmentColorScale(seg)
        },
        onChange: function onChange() {
          return toggleCheckbox(seg);
        }
      }),
      label: segMap[seg] ? segMap[seg] : seg
    });
  })), isVideo ? /*#__PURE__*/React.createElement(VideoRender, {
    images: image,
    overlays: overlay
  }) : /*#__PURE__*/React.createElement(FrameRender, {
    image: image,
    overlay: overlay
  }));
};