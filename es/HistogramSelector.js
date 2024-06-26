import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
export var HistogramSelector = function HistogramSelector(_ref) {
  var _ref$layout = _ref.layout,
    layout = _ref$layout === void 0 ? {
      "height": 30,
      "width": 180,
      "margin": 12,
      "marginLeft": 10,
      "marginTop": 3
    } : _ref$layout,
    _ref$attr = _ref.attr,
    attr = _ref$attr === void 0 ? "" : _ref$attr,
    _ref$values = _ref.values,
    values = _ref$values === void 0 ? [] : _ref$values,
    _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    handleSelection = _ref.handleSelection,
    selection = _ref.selection,
    handleChangeComplete = _ref.handleChangeComplete,
    updateSelectors = _ref.updateSelectors;
  // const [selected, setSelected] = useState([0, 0])

  var bins = 12;
  var ref = useRef("svgHistogram");
  var filterRef = useRef("filterRef");
  var deleteRef = useRef("deleteButton");
  function getTicks(n) {
    if (n <= 5) {
      return n;
    }
    while (n > 5) {
      n = Math.floor(n / 2);
    }
    return n;
  }
  function formatTick(n) {
    var formatted = d3.format(".2~r")(n);
    if (formatted === "NaN") {
      return n;
    }
    return formatted;
  }
  useEffect(function () {
    d3.select(deleteRef.current).style("visibility", "hidden");
    d3.select(filterRef.current).on("mouseover", function () {
      d3.select(deleteRef.current).style("visibility", "visible");
    }).on("mouseout", function () {
      d3.select(deleteRef.current).style("visibility", "hidden");
    });
  }, []);
  useEffect(function () {
    var svgContainer = d3.select(ref.current);
    var svg = svgContainer.select("svg");
    if (values.length === 0 || values[0] === undefined) {
      svgContainer.style("display", "none");
      return;
    }
    if (values.length < 20) {
      svgContainer.style("display", "flex");
      var filteredData = data.filter(function (d) {
        return d[attr] != '';
      });
      var _histogramBins = d3.groups(filteredData, function (d) {
        return parseFloat(d[attr]);
      });
      var xScale = d3.scaleBand().domain(_histogramBins.map(function (b) {
        return b[0];
      }).sort(function (a, b) {
        return a - b;
      })).range([layout.marginLeft, layout.width - layout.margin]);
      var yScale = d3.scaleLinear().domain([0, d3.max(_histogramBins, function (b) {
        return b[1].length;
      })]).range([layout.height - layout.margin, layout.marginTop]);
      svg.selectAll(".bars").data(_histogramBins).join("rect").attr("class", "bars").attr("x", function (d) {
        return xScale(d[0]);
      }).attr("y", function (d) {
        return yScale(d[1].length);
      }).attr("width", function (d) {
        return xScale.bandwidth() - 1;
      }).attr("height", function (d) {
        return yScale(0) - yScale(d[1].length);
      }).attr("fill", "steelblue");
      svg.select("#x-axis").attr("transform", "translate(0, " + (layout.height - layout.margin) + ")").call(d3.axisBottom(xScale).tickSize(0).ticks(getTicks(values.length)).tickFormat(formatTick));
    } else {
      svgContainer.style("display", "flex");
      var histogram = d3.bin().value(function (d) {
        return parseFloat(d[attr]);
      }).domain(d3.extent(values)).thresholds(bins);
      var _filteredData = data.filter(function (d) {
        return d[attr] != '';
      });
      var histogramBins = histogram(_filteredData);
      var _xScale = d3.scaleLinear().domain([d3.min(histogramBins, function (b) {
        return b.x0;
      }), d3.max(histogramBins, function (b) {
        return b.x1;
      })]).range([layout.marginLeft, layout.width - layout.margin]);
      var _yScale = d3.scaleLinear().domain([0, d3.max(histogramBins, function (b) {
        return b.length;
      })]).range([layout.height - layout.margin, layout.marginTop]);
      svg.selectAll(".bars").data(histogramBins).join("rect").attr("class", "bars").attr("x", function (d) {
        return _xScale(d.x0);
      }).attr("y", function (d) {
        return _yScale(d.length);
      }).attr("width", function (d) {
        return _xScale(d.x1) - _xScale(d.x0) - 1;
      }).attr("height", function (d) {
        return _yScale(0) - _yScale(d.length);
      }).attr("fill", "steelblue");
      svg.select("#x-axis").attr("transform", "translate(0, " + (layout.height - layout.margin) + ")").call(d3.axisBottom(_xScale).tickSize(0).ticks(getTicks(values.length)).tickFormat(formatTick));
    }
  }, [data, values, attr]);
  useEffect(function () {
    var svgContainer = d3.select(ref.current);
    var svg = svgContainer.select("svg");
    svg.selectAll(".bars").attr("opacity", function (d) {
      if (values.length < 20) {
        // if (attr.startsWith("own_or")) {
        // 	console.log(d, selection, parseFloat(d[0]), parseFloat(d[0]) >= selection[0] && parseFloat(d[0]) <= selection[1])
        // }
        return parseFloat(d[0]) >= selection[0] && parseFloat(d[0]) <= selection[1] ? 1.0 : 0.25;
      } else {
        return d.x0 >= selection[0] && d.x1 <= selection[1] ? 1.0 : 0.25;
      }
    });
  }, [selection]);
  function handleChange(e, v) {
    handleSelection(attr, v);
  }
  function valuetext(v) {
    return v;
  }
  var filterStyle = {
    "display": "flex",
    "alignItems": "center"
  };
  var emptyTitleStyle = {
    "marginBottom": "0px",
    "fontSize": "12px",
    "fontFamily": "sans-serif",
    "color": "red"
  };
  var titleStyle = {
    "margin": "2px 0px 0px " + layout.margin + "px",
    "fontSize": "12px",
    "fontFamily": "sans-serif",
    "width": layout.width,
    "overflow": "hidden"
  };
  var containerStyle = {
    "display": "flex",
    "flexDirection": "column",
    "padding": "0px"
  };
  var sliderStyle = {
    "width": layout.width - layout.margin - layout.marginLeft,
    "marginLeft": layout.marginLeft + "px",
    "padding": "0px",
    "position": "absolute",
    "top": layout.height - layout.margin,
    "left": "0px",
    ".MuiSlider-thumb": {
      "width": "10px",
      "height": "10px",
      "color": "white",
      "border": "solid 2px steelblue"
    }
  };
  var histogramSelectorStyle = {
    "position": "relative"
  };
  var deleteButtonStyle = {
    "visibility": "hidden"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: filterStyle,
    ref: filterRef
  }, /*#__PURE__*/React.createElement("div", {
    style: containerStyle,
    ref: ref
  }, /*#__PURE__*/React.createElement("p", {
    style: titleStyle
  }, attr), /*#__PURE__*/React.createElement("div", {
    style: histogramSelectorStyle
  }, /*#__PURE__*/React.createElement(Slider, {
    sx: sliderStyle,
    getAriaLabel: function getAriaLabel() {
      return attr;
    },
    value: selection,
    onChange: function onChange(e, v) {
      return handleSelection(attr, v);
    },
    onChangeCommitted: function onChangeCommitted(e, v) {
      return handleChangeComplete(attr, v);
    },
    valueLabelDisplay: "auto",
    getAriaValueText: valuetext,
    min: isNaN(Math.min.apply(Math, values)) ? 0 : Math.min.apply(Math, values),
    max: isNaN(Math.max.apply(Math, values)) ? 0 : Math.max.apply(Math, values),
    size: "small"
  }), /*#__PURE__*/React.createElement("svg", {
    width: layout.width,
    height: layout.height
  }, /*#__PURE__*/React.createElement("g", {
    id: "x-axis"
  })))), /*#__PURE__*/React.createElement(IconButton, {
    ref: deleteRef,
    onClick: function onClick() {
      return updateSelectors(attr);
    },
    "aria-label": "delete"
  }, /*#__PURE__*/React.createElement(ClearIcon, null)));
};