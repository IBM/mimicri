import nibabel as nib
import numpy as np
from scipy import ndimage
import skimage.measure

# def npyToNib(p):
#     p_data_array = np.load('./demo_image/3/{0}.npy'.format(p), allow_pickle=True).astype(float)
#     p_reshaped = np.moveaxis(p_data_array, [0, 1, 2, 3], [2, 3, 0, 1])
#     img_rotate = ndimage.rotate(p_reshaped, -90, (0, 1), reshape=False)
#     img_flip = np.flip(img_rotate, 1)
        
#     return img_flip.tolist()


# separate filepaths from data
# data: [{var1:..., var2:..., ..., imgCol:imgFile, segCol:segFile}, {...}, ...]
def get_img_seg(data, imgCol="image", segCol="segments"):

    allData = []
    imgFiles = []
    segFiles = []

    for i in range(len(data)):
        datum = data[i]
        imgFiles.append(datum[imgCol])
        segFiles.append(datum[segCol])

        newDatum = datum.copy()
        newDatum.pop(imgCol)
        newDatum.pop(segCol)

        allData.append(newDatum)

    return [allData, imgFiles, segFiles]

# Parameters:
#   - filepaths: [path1, path2, ...]
#   - imgReader: function that returns an image as 2D-array
# Returns: [2D-array, 2D-array, ...]
def read_images(filepaths, imgReader):
    return [imgReader(f) for f in filepaths if ".DS_Store" not in f]

def reduce_video(allVideos):

    allImages = []

    for i in range(len(allVideos)):

        allFrames = []
        image = allVideos[i]
        
        for f in range(image.shape[2]):
            frame = image[..., f]
            pooled = skimage.measure.block_reduce(frame, (4,4), np.max)
            allFrames.append(np.rint(pooled).tolist())
            
        allImages.append(allFrames)
        
    allImages = np.array(allImages)
    reshapedSegments = np.moveaxis(allImages, [0, 1, 2, 3], [1, 0, 2, 3])
    
    return reshapedSegments.tolist()

def preprocess_video(video):
    allImages = np.array(video)
    reshapedSegments = np.moveaxis(allImages, [0, 1, 2, 3], [0, 2, 3, 1])

    return reshapedSegments.tolist()

def save_NIFTI(filePath, img):
    affine = np.eye(4)
    nifti_img = nib.Nifti1Image(img, affine)
    nib.save(nifti_img, filePath)

    return

def get_layout(n, cols, isFixed = False):

    if (n < cols):
        return [1, n]

    fullRows = n//cols
    rowsRemainder = n - fullRows * cols

    if rowsRemainder == 0:
        return [fullRows, cols]
    elif (not isFixed) and rowsRemainder > 0:
        fullCols = n//fullRows
        colsRemainder = n - fullCols * fullRows

        if colsRemainder == 0:
            return [fullRows, fullCols]
        else:
            return [fullRows, fullCols + 1]
    else:
        return [fullRows + 1, cols]


# x, y, z, and t arguments refer to the x, y, and z dimensions axes in NIFTI files, t refers to the time axis
# All arguments can take either an INT or a TUPLE (START INDEX, END INDEX)
# def _nibtotimeseries(filepath, x=None, y=None, z=None, t=None):
#     original = nib.load(filepath).get_fdata()
    
#     indices = {}
    
#     if (x is not None and type(x) == tuple):
#         indices[0] = slice(x[0], x[1])
#     elif (x is not None and type(x) == int):
#         indices[0] = x
        
#     if (y is not None and type(y) == tuple):
#         indices[1] = slice(y[0], y[1])
#     elif (y is not None and type(y) == int):
#         indices[1] = y
        
#     if (z is not None and type(z) == tuple):
#         indices[2] = slice(z[0], z[1])
#     elif (z is not None and type(z) == int):
#         indices[2] = z
        
