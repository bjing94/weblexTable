function validateString(str) {
  if (typeof str !== "string" || str.length <= 0) return false;
  return true;
}

function validateNumber(num) {
  if (typeof num !== "number" || num <= 0) return false;
  return true;
}

function validateDate(date) {
  let listOfDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const splitDate = date.split(".");
  const day = +splitDate[0];
  const month = +splitDate[1];
  const year = splitDate[2];

  if (day <= 0 && day > listOfDays[month]) return false;
  if (month <= 0 && month > 12) return false;
  if (year.length !== 4) return false;
  return true;
}

function validateMethod(method) {
  const validMethods = ["equal", "contain", "greater", "lesser"];
  return validMethods.includes(method) || method === null;
}

function validateParameter(parameter) {
  const validParameters = ["dateCreated", "title", "quantity", "distance"];
  return validParameters.includes(parameter) || parameter === null;
}

function validateSortParameter(parameter) {
  const validSorts = ["title", "quantity", "distance"];
  return validSorts.includes(parameter) || parameter === null;
}

function validateSortValue(value) {
  const validSorts = ["asc", "dsc"];
  return validSorts.includes(value) || value === null;
}

module.exports = {
  validateString,
  validateNumber,
  validateDate,
  validateMethod,
  validateParameter,
  validateSortParameter,
  validateSortValue,
};
