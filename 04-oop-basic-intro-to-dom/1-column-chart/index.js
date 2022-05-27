export default class ColumnChart {
  constructor(props) {
    this.chartHeight = 50;
    this.props = this.init(props);
    this.render();
    this.initEventListeners();
  }

  init(props) {
    const defaultProps = {
      data: [],
      label: '',
      link: '',
      value: 0,
      formatHeading: value => value
    };
    if (props === undefined) {
      return defaultProps;
    }
    for (const key in props) {
      defaultProps[key] = props[key];
    }
    return defaultProps;
  }

  getTemplate() {
    const stubStyle = this.props.data.length === 0 ? 'column-chart_loading' : '';
    const link = this.props.link !== '' ? `<a href="${this.props.link}" class="column-chart__link">View all</a>` : '';
    return `
            <div class="column-chart ${stubStyle}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.props.label}
                    ${link}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.props.formatHeading(this.props.value)}</div>
                    <div data-element="body" class="column-chart__chart"></div>
                </div>
            </div>
    `;
  }

  getDataDiv(columnValue) {
    const element = document.createElement("div");
    element.style.setProperty('--value', columnValue.value);
    element.setAttribute("data-tooltip", columnValue.percent);
    return element;
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  render() {
    const element = document.createElement("div");//(*)
    element.innerHTML = this.getTemplate();

    this.updateColumns(this.getColumnProps(this.props.data), element);

    //NOTE: в этой строке мы избавимся от обертки-пустышки в виде div
    // которой мы создали на строке (*)
    this.element = element.firstElementChild;
  }

  update(columnValues) {
    this.updateColumns(columnValues, document);
  }

  updateColumns(columnValues, element) {
    const container = element.querySelector(".column-chart__chart");
    container.innerHTML = '';
    for (const columnValue of columnValues) {
      container.append(this.getDataDiv(columnValue));
    }
  }

  initEventListeners() {
    //NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    //NOTE: удаляем обработчики событий, если они есть
  }
}