#     if (t is not None and type(t) == tuple):
#         indices[3] = slice(t[0], t[1])
#     elif (t is not None and type(t) == int):
#         indices[3] = t
        
#     ind = [slice(None)]*4
    
#     for ix in range(0, 4):
#         if ix in indices:
#             ind[ix] = indices[ix]
            
#     nibbed = original[tuple(ind)]
        
#     # listed = nibbed.tolist()
    
#     def timeframe(timeSeries):
        
#         sequence = []
    
#         for tx in range(original.shape[3]):
#             sequence.append(timeSeries[..., tx].tolist())
        
#         return sequence
    
    
#     if original.shape[2] == 1 or (z is not None and type(z) == int):
#         return timeframe(nibbed)
#     elif original.shape[2] > 1:
        
#         result = {}
        
#         for zx in range(original.shape[2]):
#             result[zx] = timeframe(nibbed[..., zx, :])
            
#         return result

#     return "Could not compute time series."

def get_extent(mask):
    x,y = np.where(mask)
    top_left = x.min(), y.min()
    bottom_right = x.max(), y.max()
    width = bottom_right[0] - top_left[0]
    height = bottom_right[1] - top_left[1]
    
    return (top_left, bottom_right, width, height)

def is_out_of_bounds(coords, coords_extent):
    if coords[0] < coords_extent[0][0]:
        return True
    elif coords[0] > coords_extent[1][0]:
        return True
    elif coords[1] < coords_extent[0][1]:
        return True
    elif coords[1] > coords_extent[1][1]:
        return True
    else:
        return False
    
def is_out_of_image(coords, image):
    if coords[0] < 0:
        return True
    elif coords[1] < 0:
        return True
    elif coords[0] >= image[0]:
        return True
    elif coords[1] >= image[1]:
        return True
    return False

# Assumes source and target are both N X M 2-D matrices
# source and target are the original images as ndarrays
# source_mask and target_mask are the image masks as ndarrays (i.e. 0-1 matrix, where 1 represents area of interest)
def replace(source, target, source_mask, target_mask):
    
    source_center = ndimage.center_of_mass(source_mask)
    if np.isnan(source_center[0]) or np.isnan(source_center[1]):
        return target
    source_center = (round(source_center[0]), round(source_center[1]))
    
    target_center = ndimage.center_of_mass(target_mask)
    if np.isnan(target_center[0]) or np.isnan(target_center[1]):
        return target
    target_center = (round(target_center[0]), round(target_center[1]))
    
    source_extent = get_extent(source_mask)
    target_extent = get_extent(target_mask)
        
    # track pixels that have been replaced
    memoize = set()
    
    # if target > source, replace extra pixels with mean color of target image
    target_mean = np.mean(np.copy(target))
    # target_mean = np.max(np.copy(target))
    # target_mode = stats.mean(np.copy(target).flatten()).mode[0]
    
    # starting from the center of mass pixel of source and target segments, recursively replace target pixels with source pixels
    def recurse(source_pixel, target_pixel):
        if target_pixel in memoize:
            # if we have seen this pixel, return immediately
            return
        elif is_out_of_bounds(target_pixel, target_extent) and is_out_of_bounds(source_pixel, source_extent):
            # if pixel is not the bounds of the target segment, return immediately
            memoize.add(target_pixel)
            return
        else:
            if target_mask[target_pixel[0]][target_pixel[1]] == 1 and source_mask[source_pixel[0]][source_pixel[1]] == 1:
                target[target_pixel[0]][target_pixel[1]] = source[source_pixel[0]][source_pixel[1]]
            elif target_mask[target_pixel[0]][target_pixel[1]] == 1 and source_mask[source_pixel[0]][source_pixel[1]] == 0:
                target[target_pixel[0]][target_pixel[1]] = (source[source_pixel[0]][source_pixel[1]] + target[target_pixel[0]][target_pixel[1]]) // 2
                # target[target_pixel[0]][target_pixel[1]] = target_mean
                # target[target_pixel[0]][target_pixel[1]] = 0
            elif target_mask[target_pixel[0]][target_pixel[1]] == 0 and source_mask[source_pixel[0]][source_pixel[1]] == 1:
                target[target_pixel[0]][target_pixel[1]] = source[source_pixel[0]][source_pixel[1]]
                
                
        memoize.add(target_pixel)
                
        # flood fill outwards from current pixel
        for i in [-1, 0, 1]:
            for j in [-1, 0, 1]:
                new_source_pixel = (source_pixel[0]+i, source_pixel[1]+j)
                new_target_pixel = (target_pixel[0]+i, target_pixel[1]+j)

                if new_target_pixel in memoize:
                    continue
                else:
                    recurse(new_source_pixel, new_target_pixel)
    
    recurse(source_center, target_center)
    return target

