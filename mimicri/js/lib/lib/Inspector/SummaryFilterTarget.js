"use strict";

exports.__esModule = true;
exports.SummaryFilterTarget = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _ClickAwayListener = _interopRequireDefault(require("@mui/material/ClickAwayListener"));
var _Grow = _interopRequireDefault(require("@mui/material/Grow"));
var _Paper = _interopRequireDefault(require("@mui/material/Paper"));
var _Popper = _interopRequireDefault(require("@mui/material/Popper"));
var _MenuItem = _interopRequireDefault(require("@mui/material/MenuItem"));
var _MenuList = _interopRequireDefault(require("@mui/material/MenuList"));
var _Slider = _interopRequireDefault(require("@mui/material/Slider"));
var _Stack = _interopRequireDefault(require("@mui/material/Stack"));
var _ControlPoint = _interopRequireDefault(require("@mui/icons-material/ControlPoint"));
var _CancelOutlined = _interopRequireDefault(require("@mui/icons-material/CancelOutlined"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SummaryFilterTarget = function SummaryFilterTarget(_ref) {
  var data = _ref.data,
    targetFilterHeight = _ref.targetFilterHeight,
    handleTargetFilter = _ref.handleTargetFilter;
  var _useState = (0, _react.useState)(null),
    selectedAttribute = _useState[0],
    setSelectedAttribute = _useState[1];
  var _useState2 = (0, _react.useState)([]),
    attributes = _useState2[0],
    setAttributes = _useState2[1];
  var _useState3 = (0, _react.useState)(0),
    threshold = _useState3[0],
    setThreshold = _useState3[1];
  var _useState4 = (0, _react.useState)([0, 1]),
    minMax = _useState4[0],
    setMinMax = _useState4[1];
  var _useState5 = (0, _react.useState)(1),
    step = _useState5[0],
    setStep = _useState5[1];
  var _React$useState = _react["default"].useState(false),
    open = _React$useState[0],
    setOpen = _React$useState[1];
  var anchorRef = _react["default"].useRef(null);

  // return focus to the button when we transitioned from !open -> open
  var prevOpen = _react["default"].useRef(open);
  var refFilter = (0, _react.useRef)("FilterVis");
  var targetSliderRef = _react["default"].useRef("targetSlider");
  var targetLabelRef = _react["default"].useRef("targetLabel");
  _react["default"].useEffect(function () {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);
  var layout = {
    "width": 60,
    "marginTop": 10,
    "marginRight": 20,
    "marginBottom": 10,
    "marginLeft": 10
  };
  var jitterX = 20;
  var jitterY = 5;
  (0, _react.useEffect)(function () {
    if (data.length > 0) {
      var newAttributes = Object.keys(data[0]);
      setAttributes(newAttributes);
      d3.select(refFilter.current).attr("width", 0).attr("height", 0);
      d3.select(targetSliderRef.current).style("display", "none");
      d3.select(targetLabelRef.current).style("display", "none");
    }
    if (selectedAttribute && data.length > 0) {
      var selectedData = data.map(function (d) {
        return parseFloat(d[selectedAttribute]);
      });
      layout.height = targetFilterHeight;
      var svgFilter = d3.select(refFilter.current).attr("width", layout.width).attr("height", layout.height);
      d3.select(targetSliderRef.current).style("display", "block").style("margin-top", layout.marginTop + "px").style("margin-bottom", layout.marginBottom + "px").style("height", layout.height - layout.marginTop - layout.marginBottom + "px");
      var yScale = d3.scaleLinear().domain(d3.extent(selectedData)).range([layout.height - layout.marginBottom, layout.marginTop]);
      svgFilter.selectAll(".filterDistribution").data(selectedData).join("circle").attr("class", "filterDistribution").attr("cy", function (d) {
        return yScale(d) + Math.random() * jitterY - jitterY / 2;
      }).attr("cx", function (d) {
        return (layout.width - layout.marginLeft - layout.marginRight) / 2 + layout.marginLeft + Math.random() * jitterX - jitterX / 2;
      }).attr("r", 3).attr("fill", "steelblue").attr("opacity", 0.5);
      svgFilter.select("#axis").attr("transform", "translate(" + (layout.width - layout.marginRight) + ", " + 0 + ")").call(d3.axisRight(yScale).tickSize(3));
      svgFilter.select("#axis").select(".domain").attr("stroke", "none");
      var attributeMean = Math.round(d3.mean(selectedData) * 100) / 100;
      setThreshold(attributeMean);
      var attributeExtent = d3.extent(selectedData);
      if (attributeExtent[0] == attributeExtent[1]) {
        attributeExtent = [attributeExtent[0] - 1, attributeExtent[1] + 1];
      }
      setMinMax(attributeExtent);
      setStep((attributeExtent[1] - attributeExtent[0]) / 10);
      svgFilter.selectAll("#threshold").data([attributeMean]).join("line").attr("id", "threshold").attr("y1", function (d) {
        return yScale(d);
      }).attr("x1", layout.marginLeft - 5).attr("y2", function (d) {
        return yScale(d);
      }).attr("x2", layout.width - layout.marginRight + 5).attr("stroke", "black").attr("stroke-dasharray", "5 2 2 2").attr("stroke-width", "2px");
      d3.select(targetLabelRef.current).style("display", "grid").selectAll(".targetLabels").data([">" + Math.round(attributeMean * 100) / 100, "<=" + Math.round(attributeMean * 100) / 100]).join("p").attr("class", "targetLabels").html(function (d) {
        return d;
      });
    }
  }, [data, targetFilterHeight, selectedAttribute]);
  (0, _react.useEffect)(function () {
    var svgFilter = d3.select(refFilter.current);
    var selectedData = data.map(function (d) {
      return parseFloat(d[selectedAttribute]);
    });
    var yScale = d3.scaleLinear().domain(d3.extent(selectedData)).range([targetFilterHeight - layout.marginBottom, layout.marginTop]);
    svgFilter.selectAll("#threshold").data([threshold]).join("line").attr("id", "threshold").attr("y1", function (d) {
      return yScale(d);
    }).attr("x1", layout.marginLeft - 5).attr("y2", function (d) {
      return yScale(d);
    }).attr("x2", layout.width - layout.marginRight + 5).attr("stroke", "black").attr("stroke-dasharray", "5 2 2 2").attr("stroke-width", "2px");
    d3.select(targetLabelRef.current).selectAll(".targetLabels").data([">" + Math.round(threshold * 100) / 100, "<=" + Math.round(threshold * 100) / 100]).join("p").attr("class", "targetLabels").html(function (d) {
      return d;
    });
    handleTargetFilter(selectedAttribute, threshold);
  }, [threshold]);
  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }
  function handleOpen() {
    setOpen(function (prevOpen) {
      return !prevOpen;
    });
  }
  ;
  function handleDeselect() {
    handleTargetFilter(null, null);
    setSelectedAttribute(null);
  }
  ;
  function handleClose(event, attr) {
    setSelectedAttribute(attr);
    setOpen(false);
  }
  ;
  function handleThreshold(event, value) {
    setThreshold(value);
  }
  var buttonStyle = {
    "height": "50px",
    "padding": "0px 20px"
  };
  var containerStyle = {
    "display": "flex",
    "flexDirection": "row",
    "marginTop": "0px",
    "justifyContent": "flex-end"
  };
  var sliderStyle = {
    "display": "flex",
    "flexDirection": "row"
  };
  var labelStyle = {
    "display": "grid",
    "gridTemplateRows": "auto auto",
    "justifyContent": "space-around",
    "alignItems": "center",
    "marginLeft": "15px",
    "marginRight": "5px"
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: containerStyle
  }, selectedAttribute ? /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    ref: anchorRef,
    id: "composition-button",
    style: buttonStyle,
    "aria-controls": open ? 'composition-menu' : undefined,
    "aria-expanded": open ? 'true' : undefined,
    "aria-haspopup": "true",
    onClick: handleDeselect,
    startIcon: /*#__PURE__*/_react["default"].createElement(_CancelOutlined["default"], null)
  }, "" + selectedAttribute) : /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    ref: anchorRef,
    id: "composition-button",
    style: buttonStyle,
    "aria-controls": open ? 'composition-menu' : undefined,
    "aria-expanded": open ? 'true' : undefined,
    "aria-haspopup": "true",
    onClick: handleOpen,
    startIcon: /*#__PURE__*/_react["default"].createElement(_ControlPoint["default"], null)
  }, "Filter by Target"), /*#__PURE__*/_react["default"].createElement(_Popper["default"], {
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
    }, attributes.map(function (attr, i) {
      return /*#__PURE__*/_react["default"].createElement(_MenuItem["default"], {
        key: "filter" + i,
        onClick: function onClick(e) {
          return handleClose(e, attr);
        }
      }, attr);
    })))));
  }), /*#__PURE__*/_react["default"].createElement("div", {
    style: sliderStyle
  }, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refFilter
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "axis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "main"
  })), /*#__PURE__*/_react["default"].createElement(_Slider["default"], {
    ref: targetSliderRef,
    orientation: "vertical",
    value: threshold,
    min: minMax[0],
    max: minMax[1],
    step: step,
    onChange: handleThreshold,
    "aria-label": "Default",
    valueLabelDisplay: "auto"
  })), /*#__PURE__*/_react["default"].createElement("div", {
    ref: targetLabelRef,
    style: labelStyle
  }));
};
exports.SummaryFilterTarget = SummaryFilterTarget;