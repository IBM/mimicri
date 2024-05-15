"use strict";

exports.__esModule = true;
exports.SegmentSelector = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _FrameRender = require("./FrameRender.js");
var _VideoRender = require("./VideoRender.js");
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
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SegmentSelector = function SegmentSelector(_ref) {
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
  var _useState = (0, _react.useState)([]),
    uniqueSegments = _useState[0],
    setUniqueSegments = _useState[1];
  var _useState2 = (0, _react.useState)(new Set()),
    selectedSegments = _useState2[0],
    setSelectedSegments = _useState2[1];
  var _useState3 = (0, _react.useState)(segmentation),
    overlay = _useState3[0],
    setOverlay = _useState3[1];
  var _useState4 = (0, _react.useState)(false),
    open = _useState4[0],
    setOpen = _useState4[1];
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // const [segmentColor, setSegmentColor] = useState(() => segmentColorScale);

  (0, _react.useEffect)(function () {
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
  (0, _react.useEffect)(function () {
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
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: selectorLayout
  }, /*#__PURE__*/_react["default"].createElement(_FormGroup["default"], {
    style: controls
  }, uniqueSegments.map(function (seg, i) {
    return /*#__PURE__*/_react["default"].createElement(_FormControlLabel["default"], {
      key: i,
      control: /*#__PURE__*/_react["default"].createElement(_Checkbox["default"], {
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
  })), isVideo ? /*#__PURE__*/_react["default"].createElement(_VideoRender.VideoRender, {
    images: image,
    overlays: overlay
  }) : /*#__PURE__*/_react["default"].createElement(_FrameRender.FrameRender, {
    image: image,
    overlay: overlay
  }));
};
exports.SegmentSelector = SegmentSelector;