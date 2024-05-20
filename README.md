# MiMICRI: Towards Domain-centered Counterfactual Explanations of Cardiovascular Image Classification Models

This repository is a demonstration of the MiMICRI approach proposed in the [ACM FAccT 2024 paper](https://arxiv.org/abs/2404.16174) titled:

`MiMICRI: Towards Domain-centered Counterfactual Explanations of Cardiovascular Image Classification Models`

mimicri is a python library of interactive visualizations for segmentation-based counterfactual generation, designed to work with the JupyterLab computational environment.

### Citation

```
@inproceedings{guo2024towards,
  title={MiMICRI: Towards Domain-centered Counterfactual Explanations of Cardiovascular Image Classification Models},
  author={Guo, Grace and Deng, Lifu and Tandon, Animesh and Endert, Alex and Kwon, Bum Chul},
  booktitle={Proceedings of the 2024 FAccT Conference on Fairness, Accountability, and Transparency},
  pages={1--14},
  year={2024}
}
```

### Pre-processing Images

The MiMICRI system requires images to first be pre-processed using semantic segmentation.
The demo uses the [ukbb_cardiac](https://github.com/baiwenjia/ukbb_cardiac) toolbox to segment cardiac MRI images from the UK Biobank.
We have pre-downloaded and segmented two cardiac MRIs from the ukbb_cardiac toolbox.
They are included in the `notebooks/demo_image` folder.
We also include a notebook (`notebooks/plot_segmentation.ipynb`) to view the segmentations.

The demo only includes a small subset of images.
If you would like to use the full [UK Biobank dataset](https://www.ukbiobank.ac.uk/), you must register for an account and obtain the necessary approvals.

Note that other types of medical images and segmentation methods, including manual segmentation, may be used.

### Installation

Create a clean conda environment with the exact versions of the following packages:

```
conda create -n mimicri python=3.8 jupyterlab=3.4 ipywidgets=7.6 ipykernel=5.3

conda activate mimicri
```

Clone the repo locally:
```
git clone https://{YOUR_GITHUB_TOKEN}@github.com/IBM/mimicri.git
```

Navigate to your local cloned mimicri folder and install dependencies:

```
pip install -r requirements.txt

pip install mimicri
```

The package should show up when you run:

```
jupyter labextension list
```

### Developer Installation

Use this installation *only* if you are making changes to the MiMICRI widget. If you are using MiMICRI as-is, the regular install (above) will be sufficient.

Create a clean conda environment with the exact versions of the following packages:

```
conda create -n mimicri python=3.8 jupyterlab=3.4 ipywidgets=7.6 ipykernel=5.3

conda activate mimicri
```

Clone the repo locally:
```
git clone https://{YOUR_GITHUB_TOKEN}@github.com/IBM/mimicri.git
```

Navigate to your local cloned mimicri folder and install other dependencies: `pip install -r requirements.txt`.

Ensure that the [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) package manager has been installed.
If you have npm, you can do this using: `npm install --global yarn`

Finally, install the local mimicri package with `sh ./setup.sh`

The package should show up when you run:

```
jupyter labextension list
```

After making updates to the widget, your changes will be reflected by running `sh ./update.sh`

### Data Files and Running Demo Notebooks

We provide the notebook (`notebooks/mimicri_demo.ipynb`) to demonstrate usage of the MiMICRI modules end-to-end.

To protect the privacy of patients' healthcare data, we are unable to provide any UK BioBank patient demographic data. 
We also exclude any original UK BioBank files in this code repository.
We have included two cardiac MRIs and segmentation files from the [ukbb_cardiac](https://github.com/baiwenjia/ukbb_cardiac) toolbox.
You may also provide your own cardiac MRIs and segmentation files if you would like to use a larger data set.