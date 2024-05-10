# mimicri

Masking and mixing for interactive counterfactual recombined images

## Installation

To install use pip:

    $ pip install mimicri

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com//mimicri.git
    $ cd mimicri
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix mimicri
    $ jupyter nbextension enable --py --sys-prefix mimicri

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite mimicri

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
