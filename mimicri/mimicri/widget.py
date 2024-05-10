import ipywidgets as widgets

from traitlets import Unicode, Dict, List, TraitError
from ._version import NPM_PACKAGE_RANGE
from .utils import *
from pathlib import Path

import math
import json

import pandas as pd
import numpy as np

import torch
import torch.nn as nn
import torch.nn.functional as F
import pytorchvideo
import pytorchvideo.models.resnet
import gc

# See js/lib/example.js for the frontend counterpart to this file.

class SelectorBaseWidget(widgets.DOMWidget):

    # Name of the widget view class in front-end
    _view_name = Unicode('SelectorView').tag(sync=True)
    # Name of the widget model class in front-end
    _model_name = Unicode('SelectorModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)
    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    # value = Unicode('test').tag(sync=True)
    selection = List().tag(sync=True)
    segments = List().tag(sync=True)
    subset = List().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs
        self.observe(handler=self.__load, names="selection")

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

    def __load(self, change):
        newIndices = change["new"]

        _pdData = self._pdData
        selectedItems = _pdData.loc[_pdData[self._index].isin(newIndices)]

        [_, newImgFiles, newSegFiles] = get_img_seg(selectedItems.to_dict(orient="records"), self.imgCol, self.segCol)

        newImages = read_images(newImgFiles, self.imgReader)
        newSegments = read_images(newSegFiles, self.imgReader)

        if not self._isVideo:
            self.selectionImages = {"images": [f.tolist() for f in newImages], "segments": [f.tolist() for f in newSegments]}
            self.props = {**self.props, "selectionImages": self.selectionImages}
        elif self._isVideo:
            self.selectionImages = {"images": reduce_video(newImages), "segments": reduce_video(newSegments)}
            self.props = {**self.props, "selectionImages": self.selectionImages}
        else:
            raise IndexError("Expected files of ndim 2 or ndim 3, {0} dimensions received".format(depth))

    # run recombination
    def morphmix(self, outfolder="./recombined", verbose=False):

        selectedSubset = set(self.subset)

        if not self.source:
            self.source = [a for a in self.all if a[self._index] in selectedSubset]
        
        sourceImgCol = self.imgCol
        sourceSegCol = self.segCol

        if not self.target:
            self.target = [a for a in self.all if a[self._index] in selectedSubset]
        
        targetImgCol = self.imgCol
        targetSegCol = self.segCol

        Path(f'./{outfolder}/img').mkdir(parents=True, exist_ok=True)
        Path(f'./{outfolder}/seg').mkdir(parents=True, exist_ok=True)
        allData = []

        for s in range(len(self.source)):

            sImg = self.imgReader(self.source[s][sourceImgCol])
            sSeg = self.imgReader(self.source[s][sourceSegCol])
            sIndex = self.source[s][self._index]

            for t in range(len(self.target)):

                tImg = self.imgReader(self.target[t][targetImgCol])
                tSeg = self.imgReader(self.target[t][targetSegCol])
                tIndex = self.target[t][self._index]

                if verbose: print(f'recombining {sIndex} and {tIndex}...')

                recombinantImg = replace_img_video(sImg, tImg, sSeg, tSeg, self.segments)[0]
                recombinantSeg = replace_img_video(sSeg, tSeg, sSeg, tSeg, self.segments)[0]

                imgFile = f'./{outfolder}/img/{sIndex}_{tIndex}.nii.gz'
                segFile = f'./{outfolder}/seg/{sIndex}_{tIndex}.nii.gz'

                if verbose: print(f'saving recombinants...')

                save_NIFTI(imgFile, recombinantImg)
                save_NIFTI(segFile, recombinantSeg)

                # Keep track of source, target and recombinant file locations
                newData = {}

                newData["source_id"] = self.source[s][self._index]
                newData["source_img"] = self.source[s][sourceImgCol]
                newData["source_seg"] = self.source[s][sourceSegCol]

                newData["target_id"] = self.target[t][self._index]
                newData["target_img"] = self.target[t][targetImgCol]
                newData["target_seg"] = self.target[t][targetSegCol]

                newData["recombinant_id"] = f'{self.source[s][self._index]}_{self.target[t][self._index]}'
                newData["recombinant_img"] = imgFile
                newData["recombinant_seg"] = segFile

                allData.append(newData)

        if verbose: print(f'saving data...')

        with open(f'./{outfolder}/data.json', "w") as file:
            json.dump(allData, file, ensure_ascii=False, indent=4)

# imgReader is expected to read the filepaths and return nd array with shape
# (NxM) for images
# (NxMxFrames) for videos
@widgets.register
class Selector(SelectorBaseWidget):
    def __init__(self, source, target, imgReader, imgCol="image", segCol="segments", _index="_uuid", **kwargs):

        self.imgReader = imgReader
        self._index = _index

        self.imgCol = imgCol
        self.segCol = segCol

        self.source = None
        self.target = None

        if len(source) == 1:

            self.source = source
            self.all = target

            self._pdData = pd.DataFrame().from_dict(target)

            print("setting source...")
            [sourceData, sourceImgFiles, sourceSegFiles] = get_img_seg(source)

            mainImage = {"images": read_images(sourceImgFiles, imgReader), "segments": read_images(sourceSegFiles, imgReader)}
            depth = mainImage["images"][0].ndim

            # Separate data from image filepaths
            [targetData, targetImgFiles, targetSegFiles] = get_img_seg(target, imgCol, segCol)

            self.allData = targetData
            self.allImages = targetImgFiles
            self.allSegs = targetSegFiles
            
            self.selectSource = False

        elif len(target) == 1:

            self.target = target
            self.all = source

            self._pdData = pd.DataFrame().from_dict(source)

            print("setting target...")
            [targetData, targetImgFiles, targetSegFiles] = get_img_seg(target)

            mainImage = {"images": read_images(targetImgFiles, imgReader), "segments": read_images(targetSegFiles, imgReader)}
            depth = mainImage["images"][0].ndim

            # Separate data from image filepaths
            [sourceData, sourceImgFiles, sourceSegFiles] = get_img_seg(source, imgCol, segCol)

            self.allData = sourceData
            self.allImages = sourceImgFiles
            self.allSegs = sourceSegFiles

            self.selectSource = True

        [rows, cols] = get_layout(len(self.allData), 300)
        initialImages = math.ceil(50 / rows) * rows

        if depth == 2:
            self.mainImage = {"images": [f.tolist() for f in mainImage["images"]], "segments": [f.tolist() for f in mainImage["segments"]]}
            self.selectionImages = {"images": [f.tolist() for f in read_images(self.allImages[0:initialImages], imgReader)], "segments": [f.tolist() for f in read_images(self.allSegs[0:initialImages], imgReader)]}
            self._isVideo = False
        elif depth == 3:
            self.mainImage = {"images": preprocess_video(mainImage["images"]), "segments": preprocess_video(mainImage["segments"])}
            self.selectionImages = {"images": reduce_video(read_images(self.allImages[0:initialImages], imgReader)), "segments": reduce_video(read_images(self.allSegs[0:initialImages], imgReader))}
            self._isVideo = True
        else:
            raise IndexError("Expected files of ndim 2 or ndim 3, {0} dimensions received".format(depth))

        super().__init__(
            mainImage=self.mainImage,
            selectionImages=self.selectionImages,
            selectSource=self.selectSource,
            data=self.allData,
            _index=self._index,
            _isVideo=self._isVideo,
            **kwargs
        )

class SubsetSelectorBaseWidget(widgets.DOMWidget):

    # Name of the widget view class in front-end
    _view_name = Unicode('SubsetSelectorView').tag(sync=True)
    # Name of the widget model class in front-end
    _model_name = Unicode('SubsetSelectorModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)
    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    # value = Unicode('test').tag(sync=True)
    selection = List().tag(sync=True)
    subset = List().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs
        self.observe(handler=self.__load, names="selection")

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

    def __load(self, change):
        newIndices = change["new"]

        _pdData = self._pdData
        selectedItems = _pdData.loc[_pdData[self._index].isin(newIndices)]

        [_, newImgFiles, newSegFiles] = get_img_seg(selectedItems.to_dict(orient="records"), self.imgCol, self.segCol)

        newImages = read_images(newImgFiles, self.imgReader)
        newSegments = read_images(newSegFiles, self.imgReader)

        if not self._isVideo:
            self.selectionImages = {"images": [f.tolist() for f in newImages], "segments": [f.tolist() for f in newSegments]}
            self.props = {**self.props, "selectionImages": self.selectionImages}
        elif self._isVideo:
            self.selectionImages = {"images": reduce_video(newImages), "segments": reduce_video(newSegments)}
            self.props = {**self.props, "selectionImages": self.selectionImages}
        else:
            raise IndexError("Expected files of ndim 2 or ndim 3, {0} dimensions received".format(depth))

# imgReader is expected to read the filepaths and return nd array with shape
# (NxM) for images
# (NxMxFrames) for videos
@widgets.register
class SubsetSelector(SubsetSelectorBaseWidget):
    def __init__(self, data, imgReader, imgCol="image", segCol="segments", _index="_uuid", **kwargs):

        self.imgReader = imgReader
        self._index = _index

        self.imgCol = imgCol
        self.segCol = segCol

        self.selectionImages = None

        self.all = data

        self._pdData = pd.DataFrame().from_dict(data)

        depth = data["images"][0].ndim

        # Separate data from image filepaths
        [demographicData, imgFiles, segFiles] = get_img_seg(data, imgCol, segCol)

        self.allData = demographicData
        self.allImages = imgFiles
        self.allSegs = segFiles
        
        [rows, cols] = get_layout(len(self.allData), 300)
        initialImages = math.ceil(50 / rows) * rows

        if depth == 2:
            self.selectionImages = {"images": [f.tolist() for f in read_images(self.allImages[0:initialImages], imgReader)], "segments": [f.tolist() for f in read_images(self.allSegs[0:initialImages], imgReader)]}
            self._isVideo = False
        elif depth == 3:
            self.selectionImages = {"images": reduce_video(read_images(self.allImages[0:initialImages], imgReader)), "segments": reduce_video(read_images(self.allSegs[0:initialImages], imgReader))}
            self._isVideo = True
        else:
            raise IndexError("Expected files of ndim 2 or ndim 3, {0} dimensions received".format(depth))

        super().__init__(
            selectionImages=self.selectionImages,
            data=self.allData,
            _index=self._index,
            _isVideo=self._isVideo,
            **kwargs
        )

@widgets.register
class utils(widgets.DOMWidget):
    # Name of the widget view class in front-end
    _view_name = Unicode('BaseView').tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode('BaseModel').tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    value = Unicode('').tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

    # run mask and mix
    # - source/target: list of image and segmentation filepaths [{imgCol: filePath, segCol: filePath, _index: unique index}, ...]
    # - imgReader: function that takes filepath and returns nd array with shape (NxM) for images or (NxMxFrames) for videos
    # - segments: list of segment combinations to replace, [[1], [1, 2], ...]]
    def morphmix(source, target, imgCol, segCol, imgReader, segments, outfolder="./recombined", _index="_uuid", verbose=False):

        Path(f'./{outfolder}/img').mkdir(parents=True, exist_ok=True)
        Path(f'./{outfolder}/seg').mkdir(parents=True, exist_ok=True)
        allData = []

        for s in range(len(source)):

            sImg = imgReader(source[s][imgCol])
            sSeg = imgReader(source[s][segCol])
            sIndex = source[s][_index]

            for t in range(len(target)):

                tImg = imgReader(target[t][imgCol])
                tSeg = imgReader(target[t][segCol])
                tIndex = target[t][_index]

                if verbose: print(f'recombining {sIndex} and {tIndex}...')

                for seg in segments:

                    label = "r"+"".join([str(se) for se in seg])

                    recombinantImg = replace_img_video(sImg, tImg, sSeg, tSeg, seg)[0]
                    recombinantSeg = replace_img_video(sSeg, tSeg, sSeg, tSeg, seg)[0]

                    imgFile = f'./{outfolder}/img/{sIndex}_{tIndex}_{label}.nii.gz'
                    segFile = f'./{outfolder}/seg/{sIndex}_{tIndex}_{label}.nii.gz'

                    if verbose: print(f'saving recombinants...')

                    save_NIFTI(imgFile, recombinantImg)
                    save_NIFTI(segFile, recombinantSeg)

                    # Keep track of source, target and recombinant file locations
                    newData = {}

                    newData["source_id"] = source[s][_index]
                    newData["source_img"] = source[s][imgCol]
                    newData["source_seg"] = source[s][segCol]

                    newData["target_id"] = target[t][_index]
                    newData["target_img"] = target[t][imgCol]
                    newData["target_seg"] = target[t][segCol]

                    newData["recombinant_id"] = f'{sIndex}_{tIndex}_{label}'
                    newData["recombinant_img"] = imgFile
                    newData["recombinant_seg"] = segFile

                    newData["label"] = label

                    allData.append(newData)

        if verbose: print(f'saving morphmix data at {outfolder}/data.json...')

        with open(f'./{outfolder}/data.json', "w") as file:
            json.dump(allData, file, ensure_ascii=False, indent=4)

        return

    # Get predictions for source, target, and recombined images
    # - modelPath: path to model
    # - imgReader: function that takes filepath and returns nd array with shape (NxM) for images or (NxMxFrames) for videos
    # - recombinedData: meta data about recombined images (outfile from self.morphmix)
    def predict(modelPath, imgReader, recombinedData, outfile="./predictions.json", verbose=False):

        def get_predictions(img):
                
            videos = torch.from_numpy(np.array([img])).to(device, non_blocking=True, dtype=torch.float)

            mean = 0.5
            std = 0.224
            videos = videos/255
            videos = (videos - mean) / std

            model = torch.load(modelPath)
            model.eval()

            input_video = videos[:].requires_grad_()

            output = model(input_video)

            norm = torch.nn.functional.softmax(output, dim=1).tolist()

            return norm[0]

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        allResults = []

        for i in range(len(recombinedData)):

            if verbose and (i - i // 10 * 10 == 0): print(f'processing {i} of {len(recombinedData)}...')

            r = recombinedData[i]

            source_img = imgReader(r["source_img"])
            s_prediction = get_predictions(source_img)

            target_img = imgReader(r["target_img"])
            t_prediction = get_predictions(target_img)

            recombinant_img = imgReader(r["recombinant_img"])
            r_prediction = get_predictions(recombinant_img)

            newResult = {}
            newResult["sID"] = r["source_id"]
            newResult["tID"] = r["target_id"]
            newResult["label"] = r["label"]
            newResult["s_prediction"] = s_prediction
            newResult["t_prediction"] = t_prediction
            newResult["r_prediction"] = r_prediction
            newResult["rImgPath"] = r["recombinant_img"]
            newResult["rSegPath"] = r["recombinant_seg"]

            allResults.append(newResult)

        if verbose: print(f'saving prediction data at {outfile}...')

        with open(f'{outfile}', "w") as file:
            json.dump(allResults, file, ensure_ascii=False, indent=4)

        return

    # Helper function to get summary of videos and segmentations
    # - predictions (outfile from self.predict):
    #       [{label: batch label, sID: source id, tID: target id, s_prediction: source prediction, t_prediction: target prediciton, r_prediction: recombined img prediction, rImgPath:filePath, rSegPath:filePath}]
    # - imgReader: function that takes filepath and returns nd array with shape (NxM) for images or (FramesxNxM) for videos
    def get_video_summary(predictions, imgReader, segMap, outfile="./summary.json", verbose=False):

        segments = segMap.keys()

        predictionsProcessed = []

        for i in range(len(predictions)):

            if verbose and (i - i // 100 * 100 == 0): print(f'processing {i} of {len(predictions)}...')

            p = predictions[i]

            rImgPath = p["rImgPath"]
            rSegPath = p["rSegPath"]

            video_img = imgReader(rImgPath)
            video_seg = imgReader(rSegPath)

            frames = video_img.shape[0]

            allCentroids = []
            allAreas = []
            allRadials = []
            allColors = []
            
            for f in range(frames):
                video_seg_frame = video_seg[f]
                video_img_frame = video_img[f]
                        
                [centroids, area, radial, colors] = get_image_summary(video_img_frame, video_seg_frame, segments)
                
                allCentroids.append(centroids)
                allAreas.append(area)
                allRadials.append(radial)
                allColors.append(colors)

            p["centroids"] = allCentroids
            p["areas"] = allAreas
            p["radials"] = allRadials
            p["colors"] = allColors

            predictionsProcessed.append(p)

        if verbose: print(f'saving video summary data at {outfile}...')

        with open(f'{outfile}', "w") as file:
            json.dump(predictionsProcessed, file, ensure_ascii=False, indent=4)

        return

class InspectorBaseWidget(widgets.DOMWidget):

    # Name of the widget view class in front-end
    _view_name = Unicode('ReactView').tag(sync=True)
    # Name of the widget model class in front-end
    _model_name = Unicode('ReactModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)
    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    # value = Unicode('test').tag(sync=True)
    # selection = List().tag(sync=True)
    # segments = List().tag(sync=True)
    # subset = List().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs
        # self.observe(handler=self.__load, names="selection")

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

    # Save summaries
    def save_summary(self, outfile="./summary.json"):
        print(f'saving video summary data at {outfile}...')

        with open(f'{outfile}', "w") as file:
            json.dump(self.predictionsProcessed, file, ensure_ascii=False, indent=4)

@widgets.register
class Inspector(InspectorBaseWidget):

    # If filepath is provided using the summaryFile argument, skip preprocessing
    def __init__(self, predictions=[], demographics=[], imgReader=None, segMap={}, summaryFile="", _index="_uuid", _isVideo=False, **kwargs):

        # Load summary data and skip pre-processing if video files were already processed
        # Can be done asynchronously using utils.get_video_summary()
        # Or using the self.save_summary() function
        if summaryFile != "":

            self.segMap = segMap
            self._index = _index

            self.sources = set()
            self.targets = set()

            with open(f'{summaryFile}', "r") as file:
                self.predictionsProcessed = json.loads(file.read())

            for p in self.predictionsProcessed:
                self.sources.add(p["sID"])
                self.targets.add(p["tID"])

            self.sourceDemographics = [d for d in demographics if d[_index] in self.sources]
            self.targetDemographics = [d for d in demographics if d[_index] in self.targets]

        else:

            self.imgReader = imgReader
            self.segMap = segMap
            self._index = _index

            segments = segMap.keys()

            if (not _isVideo):

                self.predictionsProcessed = []
                self.sources = set()
                self.targets = set()

                for p in predictions:

                    rImgPath = p["rImgPath"]
                    rSegPath = p["rSegPath"]

                    # print(rSegPath)

                    [centroids, areas, radials, colors] = get_image_summary(imgReader(rImgPath), imgReader(rSegPath), segments)

                    p["centroids"] = centroids
                    p["areas"] = areas
                    p["radials"] = radials
                    p["colors"] = colors

                    self.predictionsProcessed.append(p)

                    self.sources.add(p["sID"])
                    self.targets.add(p["tID"])

            else:

                self.predictionsProcessed = []
                self.sources = set()
                self.targets = set()

                for p in predictions:

                    rImgPath = p["rImgPath"]
                    rSegPath = p["rSegPath"]

                    video_img = imgReader(rImgPath)
                    video_seg = imgReader(rSegPath)

                    frames = video_img.shape[0]

                    allCentroids = []
                    allAreas = []
                    allRadials = []
                    allColors = []
                    
                    for f in range(frames):
                        video_seg_frame = video_seg[f]
                        video_img_frame = video_img[f]
                                
                        [centroids, area, radial, colors] = get_image_summary(video_img_frame, video_seg_frame, segments)
                        
                        allCentroids.append(centroids)
                        allAreas.append(area)
                        allRadials.append(radial)
                        allColors.append(colors)

                    p["centroids"] = allCentroids
                    p["areas"] = allAreas
                    p["radials"] = allRadials
                    p["colors"] = allColors

                    self.predictionsProcessed.append(p)

                    self.sources.add(p["sID"])
                    self.targets.add(p["tID"])

            self.sourceDemographics = [d for d in demographics if d[_index] in self.sources]
            self.targetDemographics = [d for d in demographics if d[_index] in self.targets]

        super().__init__(
            predictions=self.predictionsProcessed,
            demographics=self.sourceDemographics + self.targetDemographics,
            segMap=self.segMap,
            _index=self._index,
            _isVideo=_isVideo,
            **kwargs
        )

class VideoBaseWidget(widgets.DOMWidget):

    # Name of the widget view class in front-end
    _view_name = Unicode('ReactView').tag(sync=True)
    # Name of the widget model class in front-end
    _model_name = Unicode('ReactModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)
    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    # value = Unicode('test').tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

@widgets.register
class VideoRender(VideoBaseWidget):

    # images/segments:- (FramesxNxM) array
    def __init__(self, images, segments, imgReader=None, **kwargs):

        if imgReader:

            self.images = imgReader(images)
            self.overlays = imgReader(segments)

        else:
        
            self.images = images
            self.overlays = segments

        # print("here", self.data)
        
        super().__init__(
            images=self.images,
            overlays=self.overlays,
            **kwargs
        )

class MultiBaseWidget(widgets.DOMWidget):

    # Name of the widget view class in front-end
    _view_name = Unicode('ReactView').tag(sync=True)
    # Name of the widget model class in front-end
    _model_name = Unicode('ReactModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('mimicri').tag(sync=True)
    # Name of the front-end module containing widget model
    _model_module = Unicode('mimicri').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode(NPM_PACKAGE_RANGE).tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    # value = Unicode('test').tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs

    def update_prop(self, prop_name, prop_value):
        self.props = {**self.props, prop_name: prop_value}

@widgets.register
class FrameMulti(MultiBaseWidget):

    # images/segments:- (ItemsxNxM) array
    # imgReader:- Reads a single file as (FramesxNxM) array
    def __init__(self, images, segments, imgReader=None, **kwargs):

        if imgReader:

            readImages = np.array([imgReader(img) for img in images])
            readOverlays = np.array([imgReader(seg) for seg in segments])

            readImages = np.moveaxis(readImages, [0, 1, 2, 3], [1, 0, 2, 3]).tolist()
            readOverlays = np.moveaxis(readOverlays, [0, 1, 2, 3], [1, 0, 2, 3]).tolist()

            self.images = readImages
            self.overlays = readOverlays

        else:
        
            self.images = images
            self.overlays = segments

        # print("here", self.data)
        
        super().__init__(
            images=self.images,
            overlays=self.overlays,
            **kwargs
        )

@widgets.register
class VideoMulti(MultiBaseWidget):

    # images/segments:- (FramesxItemsxNxM) array
    # imgReader:- Reads a single file as (FramesxNxM) array
    def __init__(self, images, segments, imgReader=None, **kwargs):

        if imgReader:

            readImages = np.array([imgReader(img) for img in images])
            readOverlays = np.array([imgReader(seg) for seg in segments])

            self.images = reduce_video(readImages)
            self.overlays = reduce_video(readOverlays)

        else:
        
            self.images = reduce_video(images)
            self.overlays = reduce_video(segments)

        # print("here", self.data)
        
        super().__init__(
            images=self.images,
            overlays=self.overlays,
            **kwargs
        )