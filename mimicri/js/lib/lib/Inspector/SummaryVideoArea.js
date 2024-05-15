"use strict";

exports.__esModule = true;
exports.SummaryVideoArea = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SummaryVideoArea = function SummaryVideoArea(_ref) {
  var selectedAreas = _ref.selectedAreas,
    extents = _ref.extents,
    segMap = _ref.segMap,
    frame = _ref.frame,
    setFrame = _ref.setFrame;
  var refVideoArea = (0, _react.useRef)("VideoArea");
  var layout = {
    "height": 120,
    "width": 1200,
    "marginTop": 20,
    "marginRight": 10,
    "marginBottom": 20,
    "marginLeft": 30
  };
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  function getExtent(data) {
    var dropNan = data.filter(function (d) {
      return !isNaN(parseFloat(d));
    }).sort(function (a, b) {
      return a - b;
    });
    var mean = d3.mean(dropNan, function (d) {
      return d;
    });
    var min = d3.min(dropNan, function (d) {
      return d;
    });
    var max = d3.max(dropNan, function (d) {
      return d;
    });
    return [min, mean, max];
  }
  function getFrameExtents(frames) {
    var result = [];
    for (var _iterator = _createForOfIteratorHelperLoose(frames), _step; !(_step = _iterator()).done;) {
      var f = _step.value;
      var frameSummary = getExtent(f);
      result.push(frameSummary);
    }
    return result;
  }
  (0, _react.useEffect)(function () {
    if (selectedAreas.length > 0) {
      var dragUpdated = function dragUpdated(e, d) {
        var changeX = e.dx;
        var el = d3.select(this);
        var elX = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);
        var newX = elX + changeX;
        if (newX < 0) {
          newX = 0;
        }
        if (newX > layout.width - layout.marginRight - frameWidth / 2) {
          newX = layout.width - layout.marginRight - frameWidth / 2;
        }
        if (newX < layout.marginLeft - frameWidth / 2) {
          newX = layout.marginLeft - frameWidth / 2;
        }
        el.attr("transform", "translate(" + newX + ", 0)");
      };
      var dragEnd = function dragEnd(e, d) {
        var el = d3.select(this);
        var xStart = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]) - layout.marginLeft;
        var niceX = Math.round((xStart + frameWidth / 2) / frameWidth);
        setFrame(niceX);
      };
      var allExtent = [d3.min(Object.keys(extents).map(function (e) {
        return d3.min(extents[e]);
      })), d3.max(Object.keys(extents).map(function (e) {
        return d3.max(extents[e]);
      }))];
      var svgVideoAreas = d3.select(refVideoArea.current).attr("width", layout.width).attr("height", layout.height);
      svgVideoAreas.select("#title").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("transform", "translate(" + (layout.width / 2 + 10) + ", " + layout.marginTop + ")");
      svgVideoAreas.select("#main").selectAll(".groups").data(Object.keys(segMap)).join("g").attr("class", "groups").attr("id", function (d, i) {
        return "group" + d;
      });
      var frameCount = selectedAreas[0].length;
      var xScale = d3.scaleLinear().domain([0, frameCount - 1]).range([layout.marginLeft, layout.width - layout.marginRight]);
      var yScale = d3.scaleLinear().domain(allExtent).range([layout.height - layout.marginBottom, layout.marginTop]);
      svgVideoAreas.selectAll("#xAxis").attr("transform", "translate(" + 0 + ", " + (layout.height - layout.marginBottom) + ")").call(d3.axisBottom(xScale).ticks(5).tickSize(3));
      var frameWidth = xScale(1) - xScale(0);
      var drag = d3.drag().on("drag", dragUpdated).on("end", dragEnd);
      var brush = svgVideoAreas.selectAll("#brushRect").data([1]).join("rect").attr("id", "brushRect").attr("x", 0).attr("y", 0).attr("transform", "translate(" + (layout.marginLeft + frameWidth * frame - frameWidth / 2) + ", 0)").attr("width", frameWidth).attr("height", layout.height).attr("fill", "black").attr("opacity", "0.2").style("cursor", "move").call(drag);
      var _loop = function _loop() {
        var s = Object.keys(segMap)[si];
        var allFrames = [];
        var _loop2 = function _loop2(f) {
          var frameMeta = selectedAreas.map(function (a) {
            return a[f][s];
          });
          allFrames.push(frameMeta);
        };
        for (var f = 0; f < frameCount; f++) {
          _loop2(f);
        }
        var frameExtents = getFrameExtents(allFrames);
        var area = d3.area().x(function (d, i) {
          return xScale(i);
        }).y0(function (d) {
          return yScale(d[0]);
        }).y1(function (d) {
          return yScale(d[2]);
        });
        var segGroup = svgVideoAreas.select("#group" + s);
        var line = d3.line().x(function (d, i) {
          return xScale(i);
        }).y(function (d) {
          return yScale(d[1]);
        });
        segGroup.selectAll(".area").data([frameExtents]).join("path").attr("class", "area").attr("d", area).attr("fill", segmentColorScale(parseInt(s))).attr("opacity", 0.25);
        segGroup.selectAll(".path").data([frameExtents]).join("path").attr("class", "path").attr("d", line).attr("fill", "none").attr("stroke", segmentColorScale(parseInt(s))).attr("stroke-width", 2);
      };
      for (var si = 0; si < Object.keys(segMap).length; si++) {
        _loop();
      }
    }
  }, [selectedAreas, segMap, extents, frame]);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refVideoArea
  }, /*#__PURE__*/_react["default"].createElement("text", {
    id: "title"
  }, "area distribution over time"), /*#__PURE__*/_react["default"].createElement("g", {
    id: "xAxis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "yAxis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "main"
  }), /*#__PURE__*/_react["default"].createElement("rect", {
    id: "brushRect"
  })));
};
exports.SummaryVideoArea = SummaryVideoArea;