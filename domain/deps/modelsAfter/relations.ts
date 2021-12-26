import * as _ from "lodash";
import { Models } from "../../deps";

export function Relations(Models: Models) {
  _.each(Models, (Model) => {
    if (!Model.includes) return;
    if (_.isArray(Model.includes)) {
      const includes = {};
      _.each(Model.includes, (include) => {
        includes[include] = include;
      });
      Model.includes = includes;
    }
    _.each(Model.includes, (v, as) => {
      const [name, required] = _.isArray(v) ? v : [v, true];
      Model.includes[as] = {
        as,
        required,
        model: Models[name],
      };
    });
  });
}
