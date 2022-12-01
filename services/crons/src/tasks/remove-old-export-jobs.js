const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { ExportJob } = require('@datawrapper/orm/db');
const logger = require('../logger');

module.exports = async () => {
    const createdAgo = SQ.fn('DATEDIFF', SQ.fn('NOW'), SQ.col('created_at'));

    const oldExportJobs = {
        where: SQ.where(createdAgo, Op.gt, 5)
    };

    const numDeleted = await ExportJob.destroy(oldExportJobs);

    if (numDeleted > 0) {
        logger.info(`removed ${numDeleted} old export jobs.`);
    }
};
