const { db } = require('@datawrapper/orm');
const { Op } = db;
const { ExportJob } = require('@datawrapper/orm/models');
const logger = require('../logger');

module.exports = async () => {
    const createdAgo = db.fn('DATEDIFF', db.fn('NOW'), db.col('created_at'));

    const oldExportJobs = {
        where: db.where(createdAgo, Op.gt, 5)
    };

    const numDeleted = await ExportJob.destroy(oldExportJobs);

    if (numDeleted > 0) {
        logger.info(`removed ${numDeleted} old export jobs.`);
    }
};
