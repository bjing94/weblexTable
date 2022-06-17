import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import {
  validateDate,
  validateNumber,
  validateString,
} from "../../helpers/validators";
import { fetchTables, postTable } from "../../services/tableService";
import { transformDate } from "../../helpers/transform-date";

import "./Table.css";

function SortByComponent({ values, currentValue, label, onSelect }) {
  const dropdownItems = values.map(({ key, title }) => {
    return (
      <button
        className={`dropdown-item ${currentValue === key && "active"}`}
        onClick={() => {
          onSelect(key);
        }}
        key={`dropdown-item-${key}`}
      >
        {title}
      </button>
    );
  });
  const displayText = currentValue
    ? values.find(({ key }) => {
        return key === currentValue;
      }).title
    : "Выберите...";
  return (
    <div className="form-group me-3 ">
      <small>{label}</small>
      <div className="dropdown" id="my-dropdown">
        <button
          className="btn btn-primary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {displayText}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {dropdownItems}
          <div className="dropdown-divider"></div>
          <button
            className={`dropdown-item`}
            onClick={() => {
              onSelect(null);
            }}
            key={`dropdown-item-reset`}
          >
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
}

function TableItem({ data }) {
  return (
    <tr>
      <td>{data.row}</td>
      <td>{data.dateCreated}</td>
      <td>{data.title}</td>
      <td>{data.quantity}</td>
      <td>{data.distance}</td>
    </tr>
  );
}

function Pagination({
  currentPage,
  maxPage,
  onSelect,
  onDecrease,
  onIncrease,
}) {
  let pagination = [
    <li
      className="page-item"
      onClick={() => {
        onDecrease();
      }}
      key="page-item-prev"
    >
      <span className="page-link">Предыдущий</span>
    </li>,
  ];
  for (let i = 0; i < maxPage; i++) {
    pagination.push(
      <li
        className={`page-item ${currentPage === i ? "active" : ""}`}
        onClick={() => {
          onSelect(i);
        }}
        key={`page-item-${i}`}
      >
        <span className="page-link">{i + 1}</span>
      </li>
    );
  }
  pagination.push(
    <li
      className="page-item"
      onClick={() => {
        onIncrease();
      }}
      key="page-item-next"
    >
      <span className="page-link">Следующий</span>
    </li>
  );
  return (
    <div className="d-flex justify-content-center">
      <ul className="pagination my-pagination d-flex flex-wrap">
        {pagination}
      </ul>
    </div>
  );
}

export default function Table() {
  const [tableData, setTableData] = useState(null);
  const [filterParameter, setFilterParameter] = useState(null);
  const [filterMethod, setFilterMethod] = useState(null);

  const [sortParameter, setSortParameter] = useState("");
  const [sortValue, setSortValue] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [value, setValue] = useState("");
  const [limit, setLimit] = useState(10);

  const [dateError, setDateError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [distanceError, setDistanceError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const dateRef = useRef(null);
  const titleRef = useRef(null);
  const quantityRef = useRef(null);
  const distanceRef = useRef(null);

  useEffect(() => {
    fetchTableData();
  }, [currentPage, sortParameter, sortValue]);

  async function handleSearch() {
    setCurrentPage(0);
    fetchTableData();
  }

  async function fetchTableData() {
    const data = await (
      await fetchTables(
        value,
        filterMethod,
        filterParameter,
        currentPage + 1,
        limit,
        sortParameter,
        sortValue
      )
    )
      .json()
      .then((data) => {
        setMaxPage(data.totalPages);
        return data.table;
      });
    setTableData(data);
  }

  const tableElements = tableData
    ? tableData.map((data) => {
        return <TableItem data={data} key={data.id} />;
      })
    : null;

  function increasePage() {
    if (currentPage < maxPage - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function decreasePage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  async function handleAddData() {
    setDateError("");
    setTitleError("");
    setQuantityError("");
    setDistanceError("");
    const date = transformDate(dateRef.current.value);
    const title = titleRef.current.value;
    const quantity = +quantityRef.current.value;
    const distance = +distanceRef.current.value;

    if (!validateDate(date)) {
      setDateError("Введите дату в формате дд.мм.гггг!");
      return;
    }

    if (!validateString(title)) {
      setTitleError("Название должно быть строкой и иметь больше 0 символов!");
      return;
    }

    if (!validateNumber(quantity)) {
      setQuantityError("Количество должно быть числом и  больше 0!");
      return;
    }

    if (!validateNumber(distance)) {
      setDistanceError("Расстояние должно быть числом и   больше 0!");
      return;
    }

    const response = await postTable(date, title, quantity, distance);
    if (response.status !== 201) throw new Error("Error adding data!");

    setSuccessMsg("Поле создано!");
    fetchTableData();
  }

  return (
    <div className="d-flex flex-column my-table ">
      <div className="d-flex  row filter-row">
        <div className="col-xs-6 col-sm-auto">
          <SortByComponent
            currentValue={filterParameter}
            onSelect={(value) => {
              setFilterParameter(value);
            }}
            values={[
              { key: "title", title: "Название" },
              { key: "quantity", title: "Количество" },
              { key: "distance", title: "Расстояние" },
            ]}
            label={"Колонка"}
          />
        </div>
        <div className="col-xs-6 col-sm-auto">
          <SortByComponent
            currentValue={filterMethod}
            onSelect={(value) => {
              setFilterMethod(value);
            }}
            values={[
              { key: "equal", title: "Равно" },
              { key: "contain", title: "Содержить" },
              { key: "greater", title: "Больше" },
              { key: "lesser", title: "Меньше" },
            ]}
            label={"Условие"}
          />
        </div>
        <div className="col-xs-12 col-sm-auto  form-group flex-fill me-3">
          <label htmlFor="inputName">Значение</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="inputName"
              aria-describedby="emailHelp"
              placeholder="Значение для фильтрации"
              value={value}
              onInput={(event) => {
                setValue(`${event.currentTarget.value}`);
              }}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Фильтровать
            </button>
          </div>
        </div>
        <div className="col-xs-12 col-sm-auto ">
          <label htmlFor="inputLimit">Лимит</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              id="inputLimit"
              aria-describedby="emailHelp"
              placeholder="Лимит"
              value={limit}
              onInput={(event) => {
                const letters = /^[A-Za-z]+$/;
                if (!event.currentTarget.value.match(letters)) {
                  setLimit(+event.currentTarget.value);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table my-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>
                <div className="d-flex w-100 justify-content-between">
                  Название
                  <div className="d-flex flex-column">
                    <button
                      className={`btn btn-${
                        sortParameter === "title" && sortValue === "dsc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("title");
                        setSortValue("dsc");
                      }}
                    >
                      ˄
                    </button>
                    <button
                      className={`btn btn-${
                        sortParameter === "title" && sortValue === "asc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("title");
                        setSortValue("asc");
                      }}
                    >
                      ˅
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="d-flex w-100 justify-content-between">
                  Количество
                  <div className="d-flex flex-column">
                    <button
                      className={`btn btn-${
                        sortParameter === "quantity" && sortValue === "dsc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("quantity");
                        setSortValue("dsc");
                      }}
                    >
                      ˄
                    </button>
                    <button
                      className={`btn btn-${
                        sortParameter === "quantity" && sortValue === "asc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("quantity");
                        setSortValue("asc");
                      }}
                    >
                      ˅
                    </button>
                  </div>
                </div>
              </th>
              <th>
                <div className="d-flex w-100 justify-content-between">
                  Расстояние
                  <div className="d-flex flex-column">
                    <button
                      className={`btn btn-${
                        sortParameter === "distance" && sortValue === "dsc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("distance");
                        setSortValue("dsc");
                      }}
                    >
                      ˄
                    </button>
                    <button
                      className={`btn btn-${
                        sortParameter === "distance" && sortValue === "asc"
                          ? "primary"
                          : "secondary"
                      } sort-button`}
                      onClick={() => {
                        setSortParameter("distance");
                        setSortValue("asc");
                      }}
                    >
                      ˅
                    </button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableElements}
            <tr>
              <td></td>
              <td>
                <div className="d-flex flex-column">
                  <input ref={dateRef} type="date" placeholder="dd.mm.yyyy" />
                  <small>{dateError}</small>
                </div>
              </td>
              <td>
                <div className="d-flex flex-column">
                  <input ref={titleRef} type="text" placeholder="Название" />
                  <small>{titleError}</small>
                </div>
              </td>
              <td>
                <div className="d-flex flex-column">
                  <input
                    ref={quantityRef}
                    type="text"
                    placeholder="Количество"
                  />
                  <small>{quantityError}</small>
                </div>
              </td>
              <td>
                <div className="d-flex flex-column">
                  <input
                    ref={distanceRef}
                    type="text"
                    placeholder="Расстояние"
                  />
                  <small>{distanceError}</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <h4>{successMsg}</h4>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-primary" onClick={handleAddData}>
          Добавить
        </button>
      </div>
      {maxPage > 1 && (
        <Pagination
          maxPage={maxPage}
          currentPage={currentPage}
          onSelect={(i) => {
            setCurrentPage(i);
          }}
          onDecrease={decreasePage}
          onIncrease={increasePage}
        />
      )}
    </div>
  );
}
