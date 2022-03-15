import { utils } from "@domain.js/main";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const fns = {
  // TODO 项目自定义的工具方法
  test(a: string) {
    return `A: ${a}`;
  },

  /**
   * 将一个字符串数组整理连接成字符串，用指定的 splitor
   * @param array 要整理的字符串数组
   * @param splitor 连接符，默认逗号(,)
   */
  array2str(array: string[], splitor = ",") {
    const set = new Set<string>();
    const arr: string[] = [];
    for (const x of array) {
      const v = x.trim();
      if (!v || set.has(v) || v === "0") continue;
      set.add(v);
      arr.push(v);
    }
    return arr.join(splitor);
  },

  /**
   * 整理对象上的一些id字段
   * @param instance 要整理的对象
   * @param fields 要整理的字段集合数据
   */
  arrangeIds(instance: any, fields: string[], changed?: string[]) {
    if (typeof instance !== "object") return;
    for (const field of fields) {
      if (!instance[field]) continue;
      if (changed && !changed.includes(field)) continue;

      instance[field] = fns.array2str(instance[field].split(","));
    }
  },

  /**
   * 基于前缀生成随机ID
   * @param pre 类型前缀
   * @param length 随机ID总长度
   */
  generateId(pre: string, length = 25) {
    return `${pre}${utils.randStr(length - pre.length, "normal")}`;
  },

  /**
   * 创建一个随机目录，确保是空的
   */
  mkRandDir(): string {
    const dir = path.join(os.tmpdir(), utils.randStr(12, "normal"));
    if (fs.existsSync(dir)) return fns.mkRandDir();
    fs.mkdirSync(dir);
    return dir;
  },

  /**
   * 随机生成一个文件路径，确保不存在
   */
  mkRandFilepath(): string {
    const filepath = path.join(os.tmpdir(), utils.randStr(12, "normal"));
    if (fs.existsSync(filepath)) return fns.mkRandFilepath();
    return filepath;
  },

  /**
   * 从 content 中提取指定正则的特定部分
   * @param content 要提交的文本
   * @param regExp 提取内容的正则表达式
   * @param index 要保留的顺序
   */
  pickStrsByRegExp(content: string, regExp: RegExp, index: number) {
    const ids = new Set<string>();
    let res = regExp.exec(content);
    while (res) {
      ids.add(res[index]);
      res = regExp.exec(content);
    }

    return [...ids];
  },
};

export default Object.assign(utils, fns);
