import * as _ from "lodash";
import { Models } from "../../deps";

export function Relations(Models: Models) {
  _.each(Models, (Model) => {
    if (!Model.includes) return;
    // TODO Model之间的关系定义
    console.log("需要的时候请在这里定义 Models 之间的关系");
  });
}
