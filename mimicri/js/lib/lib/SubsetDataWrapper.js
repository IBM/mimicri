"use strict";

exports.__esModule = true;
exports.SubsetDataWrapper = void 0;
var _react = _interopRequireWildcard(require("react"));
var _SubsetVis = require("./SubsetVis.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var SubsetDataWrapper = function SubsetDataWrapper(_ref) {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$orient = _ref.orient,
    orient = _ref$orient === void 0 ? "split" : _ref$orient,
    setIndices = _ref.setIndices,
    setSubset = _ref.setSubset,
    _ref$_index = _ref._index,
    _index = _ref$_index === void 0 ? "_uuid" : _ref$_index;
  var _useState = (0, _react.useState)([]),
    processedData = _useState[0],
    setProcessedData = _useState[1];

  // function newSetIndices(range) {

  // 	let hidden = document.getElementById(_selection);

  //     if (hidden) {
  //         hidden.value = JSON.stringify(Array.from(range));
  //         var event = document.createEvent('HTMLEvents');
  //         event.initEvent('input', false, true);
  //         hidden.dispatchEvent(event);
  //     }
  // }

  // const [setIndices, setSetIndices] = useState(() => newSetIndices);

  // useEffect(() => {

  // 	function newSetIndices(range) {

  // 		let hidden = document.getElementById(_selection);

  // 		console.log("setting indices... ", range, hidden);

  // 	    if (hidden) {
  // 	        hidden.value = JSON.stringify(Array.from(range));
  // 	        var event = document.createEvent('HTMLEvents');
  // 	        event.initEvent('input', false, true);
  // 	        hidden.dispatchEvent(event);
  // 	    }
  // 	}

  // 	setSetIndices(() => newSetIndices);

  // }, [_selection])

  (0, _react.useEffect)(function () {
    if (orient === "records" && Array.isArray(data)) {
      var indexData = data.map(function (d, i) {
        d["_uuid"] = i;
        return d;
      });
      setProcessedData(indexData);
    } else if (orient === "split" && data.constructor == Object) {
      var indices = data.index;
      var columns = data.columns;
      var values = data.data;
      var newProcessedData = [];
      for (var i = 0; i < indices.length; i++) {
        var row = {};
        for (var c = 0; c < columns.length; c++) {
          var colName = columns[c];
          var value = values[i][c];
          row[colName] = value;
        }
        newProcessedData.push(row);
      }
      var _indexData = newProcessedData.map(function (d, i) {
        d["_uuid"] = i;
        return d;
      });
      setProcessedData(newProcessedData);
    }
  }, []);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_SubsetVis.SubsetVis, {
    data: processedData,
    setIndices: setIndices,
    setSubset: setSubset,
    _index: _index
  }));
};
exports.SubsetDataWrapper = SubsetDataWrapper;