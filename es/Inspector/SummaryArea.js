import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
export var SummaryArea = function SummaryArea(_ref) {
  var selectedAreas = _ref.selectedAreas,
    extents = _ref.extents,
    segMap = _ref.segMap;
  var refArea = useRef("Area");
  var layout = {
    "height": 300,
    "width": 300,
    "marginTop": 10,
    "marginRight": 10,
    "marginBottom": 30,
    "marginLeft": 30
  };
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  useEffect(function () {
    var binCount = 20;
    var histogramMargin = 30;
    if (selectedAreas.length > 0) {
      var histogramHeight = (layout.height - layout.marginTop - layout.marginBottom) / Object.keys(segMap).length;
      var svgAreas = d3.select(refArea.current).attr("width", layout.width).attr("height", layout.height);
      svgAreas.select("#title").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("transform", "translate(" + (layout.width / 2 + 10) + ", " + (layout.height - 10) + ")");
      svgAreas.selectAll(".groups").data(Object.keys(segMap)).join("g").attr("class", "groups").attr("id", function (d, i) {
        return "group" + d;
      }).attr("transform", function (d, i) {
        return "translate(" + 0 + ", " + i * histogramHeight + ")";
      });
      var _loop = function _loop() {
        var s = Object.keys(segMap)[si];
        var xScale = d3.scaleLinear().domain(extents[s]).range([layout.marginLeft, layout.width - layout.marginRight]).nice();
        var histogram = d3.bin().domain(xScale.domain()).thresholds(binCount).value(function (a) {
          return a[parseInt(s)];
        });
        var sBins = histogram(selectedAreas);
        var yScale = d3.scaleLinear().domain(d3.extent(sBins, function (d) {
          return d.length;
        })).range([0, histogramHeight - histogramMargin]);
        var segGroup = svgAreas.select("#group" + s);
        segGroup.selectAll(".rect").data(sBins).join("rect").attr("class", "rect").attr("x", function (d) {
          return xScale(d.x0);
        }).attr("y", function (d) {
          return histogramHeight - yScale(d.length);
        }).attr("width", function (d) {
          return xScale(d.x1) - xScale(d.x0) - 1;
        }).attr("height", function (d) {
          return yScale(d.length);
        }).attr("fill", segmentColorScale(parseInt(s)));
        segGroup.selectAll("#xAxis").data([s]).join("g").attr("id", "xAxis").attr("transform", "translate(" + 0 + ", " + histogramHeight + ")").call(d3.axisBottom(xScale).ticks(5).tickSize(3));
      };
      for (var si = 0; si < Object.keys(segMap).length; si++) {
        _loop();
      }
    }
  }, [selectedAreas, segMap, extents]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    ref: refArea
  }, /*#__PURE__*/React.createElement("g", {
    id: "xAxis"
  }), /*#__PURE__*/React.createElement("g", {
    id: "yAxis"
  }), /*#__PURE__*/React.createElement("text", {
    id: "title"
  }, "area distribution")));
};