const express = require("express");
const cors = require("cors");
const mockTableData = require("./database/tablesDB");
const {
  validateDate,
  validateNumber,
  validateString,
  validateMethod,
  validateParameter,
  validateSortParameter,
  validateSortValue,
} = require("./helpers/validators");

const app = express();

function filterBy(data, value, method, parameter) {
  if (!method || !parameter) return data;

  switch (method) {
    case "equal":
      return data.filter((data) => {
        return data[parameter] == value;
      });
    case "contain":
      return data.filter((data) => {
        const par1 = String(data[parameter]).toLowerCase();
        const par2 = String(value).toLowerCase();
        return par1.includes(par2);
      });
    case "greater":
      return data.filter((data) => {
        if (parameter === "distance" || parameter === "quantity") {
          return +data[parameter] > +value;
        } else {
          return String(data[parameter]).localeCompare(value) > 0;
        }
      });
    case "lesser":
      return data.filter((data) => {
        if (parameter === "distance" || parameter === "quantity") {
          return +data[parameter] < +value;
        } else {
          return String(data[parameter]).localeCompare(value) < 0;
        }
      });
    default:
      return data;
  }
}

function sortBy(data, sortParameter, value) {
  if (!sortParameter || !value) return data;

  const sortData = [...data];
  switch (value) {
    case "asc":
      return sortData.sort((a, b) => {
        if (sortParameter === "distance" || sortParameter === "quantity") {
          return +a[sortParameter] - +b[sortParameter];
        } else {
          return -1 * String(a[sortParameter]).localeCompare(b[sortParameter]);
        }
      });
    case "dsc":
      return sortData.sort((a, b) => {
        if (sortParameter === "distance" || sortParameter === "quantity") {
          return +b[sortParameter] - +a[sortParameter];
        } else {
          return String(a[sortParameter]).localeCompare(b[sortParameter]);
        }
      });
    default:
      return data;
  }
}
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/table", (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;

  let value = req.query.value || "";
  let method = req.query.method || null;
  let parameter = req.query.parameter || null;

  let sortParameter = req.query.sortParameter || null;
  let sortValue = req.query.sortValue || null;

  // Фильтрация
  if (!validateMethod(method)) {
    res.status(400).send({
      message: "Неверный метод фильтрации!",
    });
    return;
  }
  if (!validateParameter(parameter)) {
    res.status(400).send({
      message: "Неверный параметр фильтрации!",
    });
    return;
  }
  let filteredData = filterBy(mockTableData, value, method, parameter);

  // Сортировка
  if (!validateSortParameter(sortParameter)) {
    res.status(400).send({
      message: "Неверный параметр сортировки!",
    });
    return;
  }
  if (!validateSortValue(sortValue)) {
    res.status(400).send({
      message: "Неверное значение сортировки!",
    });
    return;
  }
  let sortedData = sortBy(filteredData, sortParameter, sortValue);

  // Пагинация
  const totalPages = Math.floor(sortedData.length / limit);

  const from = (page - 1) * limit;
  const to =
    page * limit > sortedData.length ? sortedData.length : page * limit;

  // Отправка результата
  res.send({
    table: sortedData.slice(from, to).map((data, idx) => {
      return { ...data, row: idx + 1 + (page - 1) * limit };
    }),
    page: page,
    totalPages: totalPages,
  });
});

app.post("/table", (req, res) => {
  if (!validateString(req.body.title)) {
    res.status(400).send({
      message: "Название не может быть пустым",
    });
    return;
  }
  if (!validateDate(req.body.dateCreated)) {
    res.status(400).send({
      message: "Дата неверного формата. Должна быть: дд.мм.гггг",
    });
    return;
  }
  if (!validateNumber(+req.body.quantity)) {
    res.status(400).send({
      message: "Количество должно быть больше 0",
    });
    return;
  }
  if (!validateNumber(+req.body.distance)) {
    res.status(400).send({
      message: "Расстояние должно быть больше 0",
    });
    return;
  }
  mockTableData.push(req.body);
  res.status(201).send({
    message: "Поле добавлено успешно!",
  });
});

app.listen(5000, () => {
  console.log("server online on port", 5000);
});
