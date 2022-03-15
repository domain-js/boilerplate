#! /usr/bin/env ts-node

import async from "async";
import fs from "fs";
import _ from "lodash";
import path from "path";
import readline from "readline";
import Sequelize from "sequelize";
import util from "util";

import { Cnf, cnf } from "../configs";
import utils from "../domain/utils";

cnf.mode = "hand";
const DB_KEYS = new Set(Object.keys(cnf.sequelize) as (keyof Cnf["sequelize"])[]);

const { deepReaddir } = utils;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "> ",
  removeHistoryDuplicates: true,
});
rl.setPrompt("> ");

const confirm = async (question: string) =>
  new Promise((resolve) => {
    rl.question(`${question} [Yes/no]: `, (ans) => resolve(ans.toLowerCase() !== "no"));
  });

const getObject = async (): Promise<Record<string, string>> => {
  const questions = [["请输入要执行数据库变更的版本号(多个用逗号隔开)", "versions"]];

  const data: Record<string, string> = {};

  await async.eachSeries(questions, async ([question, key]) => {
    data[key] = await new Promise((resolve) => {
      rl.question(`${question}[${key}]: `, resolve);
    });
  });

  console.log("--------- 信息添加如下 -------------");
  console.log("%o", data);
  const ok = await confirm("是否确认执行? ");
  if (!ok) return getObject();

  return data;
};

const main = async () => {
  const question = util.format(
    `该程序为执行指定版本的数据库变更脚本，当前为环境为 %o。误入，请直接 Ctrl+C 退出`,
    process.env.NODE_ENV || "development",
  );
  const ok = await confirm(question);
  if (!ok) process.exit(0);

  const obj = await getObject();
  const versions = Array.from(new Set(obj.versions.split(",")));
  console.log(versions);
  const files: string[] = [];
  for (const version of versions) {
    const dir = path.resolve(__dirname, `../../upgrade/${version}`);
    // 如果目录不存在直
    if (!fs.existsSync(dir)) {
      console.log(`该版本不存在：${version}`);
      continue;
    }
    const f = fs.statSync(dir);
    // 如果文件不是一个目录直接退出
    if (!f.isDirectory()) {
      console.log(`该版本不是一个文件夹：${version}`);
      continue;
    }
    deepReaddir(dir, new Set(["sql"]), new Set([]), files);
  }

  const sqls: Record<string, string[]> = {};
  for (const x of DB_KEYS) sqls[x] = [];

  for (const file of _.uniq(files).sort()) {
    const name = path.basename(file, ".sql") as keyof Cnf["sequelize"];
    if (!DB_KEYS.has(name)) {
      console.log("不支该命名数据库文件: %s", name);
      continue;
    }
    console.log("数据库文件: %s", file);
    const sql = fs.readFileSync(file, "utf8");
    if (!sql.length) continue;

    sqls[name].push(sql);
  }

  await async.each([...DB_KEYS], async (key) => {
    const sqlString = sqls[key].join("\n");
    if (!sqlString) return;
    try {
      const opt = cnf.sequelize[key];

      _.set(opt, "dialectOptions.multipleStatements", true);
      const sequelize = new Sequelize.Sequelize(opt.database, opt.username, opt.password, opt);
      await sequelize.query(sqlString);
    } catch (error) {
      console.error(error);
    }
  });
  process.exit(0);
};

main();

process.on("uncaughtException", (error) => {
  console.error("[%s]: uncaughtException", new Date());
  console.error(error);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("[%s]: unhandledRejection", new Date());
  console.error(reason, p);
});

process.on("rejectionHandled", (error) => {
  console.error("[%s]: rejectionHandled", new Date());
  console.error(error);
});
