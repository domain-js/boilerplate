declare type VERBS = ("post" | "get" | "put" | "delete")[];
export declare const cnf: {
    features: readonly ["aes", "request", "cache", "checker", "cia", "counter", "cron", "graceful", "hash", "logger", "parallel", "redis", "rest", "schema", "sequelize", "signer"];
    domain: any;
    cache: {
        isMulti: boolean;
        max: number;
    };
    mode: any;
    schema: {
        allowUnionTypes: boolean;
        coerceTypes: boolean;
        useDefaults: boolean;
    };
    axios: {
        loggers: VERBS;
        retry: string[];
        retryTimes: number;
        retryIntervalMS: number;
        conf: {
            maxContentLength: number;
            maxBodyLength: number;
        };
    };
    parallel: {
        key: string;
        defaultErrorFn: (p: any) => Error;
    };
    counter: {
        key: string;
    };
    hash: {
        key: string;
    };
    aes: {
        key: any;
    };
    /** 数据库配置 */
    sequelize: {
        db: {
            readonly host: any;
            readonly port: any;
            readonly database: any;
            readonly username: any;
            readonly password: any;
            readonly dialect: "mysql";
            readonly dialectOptions: {
                /** 支持大数的计算 */
                readonly supportBigNumbers: true;
                readonly charset: "utf8mb4";
            };
            readonly logging: (str: string, opt: any) => void;
            readonly define: {
                readonly underscored: false;
                readonly freezeTableName: true;
                readonly charset: "utf8mb4";
                readonly collate: "utf8mb4_general_ci";
                readonly engine: "InnoDB";
            };
            readonly pool: {
                readonly min: 2;
                readonly max: 10;
                /** 单位毫秒 */
                readonly idle: number;
            };
        };
    };
    /** redis 配置信息, 使用 ioredis 的options格式 */
    redis: {
        host: any;
        port: any;
        keyPrefix: any;
    };
    /** 文件上传的若干设定 */
    upload: {
        /** 文件存储路径 */
        dir: any;
        /**
         * 不允许的后缀，包括压缩包里的，如果要求解压的时候也要判断
         * 一旦有不和发的直接报错
         */
        blackList: Set<string>;
        /** 文件下载路径 */
        accessUrl: string;
    };
    logger: {
        errorLogPath: string;
        infoLogPath: string;
        clientId: string;
    };
    rest: {
        relativeMaxRangeDays: number;
    };
    /** 日期格式化的格式 */
    dateFormat: string;
    /** 时间格式化的格式 */
    dateTimeFormat: string;
    /** 允许的语言 */
    languages: string[];
    defaultLanguage: string;
};
export declare type Cnf = typeof cnf;
export {};
