import SQ from 'sequelize';
export declare const chartAttributes: {
    readonly id: {
        readonly type: SQ.StringDataType;
        readonly primaryKey: true;
    };
    readonly type: SQ.StringDataTypeConstructor;
    readonly title: SQ.StringDataTypeConstructor;
    readonly theme: SQ.StringDataTypeConstructor;
    readonly guest_session: SQ.StringDataTypeConstructor;
    readonly last_edit_step: SQ.IntegerDataTypeConstructor;
    readonly published_at: SQ.DateDataTypeConstructor;
    readonly public_url: SQ.StringDataTypeConstructor;
    readonly public_version: SQ.IntegerDataTypeConstructor;
    readonly deleted: SQ.AbstractDataTypeConstructor;
    readonly deleted_at: SQ.DateDataTypeConstructor;
    readonly forkable: SQ.AbstractDataTypeConstructor;
    readonly is_fork: SQ.AbstractDataTypeConstructor;
    readonly metadata: SQ.AbstractDataTypeConstructor;
    readonly language: SQ.StringDataType;
    readonly external_data: SQ.StringDataType;
    readonly utf8: SQ.AbstractDataTypeConstructor;
    readonly createdAt: SQ.DateDataTypeConstructor;
};