# Assumes source and target are both N X M 2-D matrices
# source and target are the original images as ndarrays
# source_mask and target_mask are the image masks as ndarrays (i.e. 0-1 matrix, where 1 represents area of interest)
def replace_no_recursion(source, target, source_mask, target_mask):
    
    source_shape = source.shape
    target_shape = target.shape
    
    source_center = ndimage.center_of_mass(source_mask)
    if np.isnan(source_center[0]) or np.isnan(source_center[1]):
        return target
    source_center = (round(source_center[0]), round(source_center[1]))
    
    target_center = ndimage.center_of_mass(target_mask)
    if np.isnan(target_center[0]) or np.isnan(target_center[1]):
        return target
    target_center = (round(target_center[0]), round(target_center[1]))
    
    source_extent = get_extent(source_mask)
    target_extent = get_extent(target_mask)
        
    # track pixels that have been replaced
    memoize = set()
    
    # if target > source, replace extra pixels with mean color of target image
    target_mean = np.mean(np.copy(target))
    # target_mean = np.max(np.copy(target))
    # target_mode = stats.mean(np.copy(target).flatten()).mode[0]
    
    toReplace = []
    toReplace.append([source_center, target_center])
        
    while len(toReplace) != 0:
                
        [source_pixel, target_pixel] = toReplace.pop()
        memoize.add(target_pixel)
        
        if target_mask[target_pixel[0]][target_pixel[1]] == 1 and source_mask[source_pixel[0]][source_pixel[1]] == 1:
            target[target_pixel[0]][target_pixel[1]] = source[source_pixel[0]][source_pixel[1]]
        elif target_mask[target_pixel[0]][target_pixel[1]] == 1 and source_mask[source_pixel[0]][source_pixel[1]] == 0:
            target[target_pixel[0]][target_pixel[1]] = (source[source_pixel[0]][source_pixel[1]] + target[target_pixel[0]][target_pixel[1]]) // 2
            # target[target_pixel[0]][target_pixel[1]] = target_mean
            # target[target_pixel[0]][target_pixel[1]] = 0
        elif target_mask[target_pixel[0]][target_pixel[1]] == 0 and source_mask[source_pixel[0]][source_pixel[1]] == 1:
            target[target_pixel[0]][target_pixel[1]] = source[source_pixel[0]][source_pixel[1]]
        else:
            continue
            
        for i in [-1, 0, 1]:
            for j in [-1, 0, 1]:
                new_source_pixel = (source_pixel[0]+i, source_pixel[1]+j)
                new_target_pixel = (target_pixel[0]+i, target_pixel[1]+j)

                if new_target_pixel in memoize:
                    continue
                elif is_out_of_bounds(new_source_pixel, source_extent) and is_out_of_bounds(new_target_pixel, target_extent):
                    continue
                elif is_out_of_image(new_source_pixel, source_shape) or is_out_of_image(new_target_pixel, target_shape):
                    continue
                else:
                    toReplace.append([new_source_pixel, new_target_pixel])
    
    return target

