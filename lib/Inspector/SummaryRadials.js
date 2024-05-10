"use strict";

exports.__esModule = true;
exports.SummaryRadials = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SummaryRadials = function SummaryRadials(_ref) {
  var selectedRadials = _ref.selectedRadials,
    segMap = _ref.segMap,
    extents = _ref.extents,
    frame = _ref.frame;
  var refRadial = (0, _react.useRef)("Radial");
  var layout = {
    "height": 300,
    "width": 300,
    "margin": 30
  };
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  function isIQR(data) {
    var positions = data[0].length;
    var _loop = function _loop(i) {
        var allPositionValues = Array.from(new Set(data.map(function (d) {
          return d[i];
        })));
        if (allPositionValues.length < 5) {
          return {
            v: false
          };
        }
      },
      _ret;
    for (var i = 0; i < positions; i++) {
      _ret = _loop(i);
      if (_ret) return _ret.v;
    }
    return true;
  }
  function getIQR(data) {
    var dropNan = data.filter(function (d) {
      return !isNaN(parseFloat(d));
    }).sort(function (a, b) {
      return a - b;
    });
    var median = d3.median(dropNan, function (d) {
      return d;
    });
    var middleIndex = dropNan.length / 2;
    var top = dropNan.filter(function (d, i) {
      return i > middleIndex;
    });
    var bottom = dropNan.filter(function (d, i) {
      return i < middleIndex;
    });
    var Q3 = d3.median(top, function (d) {
      return d;
    });
    var Q1 = d3.median(bottom, function (d) {
      return d;
    });
    var min = d3.min(dropNan, function (d) {
      return d;
    });
    var max = d3.max(dropNan, function (d) {
      return d;
    });
    return [min, Q1, median, Q3, max];
  }
  function getFlat(data) {
    var result = [];
    for (var _iterator = _createForOfIteratorHelperLoose(data), _step; !(_step = _iterator()).done;) {
      var d = _step.value;
      for (var i = 0; i < d.length; i++) {
        result.push({
          "direction": i,
          "value": d[i]
        });
      }
    }
    return result;
  }
  (0, _react.useEffect)(function () {
    var plotSize = 300;
    if (selectedRadials.length > 0) {
      layout.width = Object.keys(segMap).length * plotSize;
      var svgRadial = d3.select(refRadial.current).attr("width", layout.width).attr("height", layout.height);
      svgRadial.selectAll(".groups").data(Object.keys(segMap)).join("g").attr("class", "groups").attr("id", function (d, i) {
        return "group" + d;
      }).attr("transform", function (d, i) {
        return "translate(" + (plotSize * i + plotSize / 2) + ", " + (plotSize - layout.margin) / 2 + ")";
      });
      svgRadial.selectAll(".titles").data(Object.keys(segMap)).join("text").attr("class", "titles").attr("text-anchor", "middle").attr("transform", function (d, i) {
        return "translate(" + (plotSize * i + plotSize / 2) + ", " + (layout.height - 10) + ")";
      }).attr("font-family", "sans-serif").text(function (d) {
        return "contours " + segMap[d];
      });
      var _loop2 = function _loop2() {
        var s = _Object$keys[_i];
        var segData = selectedRadials.map(function (r) {
          return r[s];
        });

        // Plot IQR if five or more unique data values selected
        if (isIQR(segData)) {
          var allDirections = [];
          var _loop3 = function _loop3(direction) {
            var directionData = segData.map(function (d) {
              return d[direction];
            });
            allDirections.push(getIQR(directionData));
          };
          for (var direction = 0; direction < segData[0].length; direction++) {
            _loop3(direction);
          }
          var scaleX = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7]).range([0, 2 * Math.PI]);
          var scaleY = d3.scaleRadial().domain(extents).range([0, plotSize / 2 - layout.margin]);
          var plotGroup = svgRadial.select("#group" + s);
          var barWidth = scaleX.bandwidth();
          plotGroup.selectAll(".prediction").remove();
          plotGroup.selectAll(".bars").data(allDirections).join("path").attr("class", "bars").attr("d", d3.arc().innerRadius(function (d) {
            return scaleY(d[1]);
          }).outerRadius(function (d) {
            return scaleY(d[3]);
          }).startAngle(function (d, i) {
            return scaleX(i) - barWidth / 2;
          }).endAngle(function (d, i) {
            return scaleX(i) + barWidth / 2;
          })).attr("fill", segmentColorScale(parseInt(s)));
          plotGroup.selectAll(".whisker").data(allDirections).join("line").attr("class", "whisker").attr("x1", function (d, i) {
            return scaleY(d[0]) * Math.sin(scaleX(i));
          }).attr("y1", function (d, i) {
            return -scaleY(d[0]) * Math.cos(scaleX(i));
          }).attr("x2", function (d, i) {
            return scaleY(d[4]) * Math.sin(scaleX(i));
          }).attr("y2", function (d, i) {
            return -scaleY(d[4]) * Math.cos(scaleX(i));
          }).attr("stroke", segmentColorScale(parseInt(s)));
          // .attr("stroke-width", 2);

          plotGroup.selectAll(".mid").data(allDirections).join("path").attr("class", "mid").attr("d", d3.arc().innerRadius(function (d) {
            return scaleY(d[2]) - 0.5;
          }).outerRadius(function (d) {
            return scaleY(d[2]) + 0.5;
          }).startAngle(function (d, i) {
            return scaleX(i) - barWidth / 2;
          }).endAngle(function (d, i) {
            return scaleX(i) + barWidth / 2;
          })).attr("fill", "white");
          var dashArray = Math.PI / 6 / 5;
          plotGroup.selectAll(".axis").data([extents[1], extents[1], extents[1]]).join("path").attr("class", "axis").attr("d", d3.arc().innerRadius(function (d) {
            return scaleY(d) - 0.5;
          }).outerRadius(function (d) {
            return scaleY(d) + 0.5;
          }).startAngle(function (d, i) {
            return 0 - Math.PI / 12 + i * dashArray * 2;
          }).endAngle(function (d, i) {
            return 0 - Math.PI / 12 + i * dashArray * 2 + dashArray;
          })).attr("fill", "black");
          plotGroup.selectAll(".axisLabelMax").data([extents[1]]).join("text").attr("class", "axisLabelMax").text(function (d) {
            return d;
          }).attr("text-anchor", "middle").attr("x", 0).attr("y", -plotSize / 2 + 27).attr("font-size", 11).attr("font-family", "sans-serif");
          plotGroup.selectAll(".axisLabelMin").data(["0.0"]).join("text").attr("class", "axisLabelMin").text(function (d) {
            return d;
          }).attr("text-anchor", "middle").attr("alignment-baseline", "middle").attr("x", 0).attr("y", 0).attr("font-size", 11).attr("font-family", "sans-serif");
        } else {
          var flattened = getFlat(segData);
          var _scaleX = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6, 7]).range([0, 2 * Math.PI]);
          var _scaleY = d3.scaleRadial().domain(extents).range([0, plotSize / 2 - layout.margin]);
          var _plotGroup = svgRadial.select("#group" + s);
          var _barWidth = _scaleX.bandwidth();
          _plotGroup.selectAll(".bars").remove();
          _plotGroup.selectAll(".whisker").remove();
          _plotGroup.selectAll(".mid").remove();
          _plotGroup.selectAll(".prediction").data(flattened).join("path").attr("class", "prediction").attr("d", d3.arc().innerRadius(function (d) {
            return _scaleY(d.value) - 1;
          }).outerRadius(function (d) {
            return _scaleY(d.value) + 1;
          }).startAngle(function (d, i) {
            return _scaleX(d.direction) - _barWidth / 2;
          }).endAngle(function (d, i) {
            return _scaleX(d.direction) + _barWidth / 2;
          })).attr("fill", segmentColorScale(parseInt(s)));
          var _dashArray = Math.PI / 6 / 5;
          _plotGroup.selectAll(".axis").data([extents[1], extents[1], extents[1]]).join("path").attr("class", "axis").attr("d", d3.arc().innerRadius(function (d) {
            return _scaleY(d) - 0.5;
          }).outerRadius(function (d) {
            return _scaleY(d) + 0.5;
          }).startAngle(function (d, i) {
            return 0 - Math.PI / 12 + i * _dashArray * 2;
          }).endAngle(function (d, i) {
            return 0 - Math.PI / 12 + i * _dashArray * 2 + _dashArray;
          })).attr("fill", "black");
          _plotGroup.selectAll(".axisLabelMax").data([extents[1]]).join("text").attr("class", "axisLabelMax").text(function (d) {
            return d;
          }).attr("text-anchor", "middle").attr("x", 0).attr("y", -plotSize / 2 + 27).attr("font-size", 11).attr("font-family", "sans-serif");
          _plotGroup.selectAll(".axisLabelMin").data(["0.0"]).join("text").attr("class", "axisLabelMin").text(function (d) {
            return d;
          }).attr("text-anchor", "middle").attr("alignment-baseline", "middle").attr("x", 0).attr("y", 0).attr("font-size", 11).attr("font-family", "sans-serif");
        }
      };
      for (var _i = 0, _Object$keys = Object.keys(segMap); _i < _Object$keys.length; _i++) {
        _loop2();
      }
    }
  }, [selectedRadials, segMap, extents]);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refRadial
  }));
};
exports.SummaryRadials = SummaryRadials;