"use strict";

exports.__esModule = true;
exports.SubsetFilter = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _ClickAwayListener = _interopRequireDefault(require("@mui/material/ClickAwayListener"));
var _Grow = _interopRequireDefault(require("@mui/material/Grow"));
var _Paper = _interopRequireDefault(require("@mui/material/Paper"));
var _Popper = _interopRequireDefault(require("@mui/material/Popper"));
var _MenuItem = _interopRequireDefault(require("@mui/material/MenuItem"));
var _MenuList = _interopRequireDefault(require("@mui/material/MenuList"));
var _Stack = _interopRequireDefault(require("@mui/material/Stack"));
var _ControlPoint = _interopRequireDefault(require("@mui/icons-material/ControlPoint"));
var _HistogramSelector = require("./HistogramSelector.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SubsetFilter = function SubsetFilter(_ref) {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    handleRules = _ref.handleRules,
    deleteRule = _ref.deleteRule;
  var _React$useState = _react["default"].useState(false),
    open = _React$useState[0],
    setOpen = _React$useState[1];
  var anchorRef = _react["default"].useRef(null);
  var _useState = (0, _react.useState)({}),
    attributes = _useState[0],
    setAttributes = _useState[1]; // Attributes in data set and set of unique values
  var _useState2 = (0, _react.useState)({}),
    selection = _useState2[0],
    setSelection = _useState2[1]; // Selected range for each attribute in data set

  var _useState3 = (0, _react.useState)([]),
    histogramSelectors = _useState3[0],
    setHistogramSelectors = _useState3[1]; // Histogram selectors to show

  (0, _react.useEffect)(function () {
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
  var prevOpen = _react["default"].useRef(open);
  _react["default"].useEffect(function () {
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
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: formStyle
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    ref: anchorRef,
    id: "composition-button",
    style: buttonStyle,
    "aria-controls": open ? 'composition-menu' : undefined,
    "aria-expanded": open ? 'true' : undefined,
    "aria-haspopup": "true",
    onClick: handleToggle,
    startIcon: /*#__PURE__*/_react["default"].createElement(_ControlPoint["default"], null)
  }, "Add Filter"), /*#__PURE__*/_react["default"].createElement(_Popper["default"], {
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
    return /*#__PURE__*/_react["default"].createElement(_Grow["default"], _extends({}, TransitionProps, {
      style: {
        maxHeight: '300px',
        overflow: 'scroll',
        transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom'
      }
    }), /*#__PURE__*/_react["default"].createElement(_Paper["default"], null, /*#__PURE__*/_react["default"].createElement(_ClickAwayListener["default"], {
      onClickAway: handleClose
    }, /*#__PURE__*/_react["default"].createElement(_MenuList["default"], {
      autoFocusItem: open,
      id: "composition-menu",
      "aria-labelledby": "composition-button",
      onKeyDown: handleListKeyDown
    }, Object.keys(attributes).map(function (attr, i) {
      return /*#__PURE__*/_react["default"].createElement(_MenuItem["default"], {
        key: "filter" + i,
        onClick: function onClick(e) {
          return handleClose(e, attr);
        }
      }, attr);
    })))));
  }), /*#__PURE__*/_react["default"].createElement("div", {
    id: "histogramContainer"
  }, histogramSelectors.map(function (attr, i) {
    return /*#__PURE__*/_react["default"].createElement(_HistogramSelector.HistogramSelector, {
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
exports.SubsetFilter = SubsetFilter;