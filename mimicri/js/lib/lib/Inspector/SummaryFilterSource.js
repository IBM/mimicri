"use strict";

exports.__esModule = true;
exports.SummaryFilterSource = void 0;
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
var SummaryFilterSource = function SummaryFilterSource(_ref) {
  var data = _ref.data,
    handleSourceFilter = _ref.handleSourceFilter;
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
  var sourceSliderRef = _react["default"].useRef("sourceSlider");
  var sourceLabelRef = _react["default"].useRef("sourceLabel");
  _react["default"].useEffect(function () {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);
  var layout = {
    "height": 60,
    "width": 900,
    "marginTop": 10,
    "marginRight": 50,
    "marginBottom": 20,
    "marginLeft": 50
  };
  var jitterX = 5;
  var jitterY = 20;
  (0, _react.useEffect)(function () {
    if (data.length > 0) {
      var newAttributes = Object.keys(data[0]);
      setAttributes(newAttributes);
      d3.select(refFilter.current).attr("width", 0).attr("height", 0);
      d3.select(sourceSliderRef.current).style("display", "none");
      d3.select(sourceLabelRef.current).style("display", "none");
    }
    if (selectedAttribute && data.length > 0) {
      var selectedData = data.map(function (d) {
        return parseFloat(d[selectedAttribute]);
      });
      var svgFilter = d3.select(refFilter.current).attr("width", layout.width).attr("height", layout.height);
      d3.select(sourceSliderRef.current).style("display", "block").style("margin-left", layout.marginLeft + "px").style("margin-right", layout.marginRight + "px").style("width", layout.width - layout.marginLeft - layout.marginRight + "px");
      var xScale = d3.scaleLinear().domain(d3.extent(selectedData)).range([layout.marginLeft, layout.width - layout.marginRight]);
      svgFilter.selectAll(".filterDistribution").data(selectedData).join("circle").attr("class", "filterDistribution").attr("cx", function (d) {
        return xScale(d) + Math.random() * jitterX - jitterX / 2;
      }).attr("cy", function (d) {
        return (layout.height - layout.marginTop - layout.marginBottom) / 2 + layout.marginTop + Math.random() * jitterY - jitterY / 2;
      }).attr("r", 3).attr("fill", "steelblue").attr("opacity", 0.5);
      svgFilter.select("#axis").attr("transform", "translate(" + 0 + ", " + (layout.height - layout.marginBottom) + ")").call(d3.axisBottom(xScale).tickSize(3));
      svgFilter.select("#axis").select(".domain").attr("stroke", "none");
      var attributeMean = Math.round(d3.mean(selectedData) * 100) / 100;
      setThreshold(attributeMean);
      var attributeExtent = d3.extent(selectedData);
      if (attributeExtent[0] == attributeExtent[1]) {
        attributeExtent = [attributeExtent[0] - 1, attributeExtent[1] + 1];
      }
      setMinMax(attributeExtent);
      setStep((attributeExtent[1] - attributeExtent[0]) / 10);
      svgFilter.selectAll("#threshold").data([attributeMean]).join("line").attr("id", "threshold").attr("x1", function (d) {
        return xScale(d);
      }).attr("y1", layout.marginTop - 5).attr("x2", function (d) {
        return xScale(d);
      }).attr("y2", layout.height - layout.marginBottom + 5).attr("stroke", "black").attr("stroke-dasharray", "5 2 2 2").attr("stroke-width", "2px");
      d3.select(sourceLabelRef.current).style("display", "grid").selectAll(".sourceLabels").data(["<=" + Math.round(attributeMean * 100) / 100, ">" + Math.round(attributeMean * 100) / 100]).join("p").attr("class", "sourceLabels").html(function (d) {
        return d;
      });
    }
  }, [data, selectedAttribute]);
  (0, _react.useEffect)(function () {
    var svgFilter = d3.select(refFilter.current);
    var selectedData = data.map(function (d) {
      return parseFloat(d[selectedAttribute]);
    });
    var xScale = d3.scaleLinear().domain(d3.extent(selectedData)).range([layout.marginLeft, layout.width - layout.marginRight]);
    svgFilter.selectAll("#threshold").data([threshold]).join("line").attr("id", "threshold").attr("x1", function (d) {
      return xScale(d);
    }).attr("y1", layout.marginTop - 5).attr("x2", function (d) {
      return xScale(d);
    }).attr("y2", layout.height - layout.marginBottom + 5).attr("stroke", "black").attr("stroke-dasharray", "5 2 2 2").attr("stroke-width", "2px");
    d3.select(sourceLabelRef.current).selectAll(".sourceLabels").data(["<=" + Math.round(threshold * 100) / 100, ">" + Math.round(threshold * 100) / 100]).join("p").attr("class", "sourceLabels").html(function (d) {
      return d;
    });
    handleSourceFilter(selectedAttribute, threshold);
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
    handleSourceFilter(null, null);
    setSelectedAttribute(null);
  }
  ;
  function handleClose(event, attr) {
    setSelectedAttribute(attr);
    handleSourceFilter(attr, d3.mean(data, function (d) {
      return d[attr];
    }));
    setOpen(false);
  }
  ;
  function handleThreshold(event, value) {
    setThreshold(value);
  }
  var buttonStyle = {
    "height": "50px",
    "padding": "0px 20px 0px 50px"
  };
  var containerStyle = {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start"
  };
  var labelStyle = {
    "display": "grid",
    "gridTemplateColumns": "auto auto",
    "justifyContent": "space-around",
    "width": "100%"
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
  }, "Filter by Source"), /*#__PURE__*/_react["default"].createElement(_Popper["default"], {
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
  }), /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refFilter
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "axis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "main"
  })), /*#__PURE__*/_react["default"].createElement(_Slider["default"], {
    ref: sourceSliderRef,
    value: threshold,
    min: minMax[0],
    max: minMax[1],
    step: step,
    onChange: handleThreshold,
    "aria-label": "Default",
    valueLabelDisplay: "auto"
  }), /*#__PURE__*/_react["default"].createElement("div", {
    ref: sourceLabelRef,
    style: labelStyle
  }));
};
exports.SummaryFilterSource = SummaryFilterSource;