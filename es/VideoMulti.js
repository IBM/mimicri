function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as THREE from 'three';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// images and overlays should be in format of [[timeframe1: patient1, patient2, patient3, ...], [timeframe2], [timeframe3], ...]
export var VideoMulti = function VideoMulti(_ref) {
  var _ref$images = _ref.images,
    images = _ref$images === void 0 ? [] : _ref$images,
    _ref$overlays = _ref.overlays,
    overlays = _ref$overlays === void 0 ? [] : _ref$overlays,
    _ref$scale = _ref.scale,
    scale = _ref$scale === void 0 ? 4 : _ref$scale;
  var visibleRef = useRef('visible_ref');
  var hideRef = useRef('hide_ref');
  var playRef = useRef('play_ref');
  var stopRef = useRef('stop_ref');
  var controlsRef = useRef('controls_ref');
  var ref = useRef('threejs_videomulti');
  var requestRef = React.useRef(-1);
  var frame = useRef(0);
  var fps = 20;
  var cols = 7;
  var padding = 2.5;
  var _useState = useState(true),
    showImgOverlay = _useState[0],
    setShowImgOverlay = _useState[1];
  var _useState2 = useState(true),
    play = _useState2[0],
    setPlay = _useState2[1];
  var scene = useRef(new THREE.Scene());
  scene.current.background = new THREE.Color(0xffffff);
  var camera = useRef(new THREE.PerspectiveCamera());
  var renderer = useRef(new THREE.WebGLRenderer());
  var geometry = useRef(new THREE.BufferGeometry());
  var overlayGeometry = useRef(new THREE.BufferGeometry());
  var pointsMaterial = useRef(new THREE.PointsMaterial());
  var newOverlayMaterial = useRef(new THREE.PointsMaterial());
  var fpsInterval = 1000 / fps;
  var then = Date.now();
  var startTime = then;
  var color = new THREE.Color();
  var segmentColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  function preprocess(image, imageMeta, layout, colorScale, imageCol, imageRow, isOverlay) {
    if (isOverlay === void 0) {
      isOverlay = false;
    }
    var minX = -Math.floor(layout.width / 2);
    var minY = -Math.floor(layout.height / 2);
    var result = [];
    for (var x = 0; x < imageMeta.width; x++) {
      for (var y = 0; y < imageMeta.height; y++) {
        if (isOverlay && image[y][x] == 0.0) {
          continue;
        }
        var position = [minX + (x + imageCol * (imageMeta.width + padding)) * scale, minY + layout.height - imageRow * (imageMeta.height + padding) * scale - imageMeta.height * scale + y * scale];
        var value = image[y][x];
        var _color = colorScale(image[y][x]);
        var dataPoint = {
          "position": position,
          "value": value,
          "color": _color
        };
        result.push(dataPoint);
      }
    }
    return result;
  }
  useEffect(function () {
    // svgElement = d3.select(ref.current);
    ref.current.appendChild(renderer.current.domElement);
    d3.select(hideRef.current).style("display", "flex").style("margin-top", "10px").style("margin-left", "auto");
    d3.select(visibleRef.current).style("display", "none").style("margin-top", "10px").style("margin-left", "auto");
    d3.select(stopRef.current).style("display", "flex").style("height", "40px");
    d3.select(playRef.current).style("display", "none").style("height", "40px");
    d3.select(controlsRef.current).style("display", "flex").style("align-items", "center");
    return function () {
      renderer.current.dispose();
      geometry.current.dispose();
      overlayGeometry.current.dispose();
      pointsMaterial.current.dispose();
      newOverlayMaterial.current.dispose();
    };
  }, []);
  useEffect(function () {
    var frameCount = images.length;
    if (frameCount > 0) {
      // Three.js render loop
      var animate = function animate() {
        requestRef.current = requestAnimationFrame(animate);
        var now = Date.now();
        var elapsed = now - then;
        if (elapsed > fpsInterval) {
          then = now - elapsed % fpsInterval;
          if (play) {
            frame.current = frame.current + 1;
            if (frame.current >= frameCount) {
              frame.current = frame.current - frameCount;
            }
          } else {
            cancelAnimationFrame(requestRef.current);
            if (!showImgOverlay) {
              scene.current.remove(scene.current.getObjectByName("overlay"));
            }
            var _overlay;
            if (overlays.length > 0) {
              _overlay = overlays[frame.current];
            }
            if (showImgOverlay && _overlay) {
              var newOverlayColors = [];
              var newOverlayPositions = [];
              scene.current.remove(scene.current.getObjectByName("overlay"));
              for (var i = 0; i < _overlay.length; i++) {
                var image = _overlay[i];
                var imageRow = Math.floor(i / cols);
                var imageCol = i - imageRow * cols;
                var flatten = image.flat();
                var extent = d3.extent(flatten);
                var flatImage = preprocess(image, imageMeta, layout, segmentColorScale, imageCol, imageRow, true);

                // const color = new THREE.Color();

                for (var _iterator = _createForOfIteratorHelperLoose(flatImage), _step; !(_step = _iterator()).done;) {
                  var p = _step.value;
                  newOverlayPositions.push(p.position[0], p.position[1], 0.00001);
                  color.set(p.color);
                  newOverlayColors.push(color.r, color.g, color.b);
                }
              }
              overlayGeometry.current.dispose();
              overlayGeometry.current = new THREE.BufferGeometry();
              overlayGeometry.current.setAttribute("position", new THREE.Float32BufferAttribute(newOverlayPositions, 3));
              overlayGeometry.current.setAttribute("color", new THREE.Float32BufferAttribute(newOverlayColors, 3));
              newOverlayMaterial.current.dispose();
              newOverlayMaterial.current = new THREE.PointsMaterial({
                // map: spriteMap,
                size: scale,
                // transparent: true,
                // blending: THREE.AdditiveBlending,
                sizeAttenuation: false,
                vertexColors: true
              });
              var overlayPoints = new THREE.Points(overlayGeometry.current, newOverlayMaterial.current);
              overlayPoints.name = "overlay";
              scene.current.add(overlayPoints);
            }
            renderer.current.render(scene.current, camera.current);
            return;
          }
          var frameImages = images[frame.current];
          var overlay;
          if (overlays.length > 0) {
            overlay = overlays[frame.current];
          }
          var colors = [];
          var positions = [];
          geometry.current = new THREE.BufferGeometry();
          for (var _i = 0; _i < frameImages.length; _i++) {
            var _image = frameImages[_i];
            var _imageRow = Math.floor(_i / cols);
            var _imageCol = _i - _imageRow * cols;
            var _flatten = _image.flat();
            var _extent = d3.extent(_flatten);
            var colorScale = d3.scaleSequential(d3.interpolateGreys).domain([_extent[1], _extent[0]]);
            var _flatImage = preprocess(_image, imageMeta, layout, colorScale, _imageCol, _imageRow);

            // const color = new THREE.Color();

            for (var _iterator2 = _createForOfIteratorHelperLoose(_flatImage), _step2; !(_step2 = _iterator2()).done;) {
              var _p = _step2.value;
              positions.push(_p.position[0], _p.position[1], 0);
              color.set(_p.color);
              colors.push(color.r, color.g, color.b);
            }
          }
          geometry.current.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
          geometry.current.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
          pointsMaterial.current.dispose();
          pointsMaterial.current = new THREE.PointsMaterial({
            // map: spriteMap,
            size: scale,
            // transparent: true,
            // blending: THREE.AdditiveBlending,
            sizeAttenuation: false,
            vertexColors: true
          });
          var points = new THREE.Points(geometry.current, pointsMaterial.current);
          points.name = "points";
          scene.current.add(points);
          if (!showImgOverlay) {
            scene.current.remove(scene.current.getObjectByName("overlay"));
          }
          if (showImgOverlay && overlay) {
            var _newOverlayColors = [];
            var _newOverlayPositions = [];
            scene.current.remove(scene.current.getObjectByName("overlay"));
            for (var _i2 = 0; _i2 < overlay.length; _i2++) {
              var _image2 = overlay[_i2];
              var _imageRow2 = Math.floor(_i2 / cols);
              var _imageCol2 = _i2 - _imageRow2 * cols;
              var _flatten2 = _image2.flat();
              var _extent2 = d3.extent(_flatten2);
              var _flatImage2 = preprocess(_image2, imageMeta, layout, segmentColorScale, _imageCol2, _imageRow2, true);

              // const color = new THREE.Color();

              for (var _iterator3 = _createForOfIteratorHelperLoose(_flatImage2), _step3; !(_step3 = _iterator3()).done;) {
                var _p2 = _step3.value;
                _newOverlayPositions.push(_p2.position[0], _p2.position[1], 0.00001);
                color.set(_p2.color);
                _newOverlayColors.push(color.r, color.g, color.b);
              }
            }
            overlayGeometry.current.dispose();
            overlayGeometry.current = new THREE.BufferGeometry();
            overlayGeometry.current.setAttribute("position", new THREE.Float32BufferAttribute(_newOverlayPositions, 3));
            overlayGeometry.current.setAttribute("color", new THREE.Float32BufferAttribute(_newOverlayColors, 3));
            newOverlayMaterial.current.dispose();
            newOverlayMaterial.current = new THREE.PointsMaterial({
              // map: spriteMap,
              size: scale,
              // transparent: true,
              // blending: THREE.AdditiveBlending,
              sizeAttenuation: false,
              vertexColors: true
            });
            var _overlayPoints = new THREE.Points(overlayGeometry.current, newOverlayMaterial.current);
            _overlayPoints.name = "overlay";
            scene.current.add(_overlayPoints);
          }
          renderer.current.render(scene.current, camera.current);
        }
      };
      renderer.current.dispose();
      scene.current.remove(scene.current.getObjectByName("points"));
      geometry.current.dispose();
      cancelAnimationFrame(requestRef.current);
      var firstImage = images[0][0];
      var imageWidth = firstImage[0].length;
      var imageHeight = firstImage.length;
      var rows = Math.ceil(images.length / cols);
      var imageMeta = {
        "width": imageWidth,
        "height": imageHeight
      };
      var layout = {
        "width": imageMeta.width * scale * cols + (cols - 1) * padding * scale,
        "height": imageMeta.height * scale * rows + (rows - 1) * padding * scale
      };
      d3.select(controlsRef.current).style("width", layout.width + "px");
      var near_plane = 2;
      var far_plane = 100;

      // Set up camera and scene
      camera.current = new THREE.PerspectiveCamera(2 * Math.atan(layout.height / (2 * far_plane)) * (180 / Math.PI), layout.width / layout.height, near_plane, far_plane);
      camera.current.position.set(0, 0, far_plane);
      camera.current.lookAt(new THREE.Vector3(0, 0, 0));
      renderer.current.setSize(layout.width, layout.height);
      animate();
    }
  }, [images, overlays, showImgOverlay, play]);
  function stopVideo() {
    d3.select(playRef.current).style("display", "block");
    d3.select(stopRef.current).style("display", "none");
    setPlay(false);
  }
  function playVideo() {
    d3.select(stopRef.current).style("display", "block");
    d3.select(playRef.current).style("display", "none");
    setPlay(true);
  }
  function visibleOverlay() {
    d3.select(visibleRef.current).style("display", "none");
    d3.select(hideRef.current).style("display", "flex");
    setShowImgOverlay(true);
  }
  function hideOverlay() {
    d3.select(visibleRef.current).style("display", "flex");
    d3.select(hideRef.current).style("display", "none");
    setShowImgOverlay(false);
  }
  var containerStyle = {
    "marginLeft": "10px"
  };
  var multiStyle = {
    "height": "500px",
    "overflow": "scroll",
    "marginTop": padding + "px"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: containerStyle
  }, /*#__PURE__*/React.createElement("div", {
    id: "controls",
    ref: controlsRef
  }, /*#__PURE__*/React.createElement(IconButton, {
    ref: stopRef,
    id: "stopVideo",
    variant: "outlined",
    onClick: stopVideo
  }, /*#__PURE__*/React.createElement(Pause, null)), /*#__PURE__*/React.createElement(IconButton, {
    ref: playRef,
    id: "playVideo",
    onClick: playVideo
  }, /*#__PURE__*/React.createElement(PlayArrow, null)), /*#__PURE__*/React.createElement(Button, {
    ref: visibleRef,
    id: "visibleOverlay",
    startIcon: /*#__PURE__*/React.createElement(Visibility, null),
    onClick: visibleOverlay
  }, "Show Overlay"), /*#__PURE__*/React.createElement(Button, {
    ref: hideRef,
    id: "hiddenOverlay",
    startIcon: /*#__PURE__*/React.createElement(VisibilityOff, null),
    onClick: hideOverlay
  }, "Hide Overlay")), /*#__PURE__*/React.createElement("div", {
    style: multiStyle,
    id: "threejs_multi",
    ref: ref
  }));
};