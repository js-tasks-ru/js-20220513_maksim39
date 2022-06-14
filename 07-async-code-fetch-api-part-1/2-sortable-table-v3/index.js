import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {
  pageSize = 30;
  subElements = {};
  sortData = this.createSortData();
  mouseListener = this.createMouseListener();
  scrollListener = () => {
    if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight) {
      this.loadData(this.currentColumn.id, this.currentColumn.order);
    }
  };

  constructor(
    headerConfig = [],
    {
      url = '',
      isSortLocally = true
    } = {}) {
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.data = [];
    this.currentColumn = {};
    const sortableColumn = this.parseHeaderConfig(headerConfig);
    this.render();
    this.loadData(sortableColumn.id, 'asc');
    this.initEventListeners();
    this.sort(sortableColumn.id, 'asc');

  }

  parseHeaderConfig(config) {
    const result = {};
    let sortableColumn;
    for (const item of config) {
      result[item.id] = item;
      if (item.sortable) {
        sortableColumn = item;
      }
    }
    this.headerConfig = result;
    return sortableColumn;
  }

  getTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.getHeader()}
    </div>

    <div data-element="body" class="sortable-table__body">
    ${this.getBody(this.data)}
    </div>

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>

  </div>
</div>`;
  }

  getHeader() {
    return Object.values(this.headerConfig).map(headerCell => {
      const order = headerCell.sortable ? 'data-order="asc"' : '';
      return `<div class="sortable-table__cell" data-id="${headerCell.id}" data-sortable="${headerCell.sortable}" ${order}>
        <span>${headerCell.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
    })
      .join("");
  }

  getBody(data) {
    return data.map(dataElement => {
      return `<a href="/products/${dataElement.id}" class="sortable-table__row">
        ${this.getColumnItems(dataElement)}
      </a>`;
    })
      .join("");
  }

  getColumnItems(dataElement) {
    const result = [];
    for (const key in this.headerConfig) {
      const template = this.headerConfig[key].template;
      if (template) {
        result.push(template(dataElement[key]));
      } else {
        const value = dataElement[key] !== undefined ? dataElement[key] : '';
        result.push(`<div class="sortable-table__cell">${value}</div>`);
      }
    }
    return result.join("");
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  loadData(id, order) {
    const start = this.data.length;
    const end = start + this.pageSize;
    const url = BACKEND_URL + this.url + '?_embed=subcategory.category&' + new URLSearchParams({
      _sort: id,
      _order: order,
      _start: start,
      _end: end
    });
    return fetchJson(url, {
      method: 'GET',
      mode: 'cors'
    })
      .then(data => {
        this.data = this.data.concat(data);
        this.subElements.body.innerHTML = this.getBody(this.data);
        return data;
      });
  }

  sort(id, order) {
    this.currentColumn.id = id;
    this.currentColumn.order = order;
    this.isSortLocally ? this.sortOnClient(id, order) : this.sortOnServer(id, order);
  }

  sortOnClient(id, order = 'asc') {
    const newData = this.sortData(id, order);
    this.subElements.body.innerHTML = this.getBody(newData);
  }

  sortOnServer(id, order) {
    this.loadData(id, order);
  }

  createSortData() {
    const directionObj = {
      asc: 1,
      desc: -1
    };
    return function (field, order) {
      const direction = directionObj[order];

      function compareBySortType(a, b, sortType) {
        switch (sortType) {
        case 'string' :
        default :
          return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
        case 'number' :
          return a - b;
        }
      }

      return [...this.data].sort((el1, el2) =>
        direction * compareBySortType(el1[field], el2[field], this.headerConfig[field].sortType));
    };
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.mouseListener);
    document.addEventListener("scroll", this.scrollListener);
  }

  createMouseListener() {
    const nextOrderObj = {
      asc: 'desc',
      desc: 'asc'
    };
    return event => {
      const target = event.target.closest('div');
      if (!target) {
        return;
      }
      const dataset = target.dataset;
      const field = dataset.id;
      const order = dataset.order;
      if (!field || !order) {
        return;
      }
      const nextOrder = nextOrderObj[order];
      dataset.order = nextOrder;
      this.data = [];
      this.sortOnServer(field, nextOrder);
    };
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener("scroll", this.scrollListener);
  }
}
