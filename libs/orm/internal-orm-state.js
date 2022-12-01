let db = null;

exports.setDB = dbInput => {
    db = dbInput;
};

exports.getDB = () => db;
