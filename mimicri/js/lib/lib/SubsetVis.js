"use strict";

exports.__esModule = true;
exports.SubsetVis = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var _SubsetFilter = require("./SubsetFilter.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var SubsetVis = function SubsetVis(_ref) {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$scale = _ref.scale,
    scale = _ref$scale === void 0 ? 3 : _ref$scale,
    setIndices = _ref.setIndices,
    setSubset = _ref.setSubset,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "_uuid" : _ref$_index;
  var refContainer = (0, _react.useRef)("Container");
  var refUnit = (0, _react.useRef)("UnitVis");
  var refIcicle = (0, _react.useRef)("IcicleVis");
  // const refTooltip = useRef("Tooltip");
  var refStats = (0, _react.useRef)("Stats");
  var refShow = (0, _react.useRef)("Show");
  var refFilter = (0, _react.useRef)("Filters");
  var refSubset = (0, _react.useRef)("SubsetContainer");
  var _useState = (0, _react.useState)("All"),
    base = _useState[0],
    setBase = _useState[1];
  var _useState2 = (0, _react.useState)([]),
    layers = _useState2[0],
    setLayers = _useState2[1];
  var _useState3 = (0, _react.useState)([[]]),
    rules = _useState3[0],
    setRules = _useState3[1];
  var layout = {
    "height": 60,
    "width": 900,
    "margin": 10
  };
  var icicleHeight = 50;
  function getLayout(n, cols, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (n < cols) {
      return [1, n];
    }
    var fullRows = Math.floor(n / cols);
    var rowsRemainder = n - fullRows * cols;
    if (rowsRemainder == 0) {
      return [fullRows, cols];
    } else if (!isFixed && rowsRemainder > 0) {
      var fullCols = Math.floor(n / fullRows);
      var colsRemainder = n - fullCols * fullRows;
      if (colsRemainder == 0) {
        return [fullRows, fullCols];
      } else {
        return [fullRows, fullCols + 1];
      }
    } else {
      return [fullRows + 1, cols];
    }
  }
  function layoutIcicle(children, total, width, startX, depth, margin) {
    if (startX === void 0) {
      startX = 0;
    }
    if (depth === void 0) {
      depth = 0;
    }
    var icicles = [];
    var xIncrement = startX;
    for (var _iterator = _createForOfIteratorHelperLoose(children), _step; !(_step = _iterator()).done;) {
      var c = _step.value;
      icicles.push({
        "x": xIncrement,
        "y": icicleHeight * depth,
        "width": c.data.length / total * width,
        "height": icicleHeight,
        "attribute": c.attribute,
        "label": c.label,
        "depth": depth,
        "data": c.data,
        "isRule": c.isRule
      });
      icicles = icicles.concat(layoutIcicle(c.children, total, width, xIncrement, depth + 1, margin));
      xIncrement = xIncrement + c.data.length / total * width;
    }
    return icicles;
  }
  function getSelectionSize(layers) {
    var result;
    var resultSize;
    var resultDepth;
    for (var _iterator2 = _createForOfIteratorHelperLoose(layers), _step2; !(_step2 = _iterator2()).done;) {
      var l = _step2.value;
      if (l.isRule && !result) {
        resultSize = l.data.length;
        result = l.data;
        resultDepth = l.depth;
      } else if (l.isRule && l.depth > resultDepth) {
        resultSize = l.data.length;
        result = l.data;
        resultDepth = l.depth;
      }
    }
    resultSize = resultSize ? resultSize : 0;
    result = result ? result : [];
    return [result, resultSize];
  }
  function getLayers(data, rules, isRule) {
    if (isRule === void 0) {
      isRule = false;
    }
    if (rules.length === 0) {
      return [];
    }
    var firstRule = rules[0];
    var otherRules = rules.slice(1);
    var result = {};
    if (firstRule.length === 0) {
      result.data = data;
      result.attribute = "All";
      result.isRule = true;
      result.label = "All";
      result.children = getLayers(data, rules.slice(1), true);
    } else if (Array.isArray(firstRule[1])) {
      var attribute = firstRule[0];
      var range = firstRule[1];
      var subgroup1 = data.filter(function (d) {
        return d[attribute] >= range[0] && d[attribute] <= range[1];
      });
      var subgroup2 = data.filter(function (d) {
        return d[attribute] < range[0] || d[attribute] > range[1];
      });
      return [{
        "attribute": attribute,
        "isRule": isRule ? true : false,
        "data": subgroup1,
        "label": range[0] + " <= " + attribute + " <= " + range[1],
        "children": getLayers(subgroup1, rules.slice(1), isRule ? true : false)
      }, {
        "attribute": attribute,
        "isRule": false,
        "data": subgroup2,
        "label": attribute + " < " + range[0] + " or " + attribute + " > " + range[1],
        "children": getLayers(subgroup2, rules.slice(1))
      }];
    } else {
      var _attribute = firstRule[0];
      var attrValue = firstRule[1];
      var _subgroup = data.filter(function (d) {
        return d[_attribute] == attrValue;
      });
      var _subgroup2 = data.filter(function (d) {
        return d[_attribute] != attrValue;
      });
      return [{
        "attribute": _attribute,
        "isRule": isRule ? true : false,
        "data": _subgroup,
        "label": _attribute + " = " + attrValue,
        "children": getLayers(_subgroup, rules.slice(1), isRule ? true : false)
      }, {
        "attribute": _attribute,
        "isRule": false,
        "data": _subgroup2,
        "label": _attribute + " != " + attrValue,
        "children": getLayers(_subgroup2, rules.slice(1))
      }];
    }
    return [result];
  }
  function flattenLayout(layers) {
    var maxDepth = d3.max(layers, function (l) {
      return l.depth;
    });
    var childrenNodes = layers.filter(function (l) {
      return l.depth === maxDepth;
    });
    childrenNodes.sort(function (a, b) {
      return a.x - b.x;
    });
    var result = [];
    var _loop = function _loop() {
      var c = _step3.value;
      var childData = c.data.map(function (d) {
        d.isRule = c.isRule;
        return d;
      });
      childData.sort(function (a, b) {
        return a._uuid - b._uuid;
      });
      result = result.concat(childData);
    };
    for (var _iterator3 = _createForOfIteratorHelperLoose(childrenNodes), _step3; !(_step3 = _iterator3()).done;) {
      _loop();
    }
    return result;
  }
  (0, _react.useEffect)(function () {
    var newLayers = getLayers(data, rules, true);
    setLayers(newLayers);
  }, [data, rules]);
  (0, _react.useEffect)(function () {
    if (layers.length > 0 && layers[0].data.length > 0 && layers[0].data.length < 10000) {
      var dragUpdated = function dragUpdated(e, d) {
        var changeX = e.dx;
        var el = d3.select(this);
        var elX = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);
        var newX = elX + changeX;
        if (newX < 0) {
          newX = 0;
        }
        if (newX + maxBrushWidth > cols * scale) {
          newX = layout.width - layout.margin * 2 - maxBrushWidth;
        }
        el.attr("transform", "translate(" + newX + ", 0)");
      };
      var dragEnd = function dragEnd(e, d) {
        var el = d3.select(this);
        var xStart = parseFloat(el.attr("transform").split(/[\s,()]+/)[1]);
        var niceX = Math.round(xStart / scale) * scale;
        el.attr("transform", "translate(" + niceX + ", 0)");
        var xEnd = niceX + maxBrushWidth;
        var selectedItems = units.filter(function (u, i) {
          var ux = Math.floor(i / rows) * scale + layout.margin;
          return ux >= xStart && ux + scale - 1 <= xEnd;
        }).data();
        selectedItems = selectedItems.map(function (s) {
          return s[_index];
        });
        var startIndex = niceX / scale * rows;
        var endIndex = maxBrushWidth / scale * rows + startIndex;
        endIndex = endIndex > layers[0].data.length ? layers[0].data.length : endIndex;
        d3.select(refShow.current).html("Showing items " + startIndex + " to " + endIndex);
        setIndices(selectedItems);
      };
      // Define unit vis svg
      var svgUnit = d3.select(refUnit.current);

      // Define icicle vis svg
      var svgIcicle = d3.select(refIcicle.current);

      // Get rows and cols needed for unit vis
      var _getLayout = getLayout(layers[0].data.length, 300),
        rows = _getLayout[0],
        cols = _getLayout[1];

      // Calculate svg width/height for unit vis
      layout.height = rows * scale + layout.margin * 2;
      layout.width = cols * scale + layout.margin * 2;
      d3.select(refSubset.current).style("min-width", layout.width + 250 + "px");
      svgUnit.attr("height", layout.height).attr("width", layout.width);

      // Create icicle bar for base layer
      var icicleLayout = [];
      icicleLayout.push({
        "x": 0,
        "y": 0,
        "width": layout.width - layout.margin * 2,
        "height": icicleHeight,
        "attribute": layers[0].attribute,
        "label": layers[0].label,
        "depth": 0,
        "data": layers[0].data,
        "isRule": layers[0].isRule
      });

      // Get layout for icicle plot
      icicleLayout = icicleLayout.concat(layoutIcicle(layers[0].children, layers[0].data.length, layout.width - layout.margin * 2, 0, 1, layout.margin));

      // Get the number of items in the selected group
      var _getSelectionSize = getSelectionSize(icicleLayout),
        selection = _getSelectionSize[0],
        selectionSize = _getSelectionSize[1];
      setSubset(selection.map(function (s) {
        return s[_index];
      }));
      d3.select(refStats.current).html("<span style=\"background-color:steelblue; color:white;\">" + ("&nbsp;" + selectionSize + "&nbsp;") + "</span><span style=\"color:steelblue;\"></span>&nbsp;of " + data.length + " total items in current subset");
      var unitData = flattenLayout(icicleLayout);

      // Plot unit vis
      var unitLayer = svgUnit.select("#units");
      var units = unitLayer.selectAll(".units").data(unitData).join("rect").attr("class", "units").attr("x", function (d, i) {
        return Math.floor(i / rows) * scale + layout.margin;
      }).attr("y", function (d, i) {
        return (i - Math.floor(i / rows) * rows) * scale + layout.margin;
      }).attr("width", scale - 1).attr("height", scale - 1).attr("fill", "steelblue").attr("opacity", function (d) {
        return d.isRule ? 1 : 0.25;
      });

      // Plot icicle plot
      svgIcicle.attr("height", d3.max(icicleLayout, function (d) {
        return d.depth + 1;
      }) * icicleHeight + layout.margin * 2).attr("width", layout.width);
      var icicleLayer = svgIcicle.select("#icicles");
      icicleLayer.selectAll(".icicles").data(icicleLayout).join("rect").attr("class", "icicles").attr("fill", "steelblue").attr("opacity", function (d, i) {
        return d.isRule ? 1 : 0.25;
      }).attr("x", function (d) {
        return d.x + layout.margin;
      }).attr("y", function (d) {
        return d.y + layout.margin;
      }).attr("width", function (d) {
        return d.width > 2 ? d.width - 2 : 0;
      }).attr("height", function (d) {
        return d.height - 1;
      }).style("cursor", "pointer").on("click", function (e, d) {
        if (d.attribute === "All") {
          return;
        } else if (d.attribute === base) {
          setBase("All");
          var newLayers = getLayers(data, rules, true);
          setLayers(newLayers);
          d3.select(refFilter.current).style("display", "block");
          return;
        } else if (d.attribute != base) {
          setBase(d.attribute);
          var slicedRules = [[]];
          var subsetData = d.data;
          for (var r = 0; r < rules.length; r++) {
            var ruleAttribute = rules[r][0];
            if (ruleAttribute === d.attribute) {
              slicedRules = rules.slice(r);
            }
          }
          var _newLayers = getLayers(subsetData, slicedRules, d.isRule).filter(function (l) {
            return l.data.length > 0;
          });
          setLayers(_newLayers);
          d3.select(refFilter.current).style("display", "none");
        }
      });
      var icicleLabels = svgIcicle.select("#icicleLabels");
      icicleLabels.selectAll(".icicleLabel").data(icicleLayout).join("text").attr("class", "icicleLabel").text(function (d) {
        var labelWithCount = d.label + " [" + d.data.length + "]";
        var estimateWidth = labelWithCount.length * 12;
        if (d.width <= 3 * 12) {
          return "";
        } else if (estimateWidth > d.width) {
          var extra = (estimateWidth - d.width) / 12;
          var truncate = labelWithCount.slice(0, labelWithCount.length - 3 - extra);
          return truncate + "...";
        } else {
          return "" + labelWithCount;
        }
      }).attr("text-anchor", "start").attr("alignment-baseline", "middle").attr("x", function (d) {
        return d.x + layout.margin + 8;
      }).attr("y", function (d) {
        return d.y + icicleHeight / 2 + 1;
      }).attr("fill", function (d, i) {
        return d.isRule ? "white" : "black";
      }).attr("font-family", "sans-serif").attr("font-weight", 300).style("cursor", "default");
      var maxBrushWidth = Math.ceil(50 / rows) * scale;
      var startIndex = 0;
      var endIndex = maxBrushWidth / scale * rows + startIndex;
      var selectedItems = units.filter(function (u, i) {
        return i >= startIndex && i <= endIndex;
      }).data();
      selectedItems = selectedItems.map(function (s) {
        return s[_index];
      });
      setIndices(selectedItems);
      d3.select(refShow.current).html("Showing items " + startIndex + " to " + endIndex);
      var drag = d3.drag().on("drag", dragUpdated).on("end", dragEnd);
      svgUnit.selectAll("#brushRect").data([1]).join("rect").attr("id", "brushRect").attr("x", layout.margin).attr("y", 0).attr("transform", "translate(0, 0)").attr("width", maxBrushWidth).attr("height", layout.height).attr("fill", "black").attr("opacity", "0.2").style("cursor", "move").call(drag);
    } else if (layers.length > 0 && layers[0].data.length >= 10000) {
      // Define unit vis svg
      d3.select(refUnit.current).select("#units").selectAll("*").remove();
      d3.select(refUnit.current).selectAll("#brushRect").remove();

      // Define icicle vis svg
      var _svgIcicle = d3.select(refIcicle.current);
      d3.select(refSubset.current).style("min-width", layout.width + 250 + "px");

      // Create icicle bar for base layer
      var _icicleLayout = [];
      _icicleLayout.push({
        "x": 0,
        "y": 0,
        "width": layout.width - layout.margin * 2,
        "height": icicleHeight,
        "attribute": layers[0].attribute,
        "label": layers[0].label,
        "depth": 0,
        "data": layers[0].data,
        "isRule": layers[0].isRule
      });

      // Get layout for icicle plot
      _icicleLayout = _icicleLayout.concat(layoutIcicle(layers[0].children, layers[0].data.length, layout.width - layout.margin * 2, 0, 1, layout.margin));

      // Get the number of items in the selected group
      var _getSelectionSize2 = getSelectionSize(_icicleLayout),
        _selection = _getSelectionSize2[0],
        _selectionSize = _getSelectionSize2[1];
      setSubset(_selection);
      setSubset(_selection.map(function (s) {
        return s[_index];
      }));
      d3.select(refStats.current).html("<span style=\"background-color:steelblue; color:white;\">" + ("&nbsp;" + _selectionSize + "&nbsp;") + "</span><span style=\"color:steelblue;\"></span>&nbsp;of " + data.length + " total items in current subset");

      // Plot icicle plot
      _svgIcicle.attr("height", d3.max(_icicleLayout, function (d) {
        return d.depth + 1;
      }) * icicleHeight + layout.margin * 2).attr("width", layout.width);
      var _icicleLayer = _svgIcicle.select("#icicles");
      _icicleLayer.selectAll(".icicles").data(_icicleLayout).join("rect").attr("class", "icicles").attr("fill", "steelblue").attr("opacity", function (d, i) {
        return d.isRule ? 1 : 0.25;
      }).attr("x", function (d) {
        return d.x + layout.margin;
      }).attr("y", function (d) {
        return d.y + layout.margin;
      }).attr("width", function (d) {
        return d.width > 2 ? d.width - 2 : 0;
      }).attr("height", function (d) {
        return d.height - 1;
      }).style("cursor", "pointer").on("click", function (e, d) {
        if (d.attribute === "All") {
          return;
        } else if (d.attribute === base) {
          setBase("All");
          var newLayers = getLayers(data, rules, true);
          setLayers(newLayers);
          d3.select(refFilter.current).style("display", "block");
          return;
        } else if (d.attribute != base) {
          setBase(d.attribute);
          var slicedRules = [[]];
          var subsetData = d.data;
          for (var r = 0; r < rules.length; r++) {
            var ruleAttribute = rules[r][0];
            if (ruleAttribute === d.attribute) {
              slicedRules = rules.slice(r);
            }
          }
          var _newLayers2 = getLayers(subsetData, slicedRules, d.isRule).filter(function (l) {
            return l.data.length > 0;
          });
          setLayers(_newLayers2);
          d3.select(refFilter.current).style("display", "none");
        }
      });
      var _icicleLabels = _svgIcicle.select("#icicleLabels");
      _icicleLabels.selectAll(".icicleLabel").data(_icicleLayout).join("text").attr("class", "icicleLabel").text(function (d) {
        var labelWithCount = d.label + " [" + d.data.length + "]";
        var estimateWidth = labelWithCount.length * 12;
        if (d.width <= 3 * 12) {
          return "";
        } else if (estimateWidth > d.width) {
          var extra = (estimateWidth - d.width) / 12;
          var truncate = labelWithCount.slice(0, labelWithCount.length - 3 - extra);
          return truncate + "...";
        } else {
          return "" + labelWithCount;
        }
      }).attr("text-anchor", "start").attr("alignment-baseline", "middle").attr("x", function (d) {
        return d.x + layout.margin + 8;
      }).attr("y", function (d) {
        return d.y + icicleHeight / 2 + 1;
      }).attr("fill", function (d, i) {
        return d.isRule ? "white" : "black";
      }).attr("font-family", "sans-serif").attr("font-weight", 300).style("cursor", "default");
    }
  }, [layers]);
  function handleRules(extent) {
    var attr = extent[0];
    for (var i = 0; i < rules.length; i++) {
      var ruleAttr = rules[i][0];
      if (ruleAttr === attr) {
        rules[i] = extent;
        var _newRules = [].concat(rules);
        setRules(_newRules);
        return;
      }
    }
    var newRules = [].concat(rules, [extent]);
    setRules(newRules);
    return;
  }
  function deleteRule(attr) {
    for (var i = 0; i < rules.length; i++) {
      var ruleAttr = rules[i][0];
      if (ruleAttr === attr) {
        var newRules = rules.slice(0, i).concat(rules.slice(i + 1));
        setRules(newRules);
      }
    }
  }
  var containerStyle = {
    "display": "flex",
    "flexDirection": "column",
    "margin": "10px 0px"
  };

  // let tooltipStyle = {"background": "white",
  // 					"fontFamily": "sans-serif",
  // 					"padding": "10px 20px",
  // 					"border": "solid black 1px",
  // 					"borderRadius": "3px",
  // 					"visibility": "hidden"};

  var subsetContainer = {
    "display": "flex"
  };
  var statsContainerStyle = {
    "padding": layout.margin,
    "fontFamily": "sans-serif"
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    ref: refContainer,
    style: containerStyle
  }, /*#__PURE__*/_react["default"].createElement("div", {
    style: subsetContainer,
    ref: refSubset
  }, /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refIcicle
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "icicles"
  }), /*#__PURE__*/_react["default"].createElement("g", {
    id: "icicleLabels"
  })), /*#__PURE__*/_react["default"].createElement("div", {
    ref: refFilter
  }, /*#__PURE__*/_react["default"].createElement(_SubsetFilter.SubsetFilter, {
    data: data,
    handleRules: handleRules,
    deleteRule: deleteRule
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    style: statsContainerStyle
  }, /*#__PURE__*/_react["default"].createElement("div", {
    ref: refStats
  }), /*#__PURE__*/_react["default"].createElement("div", {
    ref: refShow
  })), /*#__PURE__*/_react["default"].createElement("svg", {
    ref: refUnit
  }, /*#__PURE__*/_react["default"].createElement("g", {
    id: "units"
  })));
};
exports.SubsetVis = SubsetVis;