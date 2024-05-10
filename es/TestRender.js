function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import * as THREE from 'three';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
export var TestRender = function TestRender(_ref) {
  var _ref$image = _ref.image,
    image = _ref$image === void 0 ? [] : _ref$image,
    overlay = _ref.overlay,
    _ref$scale = _ref.scale,
    scale = _ref$scale === void 0 ? 50 : _ref$scale,
    segmentColorScale = _ref.segmentColorScale;
  var ref = useRef('threejs_static');
  var requestRef = React.useRef(-1);
  var fps = 20;
  var _useState = useState(false),
    showImgOverlay = _useState[0],
    setShowImgOverlay = _useState[1];
  // let showImgOverlay = false;

  var svgElement;
  // let scene = new THREE.Scene();
  var camera = useRef(new THREE.PerspectiveCamera());
  var renderer = useRef(new THREE.WebGLRenderer());
  var scene = useRef(new THREE.Scene());
  scene.background = new THREE.Color(0xffffff);
  var geometry = useRef(new THREE.BufferGeometry());
  var fpsInterval = 1000 / fps;
  var then = Date.now();
  var startTime = then;

  // let overlayGeometry = new THREE.BufferGeometry();
  // const overlayPoints = useRef({});

  var color = new THREE.Color();
  var imageMeta = {
    "width": image && image[0] ? image[0].length : 0,
    "height": image && image.length ? image.length : 0
  };
  var layout = {
    "width": imageMeta.width * scale,
    "height": imageMeta.height * scale
  };
  function preprocess(image, imageMeta, colorScale, isOverlay) {
    if (isOverlay === void 0) {
      isOverlay = false;
    }
    var minX = -Math.floor(imageMeta.width / 2);
    var minY = -Math.floor(imageMeta.height / 2);
    var result = [];
    for (var x = 0; x < imageMeta.width; x++) {
      for (var y = 0; y < imageMeta.height; y++) {
        if (isOverlay && image[y][x] == 0.0) {
          continue;
        }
        var dataPoint = {
          "position": [(x + minX) * scale, (y + minY) * scale],
          "value": image[y][x],
          "color": colorScale(image[y][x])
        };
        result.push(dataPoint);
      }
    }
    return result;
  }
  useEffect(function () {
    // svgElement = d3.select();
    ref.current.appendChild(renderer.current.domElement);
    d3.select("#visibleOverlay").style("opacity", 0.26);
    d3.select("#hiddenOverlay").style("opacity", 1);
    return function () {
      renderer.current.dispose();
      geometry.current.dispose();
    };
  }, []);
  useEffect(function () {
    if (image.length > 0) {
      renderer.current.dispose();
      var frame = 0;
      imageMeta = {
        "width": image && image[0] ? image[0].length : 0,
        "height": image && image.length ? image.length : 0
      };
      layout = {
        "width": imageMeta.width * scale,
        "height": imageMeta.height * scale
      };
      d3.select("#controls").style("display", "flex").style("width", layout.width + "px");
      var near_plane = 2;
      var far_plane = 100;

      // Set up camera and scene
      camera.current = new THREE.PerspectiveCamera(2 * Math.atan(layout.height / (2 * far_plane)) * (180 / Math.PI), layout.width / layout.height, near_plane, far_plane);
      camera.current.position.set(0, 0, far_plane);
      camera.current.lookAt(new THREE.Vector3(0, 0, 0));
      renderer.current.setSize(layout.width, layout.height);
      var flatten = image.flat();
      var extent = d3.extent(flatten);
      var colorScale = d3.scaleSequential(d3.interpolateGreys).domain([extent[1], extent[0]]);
      var flatImage = preprocess(image, imageMeta, colorScale);
      var pointsMaterial;
      new THREE.BufferGeometry(), _readOnlyError("geometry");
      var colors = [];
      var positions = [];
      for (var _iterator = _createForOfIteratorHelperLoose(flatImage), _step; !(_step = _iterator()).done;) {
        var p = _step.value;
        positions.push(p.position[0], p.position[1], 0);
        color.set(p.color);
        colors.push(color.r, color.g, color.b);
      }
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      pointsMaterial = new THREE.PointsMaterial({
        // map: spriteMap,
        size: scale,
        // transparent: true,
        // blending: THREE.AdditiveBlending,
        sizeAttenuation: false,
        vertexColors: THREE.VertexColors
      });
      var points = new THREE.Points(geometry, pointsMaterial);
      scene.current.add(points);
    }
  }, [image]);
  useEffect(function () {
    cancelAnimationFrame(requestRef.current);
    // Three.js render loop
    function animate() {
      requestRef.current = requestAnimationFrame(animate);
      var now = Date.now();
      var elapsed = now - then;
      if (elapsed > fpsInterval) {
        then = now - elapsed % fpsInterval;
        if (!showImgOverlay) {
          scene.current.remove(scene.current.getObjectByName("overlay"));
        }
        if (showImgOverlay && overlay) {
          var flattenOverlay = overlay.flat();
          var extentOverlay = d3.extent(flattenOverlay);
          var newColorScaleOverlay = d3.scaleOrdinal(d3.schemeGnBu[5]).domain([extentOverlay[1], extentOverlay[0]]);
          var newFlatOverlay = preprocess(overlay, imageMeta, newColorScaleOverlay, true);
          scene.current.remove(scene.current.getObjectByName("overlay"));
          var newOverlayMaterial;
          var newOverlayColors = [];
          var newOverlayPositions = [];

          // const overlayColor = new THREE.Color();

          for (var _iterator2 = _createForOfIteratorHelperLoose(newFlatOverlay), _step2; !(_step2 = _iterator2()).done;) {
            var o = _step2.value;
            newOverlayPositions.push(o.position[0], o.position[1], 0.00001);
            color.set(o.color);
            newOverlayColors.push(color.r, color.g, color.b);
          }
          var overlayGeometry = new THREE.BufferGeometry();
          overlayGeometry.setAttribute("position", new THREE.Float32BufferAttribute(newOverlayPositions, 3));
          overlayGeometry.setAttribute("color", new THREE.Float32BufferAttribute(newOverlayColors, 3));
          newOverlayMaterial = new THREE.PointsMaterial({
            // map: spriteMap,
            size: scale,
            // transparent: true,
            // blending: THREE.AdditiveBlending,
            sizeAttenuation: false,
            vertexColors: THREE.VertexColors
          });
          var overlayPoints = new THREE.Points(overlayGeometry, newOverlayMaterial);
          overlayPoints.name = "overlay";
          scene.current.add(overlayPoints);
        }
        renderer.current.render(scene.current, camera.current);
      }
    }
    animate();
  }, [overlay, showImgOverlay]);
  function visibleOverlay() {
    d3.select("#visibleOverlay").style("opacity", 1);
    d3.select("#hiddenOverlay").style("opacity", 0.26);
    setShowImgOverlay(true);
    // showImgOverlay = true;
  }

  function hideOverlay() {
    d3.select("#visibleOverlay").style("opacity", 0.26);
    d3.select("#hiddenOverlay").style("opacity", 1);
    setShowImgOverlay(false);
    // showImgOverlay = false;
  }

  var overlayStyle = {
    "marginLeft": "auto"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "threejs_static",
    ref: ref
  }), /*#__PURE__*/React.createElement("div", {
    id: "controls"
  }, /*#__PURE__*/React.createElement(Button, {
    disabled: true,
    style: overlayStyle
  }, "Overlay"), /*#__PURE__*/React.createElement(IconButton, {
    id: "visibleOverlay",
    variant: "outlined",
    onClick: visibleOverlay
  }, /*#__PURE__*/React.createElement(Visibility, null)), /*#__PURE__*/React.createElement(IconButton, {
    id: "hiddenOverlay",
    onClick: hideOverlay
  }, /*#__PURE__*/React.createElement(VisibilityOff, null))));
};