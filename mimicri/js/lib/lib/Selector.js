"use strict";

exports.__esModule = true;
exports.Selector = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _FrameMulti = require("./FrameMulti.js");
var _VideoMulti = require("./VideoMulti.js");
var _SegmentSelector = require("./SegmentSelector.js");
var _SubsetDataWrapper = require("./SubsetDataWrapper.js");
var _Box = _interopRequireDefault(require("@mui/material/Box"));
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _Tab = _interopRequireDefault(require("@mui/material/Tab"));
var _Tabs = _interopRequireDefault(require("@mui/material/Tabs"));
var _allotment = require("allotment");
require("allotment/dist/style.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// import TabPanel from '@mui/lab/TabPanel';

/* Parameters:
	- mainImage: Dict {"images": [2D-array], "segments": [2D-array]}
	- selectionImages: Dict {"images": [2D-array, 2D-array...], "segments": [2D-array, 2D-array...]}
	- segMap: optional, Dict {index: "Segment Name", ...}
	- data: [{var1:..., var2:..., ...}, {...}, ...]
	- selectSource: true if user selects subset from source, false if selecting targets
*/
var Selector = function Selector(_ref) {
  var _ref$mainImage = _ref.mainImage,
    mainImage = _ref$mainImage === void 0 ? {
      "images": [],
      "segments": []
    } : _ref$mainImage,
    _ref$selectionImages = _ref.selectionImages,
    selectionImages = _ref$selectionImages === void 0 ? {
      "images": [],
      "segments": []
    } : _ref$selectionImages,
    _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    _ref$selectSource = _ref.selectSource,
    selectSource = _ref$selectSource === void 0 ? true : _ref$selectSource,
    _ref$_isVideo = _ref._isVideo,
    _isVideo = _ref$_isVideo === void 0 ? false : _ref$_isVideo,
    _selection = _ref._selection,
    _segment = _ref._segment,
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
  function setSegments(segmentList) {
    var segmentInput = document.getElementById(_segment);
    if (segmentInput) {
      segmentInput.value = JSON.stringify(Array.from(segmentList));
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', false, true);
      segmentInput.dispatchEvent(event);
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
  var mainLayout = {
    "display": "flex",
    "flexDirection": "row"
  };
  var imageLayout = {
    "display": "flex",
    "flexDirection": "column",
    "height": "1000px"
  };
  var fontStyle = {
    "fontFamily": "sans-serif"
  };
  var tabStyle = {
    "marginLeft": "0px"
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: imageLayout
  }, /*#__PURE__*/_react["default"].createElement(_allotment.Allotment, {
    vertical: true
  }, /*#__PURE__*/_react["default"].createElement(_allotment.Allotment.Pane, {
    snap: true,
    preferredSize: "600px"
  }, /*#__PURE__*/_react["default"].createElement(_Box["default"], null, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    disabled: true,
    sx: {
      "&.MuiButtonBase-root": {
        "padding": "10px 0px 20px 0px",
        "color": "rgba(0, 0, 0, 0.6)"
      }
    }
  }, "select recombinant segment")), /*#__PURE__*/_react["default"].createElement(_SegmentSelector.SegmentSelector, {
    image: mainImage.images[0],
    segmentation: mainImage.segments[0],
    segMap: segMap,
    setSegments: setSegments,
    isVideo: _isVideo
  })), /*#__PURE__*/_react["default"].createElement(_allotment.Allotment.Pane, {
    snap: true
  }, /*#__PURE__*/_react["default"].createElement(_Box["default"], null, selectSource ? /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    disabled: true,
    sx: {
      "&.MuiButtonBase-root": {
        "padding": "10px 0px 10px 0px",
        "color": "rgba(0, 0, 0, 0.6)"
      }
    }
  }, "source images") : /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    disabled: true,
    sx: {
      "&.MuiButtonBase-root": {
        "padding": "10px 0px 10px 0px",
        "color": "rgba(0, 0, 0, 0.6)"
      }
    }
  }, "target images")), /*#__PURE__*/_react["default"].createElement(_SubsetDataWrapper.SubsetDataWrapper, {
    data: data,
    orient: "records",
    setIndices: setIndices,
    setSubset: setSubset,
    _index: _index
  }), _isVideo ? /*#__PURE__*/_react["default"].createElement(_VideoMulti.VideoMulti, {
    images: selectionImages.images,
    overlays: selectionImages.segments
  }) : /*#__PURE__*/_react["default"].createElement(_FrameMulti.FrameMulti, {
    images: selectionImages.images,
    overlays: selectionImages.segments
  }))));
};
exports.Selector = Selector;