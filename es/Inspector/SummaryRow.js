import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { SummaryArea } from "./SummaryArea.js";
import { SummaryCentroidMap } from './SummaryCentroidMap.js';
import { SummaryRadials } from './SummaryRadials.js';
import { SummaryColors } from './SummaryColors.js';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
export var SummaryRow = function SummaryRow(_ref) {
  var selected = _ref.selected,
    title = _ref.title,
    segMap = _ref.segMap,
    handleDeleteSelection = _ref.handleDeleteSelection,
    extents = _ref.extents;
  var _useState = useState([]),
    selectedAreas = _useState[0],
    setSelectedAreas = _useState[1];
  var _useState2 = useState([]),
    selectedCentroids = _useState2[0],
    setSelectedCentroids = _useState2[1];
  var _useState3 = useState([]),
    selectedRadials = _useState3[0],
    setSelectedRadials = _useState3[1];
  var _useState4 = useState([]),
    selectedColors = _useState4[0],
    setSelectedColors = _useState4[1];
  var refSummaryRow = useRef("refSummaryRow");
  useEffect(function () {
    d3.select(refSummaryRow.current).html(title);
  }, [title]);
  useEffect(function () {
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
  return /*#__PURE__*/React.createElement("div", {
    style: rowStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: titleStyle
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: function onClick() {
      return handleDeleteSelection(title);
    },
    "aria-label": "delete",
    size: "small"
  }, /*#__PURE__*/React.createElement(CancelOutlinedIcon, {
    fontSize: "inherit"
  })), /*#__PURE__*/React.createElement("p", {
    ref: refSummaryRow
  })), /*#__PURE__*/React.createElement("div", {
    style: containerStyle
  }, /*#__PURE__*/React.createElement(SummaryCentroidMap, {
    selectedCentroids: selectedCentroids,
    segMap: segMap
  }), /*#__PURE__*/React.createElement(SummaryRadials, {
    selectedRadials: selectedRadials,
    segMap: segMap,
    extents: extents["radials"]
  }), /*#__PURE__*/React.createElement(SummaryArea, {
    selectedAreas: selectedAreas,
    segMap: segMap,
    extents: extents["areas"]
  }), /*#__PURE__*/React.createElement(SummaryColors, {
    selectedColors: selectedColors,
    segMap: segMap,
    extents: extents["colors"]
  })));
};