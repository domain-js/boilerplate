export declare const deps: Readonly<{
    "helper.getOrThrown": (Model: import("@domain.js/main/dist/deps/rest/defines").TModel, id: string | number, opt: {
        raw?: boolean;
        type?: string;
        offset?: number;
        include?: import("sequelize/types").Includeable | import("sequelize/types").Includeable[];
        order?: import("sequelize/types").Order;
        attributes?: import("sequelize/types").FindAttributeOptions;
        group?: import("sequelize/types").GroupOption;
        limit?: number;
        lock?: boolean | import("sequelize/types").LOCK | {
            level: import("sequelize/types").LOCK;
            of: import("sequelize/types").ModelStatic<import("sequelize/types").Model<any, any>>;
        };
        skipLocked?: boolean;
        having?: import("sequelize/types").WhereOptions<any>;
        subQuery?: boolean;
        nest?: boolean;
        plain?: boolean;
        replacements?: import("sequelize/types").BindOrReplacements;
        bind?: import("sequelize/types").BindOrReplacements;
        instance?: import("sequelize/types").Model<any, any>;
        mapToModel?: boolean;
        retry?: import("sequelize/types").RetryOptions;
        fieldMap?: import("sequelize/types").FieldMap;
        transaction?: import("sequelize/types").Transaction;
        logging?: boolean | ((sql: string, timing?: number) => void);
        benchmark?: boolean;
        useMaster?: boolean;
        paranoid?: boolean;
        indexHints?: import("sequelize/types").IndexHint[];
    }, error: import("@domain.js/main/dist/errors").ErrorFn) => Promise<import("sequelize/types").Model<any, any>>;
} & {
    errors: Readonly<Record<"notFound" | "loginNameOrPassword" | "loginLockByIP" | "googleAuthCodeError" | "notAllowed" | "notAllowedTheIp" | "tokenError" | "loginVerifyError" | "tokenErrorUserNotExisits" | "tokenErrorUserStatusDisabled" | "tokenErrorUserBeenDeleted" | "resourceDuplicateAdd" | "noAuth" | "uselessRequest" | "domainMethodCallArgsInvalid" | "schemesUnmatched", import("@domain.js/main/dist/errors").ErrorFn>>;
    utils: typeof import("@domain.js/main/dist/utils") & {
        test(a: string): string;
    };
    logger: {
        error: (e: any, extra?: any) => void;
        info: (message: string, extra?: any) => void;
        logger: <T extends (...args: any[]) => any>(fn: T, name: string, isAsync?: boolean, transform?: (x: ReturnType<T>) => any, errorHandler?: (e: any) => string, argsHandler?: (arg: Parameters<T>) => string) => T;
    };
    sequelize: {
        [propName: string]: import("sequelize/types").Sequelize;
    };
    schema: Readonly<{
        auto: <F extends (...args: any[]) => any>(fn: F, schema: import("ajv").Schema[], errorFn: Function, extra: any) => (...args: Parameters<F>) => ReturnType<F>;
        validate: (schema: import("ajv").Schema, data: any) => boolean;
        compile: (schema: import("ajv").Schema) => import("ajv").ValidateFunction<unknown>;
        ajv: import("ajv").default;
    }>;
    aes: Readonly<{
        encrypt: (message: string, key: string) => string;
        decrypt: (message: string, key: string) => string;
    }>;
    cache: import("@domain.js/main/dist/deps/cache/Define").Cache;
    checker: {
        equal: (v1: any, v2: any) => boolean;
        privacy: (fns: [Function, ...any[]][], error?: Error) => Promise<void>;
    };
    cia: {
        isExiting: () => boolean;
        isExited: () => boolean;
        checkReady: () => boolean;
        getStats: () => {
            [name: string]: import("@domain.js/main/dist/deps/cia").Stats & {
                _types: ({
                    type: string;
                } & import("@domain.js/main/dist/deps/cia").Stats)[];
            };
        };
        getUnlinks: () => string[];
        regist: (name: string, validator: Function, types: {
            type: string;
            timeout?: number;
            validator?: Function;
        }[]) => number;
        link: (name: string, type: string, waiter: Function) => void;
        submit: (name: string, data: any, callback?: Function) => void;
        setFn: (type: "error" | "timeout", fn: (...args: any[]) => any) => void;
    };
    counter: {
        get: (key: string) => Promise<number>;
        set: (key: string, val: number) => Promise<number>;
        incr: (key: string) => Promise<number>;
    };
    cron: {
        regist: (name: string, intervalStr: string, startAt?: string) => void;
        start: () => void;
        getStats: () => {
            name: string;
            times: number;
            dones: number;
            failds: number;
            totalMS: number;
            avgMS: number;
        }[];
    };
    graceful: {
        runner: <F_1 extends (...args: any[]) => any>(fn: F_1) => (...args: Parameters<F_1>) => any;
        runnerAsync: <F_1 extends (...args: any[]) => Promise<any>>(fn: F_1) => (...args: Parameters<F_1>) => Promise<any>;
        enabled: () => boolean;
        exit: (listenner: Function) => void;
    };
    hash: {
        get: (key: string) => Promise<number>;
        set: (key: string, value: string) => Promise<number>;
        del: (key: string) => Promise<number>;
        incr: (key: string, step?: number) => Promise<number>;
    };
    parallel: <F_2 extends (...args: any[]) => any>(method: F_2, opt: import("@domain.js/main/dist/deps/parallel").Option) => (...args: Parameters<F_2>) => Promise<ReturnType<F_2>>;
    redis: Redis.Redis;
    request: import("axios").AxiosInstance & {
        origin?: {
            create: (config?: import("axios").AxiosRequestConfig<any>) => import("axios").AxiosInstance;
        };
    };
    rest: {
        modify: (Model: import("@domain.js/main/dist/deps/rest/defines").TModel, model: import("sequelize/types").Model<any, any>, params: import("@domain.js/main/dist/deps/rest/defines").Params, isAdmin?: boolean, _cols?: string[]) => Promise<import("sequelize/types").Model<any, any>>;
        add: (Model: import("@domain.js/main/dist/deps/rest/defines").TModel, params: import("@domain.js/main/dist/deps/rest/defines").Params, isAdmin: boolean, _cols: string[], { creatorId, clientIp }: import("@domain.js/main/dist/deps/rest").CreatorAndClientIp) => Promise<any>;
        remove: (model: import("sequelize/types").Model<any, any>, deletorId: string | number) => Promise<void | import("sequelize/types").Model<any, any>>;
        list: (Model: import("@domain.js/main/dist/deps/rest/defines").TModel, params: import("@domain.js/main/dist/deps/rest/defines").Params, allowAttrs?: string[], toJSON?: boolean) => Promise<{
            count: number;
            rows: any[];
        }>;
        stats: (Model: import("@domain.js/main/dist/deps/rest/defines").TModel, params: import("@domain.js/main/dist/deps/rest/defines").Params, where?: any, conf?: {
            dimensions?: Record<string, string>;
            metrics: Record<string, string>;
            pagination?: {
                maxResults: number;
                maxStartIndex: number;
                maxResultsLimit: number;
            };
        }) => Promise<{
            count: number;
            rows: any;
        }>;
    };
    signer: {
        generator(opt: import("@domain.js/main/dist/deps/signer").Opt, secret: string): string;
        request(uri: string, method: string, key: string, secret: string): {
            readonly "x-auth-signature": string;
            readonly "x-auth-key": string;
            readonly "x-auth-method": string;
            readonly "x-auth-timestamp": number;
            readonly "x-auth-sign-method": "HmacSHA256";
            readonly "x-auth-sign-version": "1";
        };
    };
    _: any;
    uuid: any;
    ajv: typeof import("ajv");
    ajvFormats: typeof import("ajv-formats");
    async: any;
    axios: typeof import("axios");
    cronParser: typeof import("cron-parser");
    humanInterval: typeof import("human-interval");
    IORedis: any;
    LRU: any;
    mysql: typeof import("mysql2");
    Sequelize: typeof import("sequelize/types");
}>;
