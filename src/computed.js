// @flow

import * as util from './util';
import observe from './observe';
import Watcher from './watcher';
import Dep from './dep';

function initData(opts: any) {
  if (util.isObject(opts) && util.isObject(opts.data)) {
    for (const prop in opts.data) {
      observe(opts.data);
    }
  }
}

function initComputed(ctx: Computed, opts: Object, cb?: Function) {
  if (util.isObject(opts) && util.isObject(opts.computed)) {
    for (let prop in opts.computed) {
      if (!util.isObject(opts.data)) {
        opts.data = {};
      }
      if (!ctx._computedWatchers) {
        ctx._computedWatchers = {};
      }

      const watcher = (((ctx._computedWatchers: any): Object)[
        prop
      ] = new Watcher(
        opts.computed[prop].bind(opts),
        cb ? cb.bind(opts, prop) : undefined,
        true
      ));

      function createComputedGetter() {
        const val = watcher.get();
        if (Dep.target) {
          watcher.depend();
        }
        return val;
      }

      Object.defineProperty(opts.data, prop, {
        enumerable: true,
        configurable: true,
        set: util.noop,
        get: createComputedGetter
      });
    }
  }
}

class Computed {
  static util = util;
  _computedWatchers: { [k: string | number]: Watcher } | void;
  constructor(opts: any, cb?: Function) {
    initData(opts);
    initComputed(this, opts, cb);
  }
  execDirtyWatcher() {
    if (this._computedWatchers) {
      const props = Object.keys(this._computedWatchers);
      for (let i = 0, l = props.length; i < l; i++) {
        const watcher = this._computedWatchers[props[i]];
        if (watcher.dirty) {
          watcher.forceUpdate();
        }
      }
    }
  }
}

export default Computed;