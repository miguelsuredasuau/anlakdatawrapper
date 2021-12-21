const SQ = require('sequelize');

module.exports = {
    id: { type: SQ.STRING(5), primaryKey: true },
    type: SQ.STRING,
    title: SQ.STRING,
    theme: SQ.STRING,

    guest_session: SQ.STRING,

    last_edit_step: SQ.INTEGER,

    published_at: SQ.DATE,
    public_url: SQ.STRING,
    public_version: SQ.INTEGER,

    deleted: SQ.BOOLEAN,
    deleted_at: SQ.DATE,

    forkable: SQ.BOOLEAN,
    is_fork: SQ.BOOLEAN,

    metadata: SQ.JSON,
    language: SQ.STRING(5),
    external_data: SQ.STRING(),

    // The value of the 'keywords' column is set automatically by a TRIGGER; see
    // 016-chart-title-index.sql. Therefore any changes you make to this column value using the ORM
    // will be overwritten.
    keywords: SQ.TEXT(),

    utf8: SQ.BOOLEAN
};
