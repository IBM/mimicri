"use strict";

exports.__esModule = true;
exports.Inspector = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _SummaryFacetWrapper = require("./Inspector/SummaryFacetWrapper.js");
var _SummarySubset = require("./Inspector/SummarySubset.js");
var _SummaryVideoSubset = require("./Inspector/SummaryVideoSubset.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var Inspector = function Inspector(_ref) {
  var predictions = _ref.predictions,
    demographics = _ref.demographics,
    _ref$segMap = _ref.segMap,
    segMap = _ref$segMap === void 0 ? {} : _ref$segMap,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "eid" : _ref$_index,
    _ref$_isVideo = _ref._isVideo,
    _isVideo = _ref$_isVideo === void 0 ? false : _ref$_isVideo;
  var _useState = (0, _react.useState)({}),
    selected = _useState[0],
    setSelected = _useState[1];
  var _useState2 = (0, _react.useState)(JSON.parse(JSON.stringify(segMap))),
    selectedSegments = _useState2[0],
    setSelectedSegments = _useState2[1];
  var _useState3 = (0, _react.useState)([]),
    sourceDemographics = _useState3[0],
    setSourceDemographics = _useState3[1];
  var _useState4 = (0, _react.useState)([]),
    targetDemographics = _useState4[0],
    setTargetDemographics = _useState4[1];
  var _useState5 = (0, _react.useState)({
      "radials": [0, 1],
      "areas": [0, 1],
      "colors": [0, 255]
    }),
    extents = _useState5[0],
    setExtents = _useState5[1];
  (0, _react.useEffect)(function () {
    if (!_isVideo) {
      var newExtents = {};
      var radials = predictions.map(function (p) {
        return p["radials"];
      });
      var newMaxRadial = d3.max(Object.keys(radials).map(function (r) {
        return d3.max(Object.keys(radials[r]).map(function (s) {
          return d3.max(radials[r][s]);
        }));
      }));
      newExtents["radials"] = [0, Math.round(newMaxRadial * 100) / 100];
      var areas = predictions.map(function (p) {
        return p["areas"];
      });
      var colors = predictions.map(function (p) {
        return p["colors"];
      });
      var newAreaExtents = {};
      var newColorExtents = {};
      var _loop = function _loop() {
        var s = _Object$keys[_i];
        var sArea = d3.extent(areas.map(function (a) {
          return a[s];
        }));
        newAreaExtents[s] = sArea;
        var sColorMax = d3.max(colors.map(function (c) {
          return d3.max(c[s]);
        }));
        newColorExtents[s] = [0, sColorMax];
      };
      for (var _i = 0, _Object$keys = Object.keys(segMap); _i < _Object$keys.length; _i++) {
        _loop();
      }
      newExtents["areas"] = newAreaExtents;
      newExtents["colors"] = newColorExtents;
      setExtents(newExtents);
    } else {
      var _newExtents = {};
      var _radials = predictions.map(function (p) {
        return p["radials"];
      });
      var _newMaxRadial = d3.max(_radials.map(function (idFrames) {
        return d3.max(idFrames.map(function (frame) {
          return d3.max(Object.keys(segMap).map(function (s) {
            return d3.max(frame[s]);
          }));
        }));
      }));
      _newExtents["radials"] = [0, Math.round(_newMaxRadial * 100) / 100];
      var _areas = predictions.map(function (p) {
        return p["areas"];
      });
      var areaMin = d3.min(_areas.map(function (frames) {
        return d3.min(frames.map(function (segments) {
          return d3.min(Object.keys(segMap).map(function (s) {
            return segments[s];
          }));
        }));
      }));
      var areaMax = d3.max(_areas.map(function (frames) {
        return d3.max(frames.map(function (segments) {
          return d3.max(Object.keys(segMap).map(function (s) {
            return segments[s];
          }));
        }));
      }));
      var _newAreaExtents = {
        "all": [areaMin, areaMax]
      };
      var _colors = predictions.map(function (p) {
        return p["colors"];
      });
      var _newColorExtents = {};
      var _loop2 = function _loop2() {
        var s = _Object$keys2[_i2];
        var sColorMax = d3.max(_colors.map(function (idFrames) {
          return d3.max(idFrames.map(function (frame) {
            return d3.max(frame[s]);
          }));
        }));
        _newColorExtents[s] = [0, sColorMax];
      };
      for (var _i2 = 0, _Object$keys2 = Object.keys(segMap); _i2 < _Object$keys2.length; _i2++) {
        _loop2();
      }
      _newExtents["areas"] = _newAreaExtents;
      _newExtents["colors"] = _newColorExtents;
      setExtents(_newExtents);
    }
  }, [_isVideo]);
  (0, _react.useEffect)(function () {
    var sources = new Set(predictions.map(function (p) {
      return p.sID;
    }));
    var targets = new Set(predictions.map(function (p) {
      return p.tID;
    }));
    var newSourceDemographics = demographics.filter(function (d) {
      return sources.has(d[_index]);
    });
    var newTargetDemographics = demographics.filter(function (d) {
      return targets.has(d[_index]);
    });
    setSourceDemographics(newSourceDemographics);
    setTargetDemographics(newTargetDemographics);
  }, [predictions, demographics]);
  function handleSelection(selected, selection, label) {
    var selectedLabels = Object.keys(selected);
    if (selectedLabels.indexOf(label) >= 0 && selection.length > 0) {
      // Update threshold
      var newSelection = JSON.parse(JSON.stringify(selected));
      newSelection[label] = selection;
      setSelected(newSelection);
    } else if (selectedLabels.indexOf(label) >= 0 && selection.length == 0) {
      // Remove attribute and threshold
      var _newSelection = JSON.parse(JSON.stringify(selected));
      delete _newSelection[label];
      setSelected(_newSelection);
    } else if (selectedLabels.indexOf(label) == -1 && selection.length > 0) {
      // Add new attribute and threshold
      var _newSelection2 = JSON.parse(JSON.stringify(selected));
      _newSelection2[label] = selection;
      setSelected(_newSelection2);
    }
  }
  var overviewStyle = {
    "display": "flex"
  };
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("div", {
    style: overviewStyle
  }, /*#__PURE__*/_react["default"].createElement(_SummaryFacetWrapper.SummaryFacetWrapper, {
    sourceDemographics: sourceDemographics,
    targetDemographics: targetDemographics,
    predictions: predictions,
    selected: selected,
    handleSelection: handleSelection,
    segMap: segMap,
    _index: _index
  })), _isVideo ? /*#__PURE__*/_react["default"].createElement(_SummaryVideoSubset.SummaryVideoSubset, {
    selected: selected,
    segMap: segMap,
    extents: extents,
    handleSelection: handleSelection
  }) : /*#__PURE__*/_react["default"].createElement(_SummarySubset.SummarySubset, {
    selected: selected,
    segMap: segMap,
    extents: extents,
    handleSelection: handleSelection
  }));
};
exports.Inspector = Inspector;