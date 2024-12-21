const BlackList = require("../models/blackList_model");

module.exports = async function blackList(token) {
  if (token) new BlackList( { token } ).save();

  return blackList;
};
