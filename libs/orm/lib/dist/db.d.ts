export * from './models';
export declare const rawQuery: {
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").UPDATE>): Promise<[undefined, number]>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").BULKUPDATE>): Promise<number>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").INSERT>): Promise<[number, number]>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").UPSERT>): Promise<number>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").DELETE>): Promise<void>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").BULKDELETE>): Promise<number>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").SHOWTABLES>): Promise<string[]>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").DESCRIBE>): Promise<import("sequelize").ColumnsDescription>;
    <M extends import("sequelize").Model<any, any>>(sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithModel<M> & {
        plain: true;
    }): Promise<M | null>;
    <M_1 extends import("sequelize").Model<any, any>>(sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithModel<M_1>): Promise<M_1[]>;
    <T extends object>(sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").SELECT> & {
        plain: true;
    }): Promise<T | null>;
    <T_1 extends object>(sql: string | {
        query: string;
        values: unknown[];
    }, options: import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").SELECT>): Promise<T_1[]>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options: (import("sequelize").QueryOptions | import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").RAW>) & {
        plain: true;
    }): Promise<{
        [key: string]: unknown;
    } | null>;
    (sql: string | {
        query: string;
        values: unknown[];
    }, options?: import("sequelize").QueryOptions | import("sequelize").QueryOptionsWithType<import("sequelize/types/query-types").RAW> | undefined): Promise<[unknown[], unknown]>;
};
export declare const withTransaction: {
    <T>(options: import("sequelize").TransactionOptions, autoCallback: (t: import("sequelize").Transaction) => PromiseLike<T>): Promise<T>;
    <T_1>(autoCallback: (t: import("sequelize").Transaction) => PromiseLike<T_1>): Promise<T_1>;
    (options?: import("sequelize").TransactionOptions | undefined): Promise<import("sequelize").Transaction>;
};
