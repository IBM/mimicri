"use strict";

exports.__esModule = true;
exports.FrameMulti = void 0;
var _react = _interopRequireWildcard(require("react"));
var d3 = _interopRequireWildcard(require("d3"));
var THREE = _interopRequireWildcard(require("three"));
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _IconButton = _interopRequireDefault(require("@mui/material/IconButton"));
var _Visibility = _interopRequireDefault(require("@mui/icons-material/Visibility"));
var _VisibilityOff = _interopRequireDefault(require("@mui/icons-material/VisibilityOff"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var FrameMulti = function FrameMulti(_ref) {
  var _ref$images = _ref.images,
    images = _ref$images === void 0 ? [] : _ref$images,
    _ref$overlays = _ref.overlays,
    overlays = _ref$overlays === void 0 ? [] : _ref$overlays,
    _ref$scale = _ref.scale,
    scale = _ref$scale === void 0 ? 1 : _ref$scale;
  var visibleRef = (0, _react.useRef)('visible_ref');
  var hideRef = (0, _react.useRef)('hide_ref');
  var controlsRef = (0, _react.useRef)('controls_ref');
  var ref = (0, _react.useRef)('threejs_multi');
  var cols = 7;
  var padding = 10;
  var _useState = (0, _react.useState)(true),
    showImgOverlay = _useState[0],
    setShowImgOverlay = _useState[1];
  var scene = (0, _react.useRef)(new THREE.Scene());
  scene.current.background = new THREE.Color(0xffffff);
  var camera = (0, _react.useRef)(new THREE.PerspectiveCamera());
  var renderer = (0, _react.useRef)(new THREE.WebGLRenderer());
  var geometry = (0, _react.useRef)(new THREE.BufferGeometry());
  var overlayGeometry = (0, _react.useRef)(new THREE.BufferGeometry());
  var pointsMaterial = (0, _react.useRef)(new THREE.PointsMaterial());
  var newOverlayMaterial = (0, _react.useRef)(new THREE.PointsMaterial());
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

        // console.log("minY", minY, imageRow * (imageMeta.height + padding), imageMeta.height + y);

        var position = [minX + (x + imageCol * (imageMeta.width + padding)) * scale, minY + layout.height - imageRow * (imageMeta.height + padding) * scale - imageMeta.height * scale + y * scale];
        // console.log(position);
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
  (0, _react.useEffect)(function () {
    // svgElement = d3.select(ref.current);
    ref.current.appendChild(renderer.current.domElement);
    d3.select(hideRef.current).style("display", "flex").style("margin-top", "10px");
    d3.select(visibleRef.current).style("display", "none").style("margin-top", "10px");
    d3.select(controlsRef.current).style("display", "flex");
    return function () {
      renderer.current.dispose();
      geometry.current.dispose();
      overlayGeometry.current.dispose();
      pointsMaterial.current.dispose();
      newOverlayMaterial.current.dispose();
    };
  }, []);
  (0, _react.useEffect)(function () {
    if (images.length > 0) {
      scene.current.remove(scene.current.getObjectByName("points"));
      geometry.current.dispose();
      renderer.current.dispose();
      var imageWidth = images[0][0].length;
      var imageHeight = images[0].length;
      var rows = Math.ceil(images.length / cols);
      var imageMeta = {
        "width": imageWidth,
        "height": imageHeight
      };
      var layout = {
        "width": imageMeta.width * scale * cols + (cols - 1) * padding * scale,
        "height": imageMeta.height * scale * rows + (rows - 1) * padding * scale
      };
      var near_plane = 2;
      var far_plane = 100;

      // Set up camera and scene
      camera.current = new THREE.PerspectiveCamera(2 * Math.atan(layout.height / (2 * far_plane)) * (180 / Math.PI), layout.width / layout.height, near_plane, far_plane);
      camera.current.position.set(0, 0, far_plane);
      camera.current.lookAt(new THREE.Vector3(0, 0, 0));
      renderer.current.setSize(layout.width, layout.height);
      geometry.current = new THREE.BufferGeometry();
      var colors = [];
      var positions = [];
      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        var imageRow = Math.floor(i / cols);
        var imageCol = i - imageRow * cols;
        var flatten = image.flat();
        var extent = d3.extent(flatten);
        var colorScale = d3.scaleSequential(d3.interpolateGreys).domain([extent[1], extent[0]]);
        var flatImage = preprocess(image, imageMeta, layout, colorScale, imageCol, imageRow);
        for (var _iterator = _createForOfIteratorHelperLoose(flatImage), _step; !(_step = _iterator()).done;) {
          var p = _step.value;
          positions.push(p.position[0], p.position[1], 0);
          color.set(p.color);
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
      renderer.current.render(scene.current, camera.current);
    }
  }, [images]);
  (0, _react.useEffect)(function () {
    if (!showImgOverlay) {
      scene.current.remove(scene.current.getObjectByName("overlay"));
    }
    if (showImgOverlay && overlays.length > 0) {
      scene.current.remove(scene.current.getObjectByName("overlay"));
      var imageWidth = overlays[0][0].length;
      var imageHeight = overlays[0].length;
      var rows = Math.ceil(overlays.length / cols);
      var imageMeta = {
        "width": imageWidth,
        "height": imageHeight
      };
      var layout = {
        "width": imageMeta.width * scale * cols + (cols - 1) * padding * scale,
        "height": imageMeta.height * scale * rows + (rows - 1) * padding * scale
      };
      var newOverlayColors = [];
      var newOverlayPositions = [];
      for (var i = 0; i < overlays.length; i++) {
        var image = overlays[i];
        var imageRow = Math.floor(i / cols);
        var imageCol = i - imageRow * cols;
        var flatten = image.flat();
        var extent = d3.extent(flatten);
        var flatImage = preprocess(image, imageMeta, layout, segmentColorScale, imageCol, imageRow, true);

        // const color = new THREE.Color();

        for (var _iterator2 = _createForOfIteratorHelperLoose(flatImage), _step2; !(_step2 = _iterator2()).done;) {
          var p = _step2.value;
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
  }, [overlays, showImgOverlay]);
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
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: containerStyle
  }, /*#__PURE__*/_react["default"].createElement("div", {
    id: "controls",
    ref: controlsRef
  }, /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    ref: visibleRef,
    id: "visibleOverlay",
    startIcon: /*#__PURE__*/_react["default"].createElement(_Visibility["default"], null),
    onClick: visibleOverlay
  }, "Show Overlay"), /*#__PURE__*/_react["default"].createElement(_Button["default"], {
    ref: hideRef,
    id: "hiddenOverlay",
    startIcon: /*#__PURE__*/_react["default"].createElement(_VisibilityOff["default"], null),
    onClick: hideOverlay
  }, "Hide Overlay")), /*#__PURE__*/_react["default"].createElement("div", {
    style: multiStyle,
    id: "threejs_multi",
    ref: ref
  }));
};
exports.FrameMulti = FrameMulti;