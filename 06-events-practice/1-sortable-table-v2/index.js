export default class SortableTable {
  subElements = {};
  sortData = this.createSortData();
  mouseListener = this.createMouseListener();

  constructor(
    headerConfig = [],
    {
      data = {},
      sortable = {}
    } = {}) {
    this.headerConfig = this.getHeaderConfig(headerConfig);
    this.data = data;
    if (sortable.id && sortable.order) {
      this.sort(sortable.id, sortable.order);
    }
    this.render();
    this.initEventListeners();
  }

  getHeaderConfig(config) {
    const result = {};
    for (const item of config) {
      result[item.id] = item;
    }
    return result;
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

  sort(field, order = 'asc') {
    const newData = this.sortData(field, order);
    this.subElements.body.innerHTML = this.getBody(newData);
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
      this.sort(field, nextOrder);
    };
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements.header.removeEventListener("pointerdown", this.mouseListener);
  }
}

