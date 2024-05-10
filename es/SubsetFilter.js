function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { HistogramSelector } from './HistogramSelector.js';
export var SubsetFilter = function SubsetFilter(_ref) {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    handleRules = _ref.handleRules,
    deleteRule = _ref.deleteRule;
  var _React$useState = React.useState(false),
    open = _React$useState[0],
    setOpen = _React$useState[1];
  var anchorRef = React.useRef(null);
  var _useState = useState({}),
    attributes = _useState[0],
    setAttributes = _useState[1]; // Attributes in data set and set of unique values
  var _useState2 = useState({}),
    selection = _useState2[0],
    setSelection = _useState2[1]; // Selected range for each attribute in data set

  var _useState3 = useState([]),
    histogramSelectors = _useState3[0],
    setHistogramSelectors = _useState3[1]; // Histogram selectors to show

  useEffect(function () {
    if (data.length > 0) {
      var allAttributes = Object.keys(data[0]);
      var newAttributes = {};
      var newSelection = [];
      var _loop = function _loop() {
        var a = _allAttributes[_i];
        var uniqueValues = new Set(data.filter(function (d) {
          return d[a] != '';
        }).map(function (d) {
          return Number(d[a]);
        }));

        // The following lines filter out attributes with no records
        if (Array.from(uniqueValues).length === 0 || Array.from(uniqueValues)[0] === undefined) {
          return 1; // continue
        }
        newAttributes[a] = uniqueValues;
        newSelection[a] = d3.extent(uniqueValues);
      };
      for (var _i = 0, _allAttributes = allAttributes; _i < _allAttributes.length; _i++) {
        if (_loop()) continue;
      }
      setAttributes(newAttributes);
      setSelection(newSelection);
    }
  }, [data]);
  function handleToggle() {
    setOpen(function (prevOpen) {
      return !prevOpen;
    });
  }
  ;
  function handleClose(event, attr) {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
    if (attr) {
      if (histogramSelectors.includes(attr)) {
        return;
      } else {
        var newHistogramSelectors = [].concat(histogramSelectors, [attr]);
        setHistogramSelectors(newHistogramSelectors);
        handleRules([attr, d3.extent(Array.from(attributes[attr]))]);
        return;
      }
    }
  }
  ;
  function updateSelectors(attr) {
    for (var i = 0; i < histogramSelectors.length; i++) {
      var a = histogramSelectors[i];
      if (attr === a) {
        var newHistogramSelectors = histogramSelectors.slice(0, i).concat(histogramSelectors.slice(i + 1));
        setHistogramSelectors(newHistogramSelectors);
        var newSelection = _extends({}, selection);
        var uniqueValues = new Set(data.filter(function (d) {
          return d[attr] != '';
        }).map(function (d) {
          return Number(d[attr]);
        }));
        newSelection[attr] = d3.extent(uniqueValues);
        setSelection(newSelection);
        deleteRule(attr);
      }
    }
  }
  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }
  function handleSelection(attr, newSelectionRange) {
    var newSelection = _extends({}, selection);
    newSelection[attr] = newSelectionRange;
    setSelection(newSelection);
  }
  function handleChangeComplete(attr, newSelectionRange) {
    var newSelection = _extends({}, selection);
    newSelection[attr] = newSelectionRange;
    setSelection(newSelection);
    handleRules([attr, newSelectionRange]);
  }

  // return focus to the button when we transitioned from !open -> open
  var prevOpen = React.useRef(open);
  React.useEffect(function () {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);
  var formStyle = {
    "width": "250px",
    "marginTop": "10px"
  };
  var buttonStyle = {
    "height": "50px",
    "padding": "0px 20px"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: formStyle
  }, /*#__PURE__*/React.createElement(Button, {
    ref: anchorRef,
    id: "composition-button",
    style: buttonStyle,
    "aria-controls": open ? 'composition-menu' : undefined,
    "aria-expanded": open ? 'true' : undefined,
    "aria-haspopup": "true",
    onClick: handleToggle,
    startIcon: /*#__PURE__*/React.createElement(ControlPointIcon, null)
  }, "Add Filter"), /*#__PURE__*/React.createElement(Popper, {
    style: {
      "zIndex": 1
    },
    open: open,
    anchorEl: anchorRef.current,
    role: undefined,
    placement: "bottom-start",
    transition: true,
    disablePortal: true
  }, function (_ref2) {
    var TransitionProps = _ref2.TransitionProps,
      placement = _ref2.placement;
    return /*#__PURE__*/React.createElement(Grow, _extends({}, TransitionProps, {
      style: {
        maxHeight: '300px',
        overflow: 'scroll',
        transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom'
      }
    }), /*#__PURE__*/React.createElement(Paper, null, /*#__PURE__*/React.createElement(ClickAwayListener, {
      onClickAway: handleClose
    }, /*#__PURE__*/React.createElement(MenuList, {
      autoFocusItem: open,
      id: "composition-menu",
      "aria-labelledby": "composition-button",
      onKeyDown: handleListKeyDown
    }, Object.keys(attributes).map(function (attr, i) {
      return /*#__PURE__*/React.createElement(MenuItem, {
        key: "filter" + i,
        onClick: function onClick(e) {
          return handleClose(e, attr);
        }
      }, attr);
    })))));
  }), /*#__PURE__*/React.createElement("div", {
    id: "histogramContainer"
  }, histogramSelectors.map(function (attr, i) {
    return /*#__PURE__*/React.createElement(HistogramSelector, {
      key: i,
      attr: attr,
      values: Array.from(attributes[attr]),
      data: data,
      handleSelection: handleSelection,
      selection: selection[attr],
      handleChangeComplete: handleChangeComplete,
      updateSelectors: updateSelectors
    });
  })));
};