# From notebooks/plot_nifti.ipynb
# If both source and target are:
# - 2D-ndarrays (NxM), return [recombined 2D-array of same shape as target, original target]
# - 3D-ndarrays (i.e. videos, NxMxT), return [[recombined video], [original video]]
def replace_img_video(source, target, source_seg, target_seg, mask_area, as_nd=True):
    if (source.ndim != target.ndim):
        return f'expected same dimensions for source and target, received {source.shape} and {target.shape}'
    
    dims = source.ndim
    
    if dims == 2:
        
        # print("replacing dims 2...")
        
        source_mask = np.isin(source_seg, mask_area)
        target_mask = np.isin(target_seg, mask_area)
        
        recombinant = replace_no_recursion(source, np.copy(target), source_mask, target_mask)
        original_target = target
        
        if not as_nd:
            recombinant = recombinant.tolist()
            original_target = original_target.tolist()
        
        return [recombinant, original_target]

    if dims == 3:
        
        # print("replacing dims 3...")
        
        slices = source.shape[2]
        all_recombined = []
        all_original = []
        
        for s in range(slices):
            source_slice = source[..., s]
            source_seg_slice = source_seg[..., s]
            source_mask = np.isin(source_seg_slice, mask_area)
            
            target_slice = target[..., s]
            target_seg_slice = target_seg[..., s]
            target_mask = np.isin(target_seg_slice, mask_area)
            
            recombinant = replace_no_recursion(source_slice, np.copy(target_slice), source_mask, target_mask)
            original_target = target_slice
            
            if not as_nd:
                recombinant = recombinant.tolist()
                original_target = original_target.tolist()
            
            all_recombined.append(recombinant)
            all_original.append(original_target)
                
        if as_nd:
            return [np.stack(all_recombined, axis=2), np.stack(all_original, axis=2)] 
        else:   
            return [all_recombined, all_original]
    
    return None

# Get color distribution
def get_color(seg_mask, img, seg_height, seg_width):
    
    result = []
    
    for x in range(seg_width):   
        for y in range(seg_height):
            if seg_mask[x][y] == 1:
                result.append(img[x][y])
                
    return result

def out_of_bounds_summary(coords, seg_height, seg_width):
    
    return coords[0] < 0 or coords[1] < 0 or coords[0] >= seg_width or coords[1] >= seg_height

def traverse(seg_mask, center, direction, seg_height, seg_width):
    
    coords = [center[0] + direction[0], center[1] + direction[1]]
    extent = None
    
    count = 0
    
    while not out_of_bounds_summary(coords, seg_height, seg_width):
        
        if seg_mask[coords[0]][coords[1]] == 1:
            extent = coords
            
        coords = [coords[0] + direction[0], coords[1] + direction[1]]
        
    if extent != None:         
        return (((extent[0] - center[0])/seg_width) ** 2 + ((extent[1] - center[1])/seg_height) ** 2) ** 0.5
    
    return None

# Get radial contour shape
def get_radial(seg_mask, center, seg_height, seg_width):
    
    directions = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
    
    radial = []
    
    for d in directions:
                
        radial.append(traverse(seg_mask, [round(center[0]), round(center[1])], d, seg_height, seg_width))
        
    return radial

# Get image summary
def get_image_summary(img, seg, segments):
    centroids = {}
    areas = {}
    radial = {}
    colors = {}
    
    for s in segments:
        seg_mask = np.isin(seg, [s]).astype(int)
        seg_center = ndimage.center_of_mass(seg_mask)
        (seg_height, seg_width) = seg.shape

        # print(s, seg_mask, np.unique(seg_mask), seg_center, seg_height, seg_width)
        
        # normalize the center of mass coordinates
        centroids[s] = (seg_center[0] / seg_height, seg_center[1] / seg_width)
        areas[s] = int(np.sum(seg_mask))
        radial[s] = get_radial(seg_mask, seg_center, seg_height, seg_width)
        colors[s] = get_color(seg_mask, img, seg_height, seg_width)
        
    return [centroids, areas, radial, colors]