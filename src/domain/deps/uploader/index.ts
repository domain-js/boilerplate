import { ReadonlyArray2union } from "@domain.js/main/dist/types/index";
import * as fs from "fs";
import * as path from "path";
import * as SparkMD5 from "spark-md5";

import { Cnf } from "../../../configs";
import type { TDeps } from "../../deps";

export const Deps = ["_", "moment", "errors", "logger", "request"] as const;

type Deps = Pick<TDeps, ReadonlyArray2union<typeof Deps>>;

export interface FileParams {
  name: string;
  size: number;
  path: string;
}

/** 大文件上传添加一个分片的参数格式 */
export interface AddFileSlideParams {
  /** 该分片的顺序值 */
  index: number;
  /** 该大文件的总共分片数 */
  total: number;
  /** 该大文件的字节数 */
  size: number;
  /** 该大文件的hash值 */
  hash: string;
  /** 该分片对应的上传文件对象 */
  __files: FileParams[];
}

/** 大文件上传最后合并文件的参数格式 */
export interface MergeFileSlideParams {
  /** 该大文件的总共分片数 */
  total: number;
  /** 该大文件的字节数 */
  size: number;
  /** 该大文件的hash值 */
  hash: string;
  /** 文件名 */
  name: string;
}

export function Main(cnf: Pick<Cnf, "upload" | "dateFormat">, deps: Deps) {
  const {
    upload: { blackList, dir: UPLOAD_ROOT, maxFileBytes },
  } = cnf;

  const { _, moment, errors, logger, request } = deps;

  /** 递归创建目录的参数 */
  const MKDIR_RECURSIVE_OPT = Object.freeze({ recursive: true });

  // 处理上传文件
  // uploadDir 是指定上传文件存储的路径
  // zipOpt 是压缩包的一些设定
  // hook 是指处理完的信息存放在哪? 不指定 hook 则直接存储在 req.params
  // 存储的信息包括
  //   path: 'xxxx', 最终文件存储的完成路径
  //   name: 'xxxx', 文件名称
  //   bytes: 212, 文件字节数
  //   extension: 'xxx', 文件的后缀
  const { notFound, notAllowed } = errors;

  const HANDLE_FILE_ERROR = {
    upload: notFound("Please choice file", "file"),
    receive: notFound("Receive file error", "file"),
    extension: notFound("File extension error", "file"),
    maxFileBytes: notAllowed(`Allowed file max bytes is: ${maxFileBytes}`, "file"),
    indexTooBig: notFound("Slice index too big invalid"),
    hashVerifyFaild: notFound("Uploaded file hash verfiy faild"),
    sliceLack(i: number) {
      return notFound("Slice lack", `slice_${i}`);
    },
  };

  /**
   * 获取文件md5 值，基于路径或者文件的内容 Buffer
   * @param file
   * @returns
   */
  const fileMD5 = (file: string | Buffer) => {
    const spark = new SparkMD5.ArrayBuffer();
    if (typeof file === "string") {
      spark.append(fs.readFileSync(file));
    } else {
      spark.append(file);
    }

    return spark.end();
  };

  /**
   * 基于文件的hash值计算文件保存路径
   * @param hash 文件hash 值
   * @param extname 文件后缀，点 . 开头
   * @returns 返回文件要存放的路径，在上传目录
   */
  const destByHash = (hash: string, extname: string) => {
    const today = moment().format(cnf.dateFormat);
    const dest = path.join(UPLOAD_ROOT, today, hash.slice(0, 2), `${hash}${extname}`);
    const dirname = path.dirname(dest);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, MKDIR_RECURSIVE_OPT);
    return dest;
  };

  const handler = async (files: FileParams[]) => {
    // 只处理一个文件
    const file = _.values(files)[0];
    if (!file) throw HANDLE_FILE_ERROR.upload;

    // 释放file上的一些属性，计算文件的后缀
    const { name, size } = file;
    const extname = path.extname(name).toLowerCase();

    // 后缀黑名单检测
    if (blackList.has(extname)) throw HANDLE_FILE_ERROR.extension;

    // 计算文件应该的存储路径
    const hash = fileMD5(file.path);
    const dest = destByHash(hash, extname);

    if (!fs.existsSync(file.path)) throw HANDLE_FILE_ERROR.receive;
    // 移动文件
    fs.copyFileSync(file.path, dest);

    return {
      path: path.relative(UPLOAD_ROOT, dest),
      name,
      bytes: size,
      extension: extname,
    };
  };

  /**
   * 计算大文件上传的某个分片的存储路径
   */
  const SLICE_PATH = (hash: string, index: number) => `${UPLOAD_ROOT}/tmp/${hash}/slice_${index}`;
  /**
   *
   * @param param0
   * @returns
   */
  const addFileSlice = ({ index, total, size, hash, __files }: AddFileSlideParams) => {
    if (maxFileBytes < size) throw HANDLE_FILE_ERROR.maxFileBytes;
    if (total <= index) throw HANDLE_FILE_ERROR.indexTooBig;
    const file = _.values(__files)[0];
    if (!file) throw HANDLE_FILE_ERROR.upload;
    const dest = SLICE_PATH(hash, index);

    fs.mkdirSync(path.dirname(dest), MKDIR_RECURSIVE_OPT);
    fs.copyFileSync(file.path, dest);
    fs.unlinkSync(file.path);
    return true;
  };

  const mergeFileSlice = ({ total, size, hash, name }: MergeFileSlideParams) => {
    const spark = new SparkMD5.ArrayBuffer();
    const bufs = [];
    for (let i = 0; i < total; i += 1) {
      const slice = SLICE_PATH(hash, i);
      if (!fs.existsSync(slice)) throw HANDLE_FILE_ERROR.sliceLack(i);
      const buf = fs.readFileSync(slice);
      spark.append(buf);
      bufs.push(buf);
    }
    const md5 = spark.end();
    if (hash !== md5) throw HANDLE_FILE_ERROR.hashVerifyFaild;

    const extname = path.extname(name).toLowerCase();
    // 后缀黑名单检测
    if (blackList.has(extname)) throw HANDLE_FILE_ERROR.extension;
    const dest = destByHash(hash, extname);
    fs.writeFileSync(dest, Buffer.concat(bufs, size));

    return {
      path: path.relative(UPLOAD_ROOT, dest),
      name,
      bytes: size,
      extension: extname,
    };
  };

  /**
   * 转移一个文件到上传目录
   * @param srouce 原路径
   * @param extname 源文件后缀, 点 . 开头
   */
  const moveFileToUploadDir = (
    source: string,
    extname: string,
  ): [dest: string, hash: string, relativePath: string] => {
    const hash = fileMD5(source);
    const dest = destByHash(hash, extname);
    // 移动文件
    fs.copyFileSync(source, dest);
    // 删除源文件
    fs.unlinkSync(source);
    return [dest, hash, path.relative(UPLOAD_ROOT, dest)];
  };

  /**
   * 删除生成的文件
   * @param filePath 文件相对上传目录的路径
   */
  const removeFile = (filePath: string) => {
    try {
      const _file = path.resolve(UPLOAD_ROOT, filePath);
      if (!fs.existsSync(_file) || !fs.statSync(_file).isFile()) return;
      fs.unlinkSync(_file);
    } catch (e) {
      logger.error(e);
    }
  };

  /**
   * 基于下载文件的头信息获取文件名称
   * @param disposition headers content-disposition
   * @param type header content-type
   */
  const getName = (disposition: string, type: string) => {
    if (disposition) {
      const [, x] = disposition.split(";");
      if (x) {
        const [key, value] = x.split("=");
        if (key.trim() === "filename") {
          if (value && value.split(".")[1]) return value.slice(1, -1);
        }
      }
    }
    const ext = type.split("/")[1] || type;

    return `Unamed file.${ext}`;
  };

  /**
   * 同步一个文件回来，根据指定的 url
   * @param url 文件访问url地址
   */
  const syncByURL = async (url: string) => {
    const res = await request.get(url, { responseType: "arraybuffer" });
    const { data, headers, statusText, status } = res;

    if (!Buffer.isBuffer(data)) {
      throw Error(`远程通过url同步文件失败: ${data || statusText || status}`);
    }

    console.log(headers);

    const name = getName(headers["content-disposition"], headers["content-type"]);

    const extname = path.extname(name);
    // 计算文件应该的存储路径
    const hash = fileMD5(data);
    const dest = destByHash(hash, extname);

    const size = data.length;
    fs.writeFileSync(dest, data);

    return { path: path.relative(UPLOAD_ROOT, dest), name, size };
  };

  return {
    handler,
    removeFile,
    addFileSlice,
    mergeFileSlice,
    fileMD5,
    destByHash,
    moveFileToUploadDir,
    syncByURL,
  };
}
