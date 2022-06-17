export async function fetchTables(
  value,
  method,
  parameter,
  page,
  limit,
  sortParameter,
  sortValue
) {
  const valueQuery = value ? `value=${value}` : "";
  const methodQuery = method ? `method=${method}` : "";
  const parameterQuery = parameter ? `parameter=${parameter}` : "";
  const pageQuery = page ? `page=${page}` : "";
  const limitQuery = limit ? `limit=${limit}` : "";
  const sortQuery =
    sortParameter && sortValue
      ? `sortParameter=${sortParameter}&sortValue=${sortValue}`
      : "";

  const finalQuery = [
    valueQuery,
    methodQuery,
    parameterQuery,
    pageQuery,
    limitQuery,
    sortQuery,
  ]
    .filter((item) => item !== "")
    .join("&");

  return fetch(`${process.env.REACT_APP_BACKEND_API}/table?${finalQuery}`);
}

export async function postTable(dateCreated, title, quantity, distance) {
  return fetch(`${process.env.REACT_APP_BACKEND_API}/table`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ dateCreated, title, quantity, distance }),
  });
}
