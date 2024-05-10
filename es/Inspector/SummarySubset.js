import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { SummaryRow } from "./SummaryRow.js";
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
export var SummarySubset = function SummarySubset(_ref) {
  var selected = _ref.selected,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    extents = _ref.extents,
    handleSelection = _ref.handleSelection,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "eid" : _ref$_index;
  var _useState = useState({}),
    selectedSegments = _useState[0],
    setSelectedSegments = _useState[1];
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  useEffect(function () {
    setSelectedSegments(JSON.parse(JSON.stringify(segMap)));
  }, [segMap]);
  function toggleCheckbox(s) {
    var selected = Object.keys(selectedSegments);
    if (selected.indexOf(s) >= 0) {
      var newSelectedSegments = JSON.parse(JSON.stringify(selectedSegments));
      delete newSelectedSegments[s];
      setSelectedSegments(newSelectedSegments);
    } else {
      var _newSelectedSegments = JSON.parse(JSON.stringify(selectedSegments));
      _newSelectedSegments[s] = segMap[s];
      setSelectedSegments(_newSelectedSegments);
    }
  }
  function handleDeleteSelection(label) {
    handleSelection(selected, [], label);
  }
  var controls = {
    "display": "flex",
    "margin": "30px 0px 10px 30px",
    "flexDirection": "row"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormGroup, {
    style: controls
  }, Object.keys(segMap).map(function (seg, i) {
    return /*#__PURE__*/React.createElement(FormControlLabel, {
      key: "" + seg + i,
      control: /*#__PURE__*/React.createElement(Checkbox, {
        defaultChecked: true,
        style: {
          color: segmentColorScale(parseInt(seg))
        },
        onChange: function onChange() {
          return toggleCheckbox(seg);
        }
      }),
      label: segMap[seg] ? segMap[seg] : seg
    });
  })), Object.keys(selected).map(function (s) {
    return /*#__PURE__*/React.createElement(SummaryRow, {
      key: s,
      title: s,
      selected: selected[s],
      segMap: selectedSegments,
      extents: extents,
      handleDeleteSelection: handleDeleteSelection
    });
  }));
};