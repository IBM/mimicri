"use strict";

exports.__esModule = true;
exports.SummaryFacet = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SummaryFacet = function SummaryFacet(_ref) {
  var subsetID = _ref.subsetID,
    predictions = _ref.predictions,
    selected = _ref.selected,
    handleSelection = _ref.handleSelection,
    segMap = _ref.segMap,
    _ref$layout = _ref.layout,
    layout = _ref$layout === void 0 ? {
      "height": 300,
      "width": 900,
      "marginTop": 10,
      "marginRight": 50,
      "marginBottom": 10,
      "marginLeft": 50
    } : _ref$layout;
  var refFacet = (0, _react.useRef)("FacetVis");
  (0, _react.useEffect)(function () {
    if (predictions.length == 0) {
      var svgFacet = d3.select(refFacet.current).attr("width", 0).attr("height", 0);
    }
    if (predictions.length > 0) {
      var padding = 2;
      var groupedPredictions = d3.group(predictions, function (d) {
        return d.label;
      });
      var _svgFacet = d3.select(refFacet.current);
      var groupHeight = 35;
      var groups = Array.from(groupedPredictions.keys()).sort();
      layout.height = groups.length * groupHeight + layout.marginBottom + layout.marginTop;
      _svgFacet.attr("width", layout.width).attr("height", layout.height);
      _svgFacet.selectAll(".group").data(groups).join("g").attr("class", "group").attr("id", function (g) {
        return "group" + g;
      }).attr("transform", function (d, i) {
        return "translate(" + 0 + ", " + (i * groupHeight + layout.marginTop) + ")";
      });
      var _loop = function _loop() {
        var g = _step.value;
        var groupData = groupedPredictions.get(g);
        var isCounterfactual = groupData.filter(function (d) {
          return d.r_prediction[1] < 0.5 && d.t_prediction[1] > 0.5 || d.r_prediction[1] > 0.5 && d.t_prediction[1] < 0.5;
        });
        var isNotCounterfactual = groupData.filter(function (d) {
          return d.r_prediction[1] < 0.5 && d.t_prediction[1] < 0.5 || d.r_prediction[1] > 0.5 && d.t_prediction[1] > 0.5;
        });
        var proportionCounterfactual = isCounterfactual.length / groupData.length;
        var widthCounterfactual = (layout.width - layout.marginLeft - layout.marginRight) * proportionCounterfactual;
        var proportionSame = 1 - proportionCounterfactual;
        var svgGroup = _svgFacet.select("#group" + g);
        svgGroup.selectAll("#isCounterfactual").data([proportionCounterfactual]).join("rect").attr("id", "isCounterfactual").attr("x", layout.marginLeft).attr("y", padding).attr("width", function (d) {
          return (layout.width - layout.marginLeft - layout.marginRight) * d;
        }).attr("height", groupHeight - padding * 2).attr("fill", "green").attr("opacity", 0.8).attr("cursor", "pointer").on("click", function () {
          handleSelection(selected, isCounterfactual, ("<b>" + g + "_counterfactuals</b> " + subsetID).trim());

          // console.log(isCounterfactual);
        });

        svgGroup.selectAll("#notCounterfactual").data([proportionSame]).join("rect").attr("id", "notCounterfactual").attr("x", function (d) {
          return layout.width - layout.marginRight - (layout.width - layout.marginLeft - layout.marginRight) * d;
        }).attr("y", padding).attr("width", function (d) {
          return (layout.width - layout.marginLeft - layout.marginRight) * d;
        }).attr("height", groupHeight - padding * 2).attr("fill", "gray").attr("opacity", 0.3).attr("cursor", "pointer").on("click", function () {
          handleSelection(selected, isNotCounterfactual, ("<b>" + g + "_no counterfactuals</b> " + subsetID).trim());

          // console.log(isNotCounterfactual);
        });

        svgGroup.selectAll("#groupLabel").data([g]).join("text").attr("id", "groupLabel").attr("text-anchor", "end").attr("alignment-baseline", "middle").attr("y", groupHeight / 2).attr("x", layout.marginLeft - 10).attr("font-family", "sans-serif").attr("font-size", 15).text(function (d) {
          return d;
        });
      };
      for (var _iterator = _createForOfIteratorHelperLoose(groups), _step; !(_step = _iterator()).done;) {
        _loop();
      }
    }
  }, [predictions, selected]);
  return /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refFacet
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "axis"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "main"
  }));
};
exports.SummaryFacet = SummaryFacet;