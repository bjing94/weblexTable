export function validateString(str) {
  if (typeof str !== "string" || str.length <= 0) return false;
  return true;
}

export function validateNumber(num) {
  if (typeof num !== "number" || num <= 0 || Number.isNaN(num)) return false;
  return true;
}

export function validateDate(date) {
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
