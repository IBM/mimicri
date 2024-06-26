import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
export var SummaryColors = function SummaryColors(_ref) {
  var selectedColors = _ref.selectedColors,
    extents = _ref.extents,
    segMap = _ref.segMap,
    frame = _ref.frame;
  var refColors = useRef("ColorsVis");
  var layout = {
    "height": 300,
    "width": 300,
    "marginTop": 10,
    "marginRight": 10,
    "marginBottom": 30,
    "marginLeft": 30
  };
  var colorScale = d3.scaleSequential(d3.interpolateGreys);
  useEffect(function () {
    var binCount = 11;
    var histogramMargin = 30;
    if (selectedColors.length > 0) {
      var histogramHeight = (layout.height - layout.marginTop - layout.marginBottom) / Object.keys(segMap).length;
      var svgColors = d3.select(refColors.current).attr("width", layout.width).attr("height", layout.height);
      svgColors.select("#title").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("transform", "translate(" + (layout.width / 2 + 10) + ", " + (layout.height - 10) + ")");
      svgColors.selectAll(".groups").data(Object.keys(segMap)).join("g").attr("class", "groups").attr("id", function (d, i) {
        return "group" + d;
      }).attr("transform", function (d, i) {
        return "translate(" + 0 + ", " + i * histogramHeight + ")";
      });
      var _loop = function _loop() {
        var s = Object.keys(segMap)[si];
        var allColors = selectedColors.map(function (c) {
          return c[s];
        });
        allColors = allColors.flat(1);
        var xScale = d3.scaleLinear().domain(extents[s]).range([layout.marginLeft, layout.width - layout.marginRight]).nice();
        var histogram = d3.bin().domain(xScale.domain()).thresholds(binCount).value(function (a) {
          return a;
        });
        var cBins = histogram(allColors);
        var yScale = d3.scaleLinear().domain(d3.extent(cBins, function (d) {
          return d.length;
        })).range([0, histogramHeight - histogramMargin]);
        var segGroup = svgColors.select("#group" + s);
        colorScale.domain(extents[s]);
        segGroup.selectAll(".rect").data(cBins).join("rect").attr("class", "rect").attr("x", function (d) {
          return xScale(d.x0);
        }).attr("y", function (d) {
          return histogramHeight - yScale(d.length);
        }).attr("width", function (d) {
          return xScale(d.x1) - xScale(d.x0) - 1;
        }).attr("height", function (d) {
          return yScale(d.length);
        }).attr("fill", function (d) {
          return colorScale(d3.median(d));
        });
        segGroup.selectAll("#xAxis").data([s]).join("g").attr("id", "xAxis").attr("transform", "translate(" + 0 + ", " + histogramHeight + ")").call(d3.axisBottom(xScale).ticks(5).tickSize(3));
      };
      for (var si = 0; si < Object.keys(segMap).length; si++) {
        _loop();
      }
    }
  }, [selectedColors, segMap, extents]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    ref: refColors
  }, /*#__PURE__*/React.createElement("g", {
    id: "xAxis"
  }), /*#__PURE__*/React.createElement("g", {
    id: "yAxis"
  }), /*#__PURE__*/React.createElement("text", {
    id: "title"
  }, "color distribution")));
};