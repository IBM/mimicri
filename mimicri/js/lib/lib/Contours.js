"use strict";

exports.__esModule = true;
exports.Contours = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var Contours = function Contours(_ref) {
  var contours = _ref.contours,
    segMap = _ref.segMap,
    _ref$cellScale = _ref.cellScale,
    cellScale = _ref$cellScale === void 0 ? 1 / 128 : _ref$cellScale;
  var refContours = (0, _react.useRef)("Contours");
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
    if (contours) {
      var cellSize = cellScale * (layout.width - layout.marginLeft - layout.marginRight);
      var xScale = d3.scaleLinear().domain([0, 1]).range([layout.marginLeft, layout.width - layout.marginRight]);
      var yScale = d3.scaleLinear().domain([0, 1]).range([layout.height - layout.marginBottom, layout.marginTop]);
      var svgContours = d3.select(refContours.current).attr("width", layout.width).attr("height", layout.height);
      svgContours.select("#title").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("transform", "translate(" + (layout.width / 2 + 10) + ", " + (layout.height - 10) + ")");
      svgContours.select("#xAxis").attr("transform", "translate(" + 0 + ", " + (layout.height - layout.marginBottom) + ")").call(d3.axisBottom(xScale).tickSize(3).ticks(5));
      svgContours.select("#yAxis").attr("transform", "translate(" + layout.marginLeft + ", " + 0 + ")").call(d3.axisLeft(yScale).tickSize(3).ticks(5));
      svgContours.selectAll("#border").data([0]).join("rect").attr("id", "border").attr("x", layout.marginLeft).attr("y", layout.marginTop).attr("width", layout.width - layout.marginLeft - layout.marginRight).attr("height", layout.height - layout.marginTop - layout.marginBottom).attr("fill", "none").attr("stroke", "black").attr("stroke-width", "1px");
      var _loop = function _loop() {
        var s = _Object$keys[_i];
        var segmentContours = contours[s];
        var opacityScale = d3.scaleLog().domain(d3.extent(segmentContours, function (d) {
          return d.value;
        })).range([0, 1]);
        svgContours.selectAll(".cell" + s).data(segmentContours).join("rect").attr("class", "cell" + s).attr("x", function (d) {
          return xScale(d.x);
        }).attr("y", function (d) {
          return yScale(d.y);
        }).attr("width", cellSize).attr("height", cellSize).attr("fill", segmentColorScale(parseInt(s))).attr("opacity", function (d) {
          return opacityScale(d.value);
        });
      };
      for (var _i = 0, _Object$keys = Object.keys(segMap); _i < _Object$keys.length; _i++) {
        _loop();
      }
    }
  }, [contours, segMap]);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refContours
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "xAxis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "yAxis"
  }), /*#__PURE__*/_react["default"].createElement("text", {
    id: "title"
  }, "segment contours")));
};
exports.Contours = Contours;