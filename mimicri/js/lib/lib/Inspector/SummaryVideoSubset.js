"use strict";

exports.__esModule = true;
exports.SummaryVideoSubset = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _SummaryVideoRow = require("./SummaryVideoRow.js");
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _Checkbox = _interopRequireDefault(require("@mui/material/Checkbox"));
var _Dialog = _interopRequireDefault(require("@mui/material/Dialog"));
var _DialogActions = _interopRequireDefault(require("@mui/material/DialogActions"));
var _DialogContent = _interopRequireDefault(require("@mui/material/DialogContent"));
var _DialogContentText = _interopRequireDefault(require("@mui/material/DialogContentText"));
var _DialogTitle = _interopRequireDefault(require("@mui/material/DialogTitle"));
var _FormGroup = _interopRequireDefault(require("@mui/material/FormGroup"));
var _FormControlLabel = _interopRequireDefault(require("@mui/material/FormControlLabel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var SummaryVideoSubset = function SummaryVideoSubset(_ref) {
  var selected = _ref.selected,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    extents = _ref.extents,
    handleSelection = _ref.handleSelection,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "eid" : _ref$_index;
  var _useState = (0, _react.useState)({}),
    selectedSegments = _useState[0],
    setSelectedSegments = _useState[1];
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  (0, _react.useEffect)(function () {
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
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_FormGroup["default"], {
    style: controls
  }, Object.keys(segMap).map(function (seg, i) {
    return /*#__PURE__*/_react["default"].createElement(_FormControlLabel["default"], {
      key: "" + seg + i,
      control: /*#__PURE__*/_react["default"].createElement(_Checkbox["default"], {
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
    return /*#__PURE__*/_react["default"].createElement(_SummaryVideoRow.SummaryVideoRow, {
      key: s,
      title: s,
      selected: selected[s],
      segMap: selectedSegments,
      extents: extents,
      handleDeleteSelection: handleDeleteSelection
    });
  }));
};
exports.SummaryVideoSubset = SummaryVideoSubset;