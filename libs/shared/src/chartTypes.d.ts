export type DatePrecision =
    | 'year'
    | 'half'
    | 'quarter'
    | 'month'
    | 'week'
    | 'day'
    | 'day-minutes'
    | 'day-seconds';

export type NumberColumnFormatterConfig = {
    'number-format'?: string;
    'number-divisor'?: number | string;
    'number-append'?: string;
    'number-prepend'?: string;
};

export type DateColumnFormatterConfig = {
    normalizeDatesToEn?: boolean;
};

export type ColumnTypeExpanded = {
    format(): unknown;
    precision(): DatePrecision;
};

export type Column = {
    // Depending on column type, supported range is either [number, number] or [column, column].
    // Declaring it as [any, any] is the simplest way.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    range(): [any, any];
    type(): string;
    type(expand: true): ColumnTypeExpanded;
};

export type Metadata = {
    data?: {
        'column-format'?: Record<string, Record<string, unknown>>;
    };
};

export type Overlay = {
    color: number | string;
    opacity: number | `${number}`;
};

type Visualization = {
    dataset: {
        hasColumn(colName: string): boolean;
        column(colName: string): {
            title(): string;
        };
    };
};

type Typography = {
    fontFamilies: Record<
        string,
        {
            name: string;
            weight: number;
            style: string;
        }[]
    >;
};

type FontObject = {
    family: string;
    props: {
        weight: number;
        style: string;
    };
};

export type Theme = {
    colors?: {
        background?: string;
        bgBlendRatios?: {
            axis?: number;
            gridline?: number;
            series?: number;
            tickText?: {
                primary?: number;
                secondary?: number;
            };
            value?: number;
        };
        chartContentBaseColor?: string;
        palette?: string[];
    };
};
