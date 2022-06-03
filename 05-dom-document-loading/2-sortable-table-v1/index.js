export default class SortableTable {
  subElements = {};
  sortData = this.createSortData();

  constructor(headerConfig = [], data = []) {
    this.headerConfig = this.getHeaderConfig(headerConfig);
    this.data = data;
    this.render();
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
      return `<div class="sortable-table__cell" data-id="${headerCell.id}" data-sortable="${headerCell.sortable}">
        <span>${headerCell.title}</span>
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

  omit(obj, ...fields) {
    return Object.fromEntries(Object.entries(obj).filter(item => !fields.includes(item[0])));
  }

  getColumnItems(dataElement) {
    const result = [];
    if (this.headerConfig.images) {
      result.push(this.headerConfig.images.template(dataElement.images));
    }
    for (const key in this.omit(this.headerConfig, "images")) {
      const value = dataElement[key];
      if (value) {
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}

