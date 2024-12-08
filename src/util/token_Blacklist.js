module.exports = function blackList(token) {
  const blackList = new Set();
  if (token) blackList.add(token);

  return blackList;
};
