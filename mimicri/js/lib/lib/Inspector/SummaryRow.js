"use strict";

exports.__esModule = true;
exports.SummaryRow = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _SummaryArea = require("./SummaryArea.js");
var _SummaryCentroidMap = require("./SummaryCentroidMap.js");
var _SummaryRadials = require("./SummaryRadials.js");
var _SummaryColors = require("./SummaryColors.js");
var _IconButton = _interopRequireDefault(require("@mui/material/IconButton"));
var _CancelOutlined = _interopRequireDefault(require("@mui/icons-material/CancelOutlined"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var SummaryRow = function SummaryRow(_ref) {
  var selected = _ref.selected,
    title = _ref.title,
    segMap = _ref.segMap,
    handleDeleteSelection = _ref.handleDeleteSelection,
    extents = _ref.extents;
  var _useState = (0, _react.useState)([]),
    selectedAreas = _useState[0],
    setSelectedAreas = _useState[1];
  var _useState2 = (0, _react.useState)([]),
    selectedCentroids = _useState2[0],
    setSelectedCentroids = _useState2[1];
  var _useState3 = (0, _react.useState)([]),
    selectedRadials = _useState3[0],
    setSelectedRadials = _useState3[1];
  var _useState4 = (0, _react.useState)([]),
    selectedColors = _useState4[0],
    setSelectedColors = _useState4[1];
  var refSummaryRow = (0, _react.useRef)("refSummaryRow");
  (0, _react.useEffect)(function () {
    d3.select(refSummaryRow.current).html(title);
  }, [title]);
  (0, _react.useEffect)(function () {
    var newSelectedAreas = selected.map(function (s) {
      return s["areas"];
    });
    var newSelectedCentroids = selected.map(function (s) {
      return s["centroids"];
    });
    var newSelectedRadials = selected.map(function (s) {
      return s["radials"];
    });
    var newSelectedColors = selected.map(function (s) {
      return s["colors"];
    });
    setSelectedAreas(newSelectedAreas);
    setSelectedCentroids(newSelectedCentroids);
    setSelectedRadials(newSelectedRadials);
    setSelectedColors(newSelectedColors);
  }, [selected, segMap]);
  var rowStyle = {
    "fontFamily": "sans-serif",
    "marginLeft": "30px"
  };
  var titleStyle = {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "fontStyle": "italic"
  };
  var containerStyle = {
    "display": "flex"
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: rowStyle
  }, /*#__PURE__*/_react["default"].createElement("div", {
    style: titleStyle
  }, /*#__PURE__*/_react["default"].createElement(_IconButton["default"], {
    onClick: function onClick() {
      return handleDeleteSelection(title);
    },
    "aria-label": "delete",
    size: "small"
  }, /*#__PURE__*/_react["default"].createElement(_CancelOutlined["default"], {
    fontSize: "inherit"
  })), /*#__PURE__*/_react["default"].createElement("p", {
    ref: refSummaryRow
  })), /*#__PURE__*/_react["default"].createElement("div", {
    style: containerStyle
  }, /*#__PURE__*/_react["default"].createElement(_SummaryCentroidMap.SummaryCentroidMap, {
    selectedCentroids: selectedCentroids,
    segMap: segMap
  }), /*#__PURE__*/_react["default"].createElement(_SummaryRadials.SummaryRadials, {
    selectedRadials: selectedRadials,
    segMap: segMap,
    extents: extents["radials"]
  }), /*#__PURE__*/_react["default"].createElement(_SummaryArea.SummaryArea, {
    selectedAreas: selectedAreas,
    segMap: segMap,
    extents: extents["areas"]
  }), /*#__PURE__*/_react["default"].createElement(_SummaryColors.SummaryColors, {
    selectedColors: selectedColors,
    segMap: segMap,
    extents: extents["colors"]
  })));
};
exports.SummaryRow = SummaryRow;