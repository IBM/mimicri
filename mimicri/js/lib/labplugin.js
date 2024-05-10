import {BaseModel, BaseView, ReactModel, ReactView, SelectorModel, SelectorView, SubsetSelectorModel, SubsetSelectorView, version} from './index';
import {IJupyterWidgetRegistry} from '@jupyter-widgets/base';

export const helloWidgetPlugin = {
  id: 'mimicri:plugin',
  requires: [IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'mimicri',
          version: version,
          exports: { BaseModel, BaseView, ReactModel, ReactView, SelectorModel, SelectorView, SubsetSelectorModel, SubsetSelectorView}
      });
  },
  autoStart: true
};

export default helloWidgetPlugin;
