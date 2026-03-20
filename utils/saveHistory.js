const PriceHistory = require("../models/priceHistoryModel");

module.exports = async function saveHistory({
  productId,
  productName,
  action,
  oldData,
  newData,
  changedBy = "Admin",
}) {
  await PriceHistory.create({
    productId,
    productName,
    action,
    oldData,
    newData,
    changedBy,
  });
};
