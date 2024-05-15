"use strict";

exports.__esModule = true;
exports.SummaryCentroidMap = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SummaryCentroidMap = function SummaryCentroidMap(_ref) {
  var selectedCentroids = _ref.selectedCentroids,
    segMap = _ref.segMap,
    frame = _ref.frame;
  var refCentroids = (0, _react.useRef)("CentroidMap");
  var layout = {
    "height": 300,
    "width": 300,
    "marginTop": 10,
    "marginRight": 20,
    "marginBottom": 40,
    "marginLeft": 30
  };
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  (0, _react.useEffect)(function () {
    var binSize = 0.025;
    if (selectedCentroids.length > 0) {
      var binCounts = {};
      for (var _iterator = _createForOfIteratorHelperLoose(selectedCentroids), _step; !(_step = _iterator()).done;) {
        var c = _step.value;
        for (var _i3 = 0, _Object$keys3 = Object.keys(segMap); _i3 < _Object$keys3.length; _i3++) {
          var s = _Object$keys3[_i3];
          var sCentroid = c[s];
          var xBin = Math.floor(sCentroid[1] / binSize);
          var yBin = Math.floor(sCentroid[0] / binSize);
          var binID = "" + xBin + yBin;
          if (!binCounts[binID]) {
            binCounts[binID] = {
              "x": xBin,
              "y": yBin
            };
            for (var _i4 = 0, _Object$keys4 = Object.keys(segMap); _i4 < _Object$keys4.length; _i4++) {
              var si = _Object$keys4[_i4];
              binCounts[binID][si] = 0;
            }
          }
          binCounts[binID][s]++;
        }
      }
      var centroidMatrix = [];
      for (var _i = 0, _Object$keys = Object.keys(binCounts); _i < _Object$keys.length; _i++) {
        var b = _Object$keys[_i];
        centroidMatrix.push(binCounts[b]);
      }
      var cellSize = (layout.width - layout.marginLeft - layout.marginRight) * binSize;
      var maxOpacity = 1 / Object.keys(segMap).length;
      var xScale = d3.scaleLinear().domain([0, 1]).range([layout.marginLeft, layout.width - layout.marginRight]);
      var yScale = d3.scaleLinear().domain([0, 1]).range([layout.height - layout.marginBottom, layout.marginTop]);
      var svgCentroids = d3.select(refCentroids.current).attr("width", layout.width).attr("height", layout.height);
      svgCentroids.select("#title").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("transform", "translate(" + (layout.width / 2 + 10) + ", " + (layout.height - 10) + ")");
      svgCentroids.select("#xAxis").attr("transform", "translate(" + 0 + ", " + (layout.height - layout.marginBottom) + ")").call(d3.axisBottom(xScale).tickSize(3).ticks(5));
      svgCentroids.select("#yAxis").attr("transform", "translate(" + layout.marginLeft + ", " + 0 + ")").call(d3.axisLeft(yScale).tickSize(3).ticks(5));
      svgCentroids.selectAll("#border").data([0]).join("rect").attr("id", "border").attr("x", layout.marginLeft).attr("y", layout.marginTop).attr("width", layout.width - layout.marginLeft - layout.marginRight).attr("height", layout.height - layout.marginTop - layout.marginBottom).attr("fill", "none").attr("stroke", "black").attr("stroke-width", "1px");
      svgCentroids.selectAll(".groups").data(Object.keys(segMap)).join("g").attr("class", "groups").attr("id", function (d, i) {
        return "group" + d;
      });
      var _loop = function _loop() {
        var s = _Object$keys2[_i2];
        var sScale = d3.scaleLinear().domain(d3.extent(centroidMatrix, function (c) {
          return c[s];
        })).range([0, 1]);
        var segGroup = svgCentroids.select("#group" + s);
        segGroup.selectAll(".cell").data(centroidMatrix).join("rect").attr("class", "cell").attr("x", function (d) {
          return cellSize * d.x + layout.marginLeft;
        }).attr("y", function (d) {
          return cellSize * d.y + layout.marginTop;
        }).attr("width", cellSize).attr("height", cellSize).attr("fill", function (d) {
          return segmentColorScale(parseInt(s));
        }).attr("opacity", function (d) {
          return sScale(d[s]);
        });
      };
      for (var _i2 = 0, _Object$keys2 = Object.keys(segMap); _i2 < _Object$keys2.length; _i2++) {
        _loop();
      }
    }
  }, [selectedCentroids, segMap, frame]);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refCentroids
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "xAxis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "yAxis"
  }), /*#__PURE__*/_react["default"].createElement("text", {
    id: "title"
  }, "centroids distribution")));
};
exports.SummaryCentroidMap = SummaryCentroidMap;