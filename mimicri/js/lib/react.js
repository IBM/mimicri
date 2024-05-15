import { DOMWidgetModel, DOMWidgetView } from '@jupyter-widgets/base';

var React = require('react');
var ReactDOM = require('react-dom');
const e = React.createElement;

var inspector = require('./lib/Inspector.js');
var framemulti = require('./lib/FrameMulti.js');
var selector = require('./lib/Selector.js');
var subsetSelector = require('./lib/SubsetSelector.js');
var video = require('./lib/VideoRender.js');
var videomulti = require('./lib/VideoMulti.js');

var lib = {...inspector, ...framemulti, ...selector, ...subsetSelector, ...video, ...videomulti};

// See example.py for the kernel counterpart to this file.

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be serialized.

export class BaseModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name : 'BaseModel',
            _view_name : 'BaseView',
            _model_module : 'mimicri',
            _view_module : 'mimicri',
            _model_module_version : '0.1.0',
            _view_module_version : '0.1.0',
            value : 'running...'
        };
    }
}

export class BaseView extends DOMWidgetView {
    render() {
        this.value_changed();

        // Observe and act on future changes to the value attribute
        this.model.on('change:value', this.value_changed, this);
    }

    value_changed() {
        this.el.textContent = this.model.get('value');
    }
}

export class ReactModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name : 'ReactModel',
            _view_name : 'ReactView',
            _model_module : 'mimicri',
            _view_module : 'mimicri',
            _model_module_version : '0.1.0',
            _view_module_version : '0.1.0'
        };
    }
}

export class ReactView extends DOMWidgetView {
    render() {
        this.value_changed();

        // Observe and act on future changes to the value attribute
        this.model.on('change:props', this.value_changed, this);
    }

    value_changed() {
        var props = this.model.get("props");

        var component = React.createElement(lib[this.model.attributes.component], props);
        ReactDOM.render(component, this.el);  
    }

}

export class SelectorModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name : 'SelectorModel',
            _view_name : 'SelectorView',
            _model_module : 'mimicri',
            _view_module : 'mimicri',
            _model_module_version : '0.1.0',
            _view_module_version : '0.1.0'
        };
    }
}

export class SelectorView extends DOMWidgetView {
    render() {
        this.value_changed();

        // Observe and act on future changes to the value attribute
        this.model.on('change:props', this.value_changed, this);

        // Create input element to track changes in images being shown
        this.outputSelection = document.createElement('input');
        this.outputSelection.type = 'text';
        this.outputSelection.id = `_hiddenSelection${this.model.model_id}`;
        this.outputSelection.style.display = 'none';
        this.outputSelection.value = this.model.get('selection');
        this.outputSelection.oninput = this.selection_changed.bind(this);

        this.el.appendChild(this.outputSelection);

        // Create input element to track changes in segments selected
        this.segmentSelection = document.createElement('input');
        this.segmentSelection.type = 'text';
        this.segmentSelection.id = `_segmentSelection${this.model.model_id}`;
        this.segmentSelection.style.display = 'none';
        this.segmentSelection.value = this.model.get('segments');
        this.segmentSelection.oninput = this.segment_changed.bind(this);

        this.el.appendChild(this.segmentSelection);

        // Create input element to track changes in subset selected
        this.subsetSelection = document.createElement('input');
        this.subsetSelection.type = 'text';
        this.subsetSelection.id = `_subsetSelection${this.model.model_id}`;
        this.subsetSelection.style.display = 'none';
        this.subsetSelection.value = this.model.get('subset');
        this.subsetSelection.oninput = this.subset_changed.bind(this);

        this.el.appendChild(this.subsetSelection);
    }

    value_changed() {
        var props = this.model.get("props");

        props = {...props,
                "_selection": `_hiddenSelection${this.model.model_id}`,
                "_segment": `_segmentSelection${this.model.model_id}`,
                "_subset": `_subsetSelection${this.model.model_id}`};

        var component = React.createElement(lib[this.model.attributes.component], props);
        ReactDOM.render(component, this.el);
    }

    selection_changed() {
        this.model.set('selection', JSON.parse(this.outputSelection.value));
        this.model.save_changes();
    }

    segment_changed() {
        this.model.set('segments', JSON.parse(this.segmentSelection.value));
        this.model.save_changes();
    }

    subset_changed() {
        this.model.set('subset', JSON.parse(this.subsetSelection.value));
        this.model.save_changes();
    }

}

export class SubsetSelectorModel extends DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name : 'SubsetSelectorModel',
            _view_name : 'SubsetSelectorView',
            _model_module : 'mimicri',
            _view_module : 'mimicri',
            _model_module_version : '0.1.0',
            _view_module_version : '0.1.0'
        };
    }
}

export class SubsetSelectorView extends DOMWidgetView {
    render() {
        this.value_changed();

        // Observe and act on future changes to the value attribute
        this.model.on('change:props', this.value_changed, this);

        // Create input element to track changes in images being shown
        this.outputSelection = document.createElement('input');
        this.outputSelection.type = 'text';
        this.outputSelection.id = `_hiddenSelection${this.model.model_id}`;
        this.outputSelection.style.display = 'none';
        this.outputSelection.value = this.model.get('selection');
        this.outputSelection.oninput = this.selection_changed.bind(this);

        this.el.appendChild(this.outputSelection);

        // Create input element to track changes in subset selected
        this.subsetSelection = document.createElement('input');
        this.subsetSelection.type = 'text';
        this.subsetSelection.id = `_subsetSelection${this.model.model_id}`;
        this.subsetSelection.style.display = 'none';
        this.subsetSelection.value = this.model.get('subset');
        this.subsetSelection.oninput = this.subset_changed.bind(this);

        this.el.appendChild(this.subsetSelection);
    }

    value_changed() {
        var props = this.model.get("props");

        props = {...props,
                "_selection": `_hiddenSelection${this.model.model_id}`,
                "_subset": `_subsetSelection${this.model.model_id}`};

        var component = React.createElement(lib[this.model.attributes.component], props);
        ReactDOM.render(component, this.el);
    }

    selection_changed() {
        this.model.set('selection', JSON.parse(this.outputSelection.value));
        this.model.save_changes();
    }

    subset_changed() {
        this.model.set('subset', JSON.parse(this.subsetSelection.value));
        this.model.save_changes();
    }

}
