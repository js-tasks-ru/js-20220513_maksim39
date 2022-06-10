import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  loadingClass = "column-chart_loading";

  constructor({
    url = '',
    label = '',
    link = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    formatHeading = data => data,
  } = {}) {
    this.url = url;
    this.label = label;
    this.link = link;
    this.range = range;
    this.formatHeading = formatHeading;
    this.data = [];

    this.update(range.from, range.to);
    this.render();
  }

  get template() {
    return `
      <div class="column-chart ${this.loadingClass}" style="--chart-height: ${ this.chartHeight }">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
           <div data-element="header" class="column-chart__header">
             ${this.value}
           </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody()}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.template;

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

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = ((item / maxValue) * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(
          item * scale
        )}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  update(from, to) {
    const url = BACKEND_URL + this.url + '?' + new URLSearchParams({
      from: from,
      to: to,
    });
    return fetchJson(url, {
      method: 'GET',
      mode: 'cors'
    })
      .then(data => {
        this.data = Object.values(data);
        this.value = this.data.length ? this.formatHeading(Object.values(data).reduce((a, b) => a + b)) : '';

        this.updateView();
        return data;
      });
  }


  updateView() {
    this.subElements.header.innerText = this.value;
    this.subElements.body.innerHTML = this.getColumnBody();
    if (this.data.length) {
      this.element.classList.remove(this.loadingClass);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
