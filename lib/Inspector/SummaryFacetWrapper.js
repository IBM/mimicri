"use strict";

exports.__esModule = true;
exports.SummaryFacetWrapper = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _SummaryFacet = require("./SummaryFacet.js");
var _SummaryFilterSource = require("./SummaryFilterSource.js");
var _SummaryFilterTarget = require("./SummaryFilterTarget.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SummaryFacetWrapper = function SummaryFacetWrapper(_ref) {
  var _ref$predictions = _ref.predictions,
    predictions = _ref$predictions === void 0 ? [] : _ref$predictions,
    sourceDemographics = _ref.sourceDemographics,
    targetDemographics = _ref.targetDemographics,
    selected = _ref.selected,
    handleSelection = _ref.handleSelection,
    segMap = _ref.segMap,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "eid" : _ref$_index;
  var groupHeight = 35;
  var baseLayout = {
    "width": 900,
    "marginTop": 10,
    "marginRight": 50,
    "marginBottom": 10,
    "marginLeft": 50
  };
  var _useState = (0, _react.useState)([]),
    subsets = _useState[0],
    setSubsets = _useState[1];
  var _useState2 = (0, _react.useState)(baseLayout),
    layouts = _useState2[0],
    setLayouts = _useState2[1];
  var _useState3 = (0, _react.useState)([]),
    uniqueLabels = _useState3[0],
    setUniqueLabels = _useState3[1];
  var _useState4 = (0, _react.useState)(0),
    layoutHeight = _useState4[0],
    setLayoutHeight = _useState4[1];
  var _useState5 = (0, _react.useState)(0),
    targetFilterHeight = _useState5[0],
    setTargetFilterHeight = _useState5[1];
  var _useState6 = (0, _react.useState)({
      "display": "grid",
      "gridColumn": "2/3",
      "gridRow": "2/3",
      "gridTemplateColumns": "1fr",
      "gridTemplateRows": "1fr",
      "gridGap": "0px",
      "width": "900px"
    }),
    gridLayout = _useState6[0],
    setGridLayout = _useState6[1];

  // Keep track of attributes and thresholds used for subsets
  var _useState7 = (0, _react.useState)({}),
    createSubsets = _useState7[0],
    setCreateSubsets = _useState7[1];
  (0, _react.useEffect)(function () {
    setSubsets([{
      "label": "",
      "values": predictions
    }]);
    var uniqueLabels = Array.from(new Set(predictions.map(function (p) {
      return p.label;
    })));
    setUniqueLabels(uniqueLabels);
    var newLayoutHeight = uniqueLabels.length * groupHeight + baseLayout.marginBottom + baseLayout.marginTop;
    setLayoutHeight(newLayoutHeight);
    setLayouts(_extends({}, baseLayout, {
      "height": newLayoutHeight
    }));
  }, [predictions]);
  (0, _react.useEffect)(function () {
    if (!createSubsets.source && !createSubsets.target) {
      setSubsets([{
        "label": "",
        "values": predictions
      }]);
      setLayouts(_extends({}, baseLayout, {
        "height": layoutHeight
      }));
      setGridLayout({
        "display": "grid",
        "gridColumn": "2/3",
        "gridRow": "2/3",
        "gridTemplateColumns": "1fr",
        "gridTemplateRows": "1fr",
        "gridGap": "0px",
        "width": "900px"
      });
    } else {
      var newSubsets = [];

      // If split by source
      if (createSubsets.source) {
        var sourceAttribute = createSubsets.source.attribute;
        var sourceThreshold = createSubsets.source.threshold;
        var lessThanIndex = new Set(sourceDemographics.filter(function (d) {
          return parseFloat(d[sourceAttribute]) <= sourceThreshold;
        }).map(function (d) {
          return d[_index];
        }));
        var moreThanIndex = new Set(sourceDemographics.filter(function (d) {
          return parseFloat(d[sourceAttribute]) > sourceThreshold;
        }).map(function (d) {
          return d[_index];
        }));
        var lessThan = predictions.filter(function (p) {
          return lessThanIndex.has(p.sID);
        });
        var moreThan = predictions.filter(function (p) {
          return moreThanIndex.has(p.sID);
        });
        newSubsets = [{
          "label": "Source: " + sourceAttribute + " <= " + sourceThreshold,
          "values": lessThan
        }, {
          "label": "Source: " + sourceAttribute + " > " + sourceThreshold,
          "values": moreThan
        }];
      }
      if (createSubsets.target) {
        var targetAttribute = createSubsets.target.attribute;
        var targetThreshold = createSubsets.target.threshold;
        if (newSubsets.length == 0) {
          var _lessThanIndex = new Set(targetDemographics.filter(function (d) {
            return parseFloat(d[targetAttribute]) <= targetThreshold;
          }).map(function (d) {
            return d[_index];
          }));
          var _moreThanIndex = new Set(targetDemographics.filter(function (d) {
            return parseFloat(d[targetAttribute]) > targetThreshold;
          }).map(function (d) {
            return d[_index];
          }));
          var _lessThan = predictions.filter(function (p) {
            return _lessThanIndex.has(p.tID);
          });
          var _moreThan = predictions.filter(function (p) {
            return _moreThanIndex.has(p.tID);
          });
          newSubsets = [{
            "label": "Target: " + targetAttribute + " <= " + targetThreshold,
            "values": _moreThan
          }, {
            "label": "Target: " + targetAttribute + " > " + targetThreshold,
            "values": _lessThan
          }];
        } else {
          var _sourceAttribute = createSubsets.source.attribute;
          var _sourceThreshold = createSubsets.source.threshold;
          var sourceLessThan = newSubsets[0]["values"];
          var sourceMoreThan = newSubsets[1]["values"];
          var _lessThanIndex2 = new Set(targetDemographics.filter(function (d) {
            return parseFloat(d[targetAttribute]) <= targetThreshold;
          }).map(function (d) {
            return d[_index];
          }));
          var _moreThanIndex2 = new Set(targetDemographics.filter(function (d) {
            return parseFloat(d[targetAttribute]) > targetThreshold;
          }).map(function (d) {
            return d[_index];
          }));
          var SLTL = sourceLessThan.filter(function (p) {
            return _lessThanIndex2.has(p.tID);
          });
          var SLTM = sourceLessThan.filter(function (p) {
            return _moreThanIndex2.has(p.tID);
          });
          var SMTL = sourceMoreThan.filter(function (p) {
            return _lessThanIndex2.has(p.tID);
          });
          var SMTM = sourceMoreThan.filter(function (p) {
            return _moreThanIndex2.has(p.tID);
          });
          newSubsets = [{
            "label": "Source: " + _sourceAttribute + " <= " + _sourceThreshold + " Target: " + targetAttribute + " > " + targetThreshold,
            "values": SLTM
          }, {
            "label": "Source: " + _sourceAttribute + " > " + _sourceThreshold + " Target: " + targetAttribute + " > " + targetThreshold,
            "values": SMTM
          }, {
            "label": "Source: " + _sourceAttribute + " <= " + _sourceThreshold + " Target: " + targetAttribute + " <= " + targetThreshold,
            "values": SLTL
          }, {
            "label": "Source: " + _sourceAttribute + " > " + _sourceThreshold + " Target: " + targetAttribute + " <= " + targetThreshold,
            "values": SMTL
          }];
        }
      }
      setSubsets(newSubsets);
      if (createSubsets.source && createSubsets.target) {
        var newLayout = _extends({}, baseLayout, {
          "height": layoutHeight,
          "width": baseLayout.width / 2
        });
        setLayouts([newLayout, newLayout, newLayout, newLayout]);
        setGridLayout({
          "display": "grid",
          "gridColumn": "2/3",
          "gridRow": "2/3",
          "gridTemplateColumns": "1fr 1fr",
          "gridTemplateRows": "1fr 1fr",
          "gridGap": "0px",
          "width": "900px"
        });
        setTargetFilterHeight(layoutHeight * 2);
      } else if (createSubsets.source) {
        var _newLayout = _extends({}, baseLayout, {
          "height": layoutHeight,
          "width": baseLayout.width / 2
        });
        setLayouts([_newLayout, _newLayout]);
        setGridLayout({
          "display": "grid",
          "gridColumn": "2/3",
          "gridRow": "2/3",
          "gridTemplateColumns": "1fr 1fr",
          "gridTemplateRows": "1fr",
          "gridGap": "0px",
          "width": "900px"
        });
        setTargetFilterHeight(0);
      } else if (createSubsets.target) {
        var _newLayout2 = _extends({}, baseLayout, {
          "height": layoutHeight,
          "width": baseLayout.width
        });
        setLayouts([_newLayout2, _newLayout2]);
        setGridLayout({
          "display": "grid",
          "gridColumn": "2/3",
          "gridRow": "2/3",
          "gridTemplateColumns": "1fr",
          "gridTemplateRows": "1fr 1fr",
          "gridGap": "0px",
          "width": "900px"
        });
        setTargetFilterHeight(layoutHeight * 2);
      }
    }
  }, [createSubsets]);
  function handleSourceFilter(attribute, threshold) {
    if (!attribute && !threshold) {
      var newCreateSubsets = _extends({}, createSubsets);
      delete newCreateSubsets["source"];
      setCreateSubsets(newCreateSubsets);
    } else {
      var _newCreateSubsets = _extends({}, createSubsets, {
        "source": {
          "attribute": attribute,
          "threshold": threshold
        }
      });
      setCreateSubsets(_newCreateSubsets);
    }
  }
  function handleTargetFilter(attribute, threshold) {
    if (!attribute && !threshold) {
      var newCreateSubsets = _extends({}, createSubsets);
      delete newCreateSubsets["target"];
      setCreateSubsets(newCreateSubsets);
    } else {
      var _newCreateSubsets2 = _extends({}, createSubsets, {
        "target": {
          "attribute": attribute,
          "threshold": threshold
        }
      });
      setCreateSubsets(_newCreateSubsets2);
    }
  }
  var formStyle = {
    "display": "grid",
    "gridTemplateColumns": "auto auto",
    "gridTemplateRows": "auto auto",
    "gridGap": "0px"
  };
  var targetFilterStyle = {
    "gridColumn": "1/2",
    "gridRow": "2/3"
  };
  var sourceFilterStyle = {
    "gridColumn": "2/3",
    "gridRow": "1/2"
  };
  var visLayout = {
    "display": "grid",
    "gridTemplateColumns": "auto auto 1fr",
    "gridTemplateRows": "auto auto 1fr",
    "gridGap": "0px",
    "width": "900px"
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: formStyle
  }, /*#__PURE__*/_react["default"].createElement("div", {
    style: targetFilterStyle
  }, /*#__PURE__*/_react["default"].createElement(_SummaryFilterTarget.SummaryFilterTarget, {
    data: targetDemographics,
    targetFilterHeight: targetFilterHeight,
    handleTargetFilter: handleTargetFilter
  })), /*#__PURE__*/_react["default"].createElement("div", {
    style: sourceFilterStyle
  }, /*#__PURE__*/_react["default"].createElement(_SummaryFilterSource.SummaryFilterSource, {
    data: sourceDemographics,
    handleSourceFilter: handleSourceFilter
  })), /*#__PURE__*/_react["default"].createElement("div", {
    style: gridLayout
  }, subsets.map(function (s, i) {
    return /*#__PURE__*/_react["default"].createElement(_SummaryFacet.SummaryFacet, {
      key: "subset" + i,
      subsetID: s["label"],
      predictions: s["values"],
      selected: selected,
      handleSelection: handleSelection,
      layout: layouts[i]
    });
  })));
};
exports.SummaryFacetWrapper = SummaryFacetWrapper;