class Tooltip {
  moveListener = event => {
    this.element.style.top = (event.clientY + 10) + 'px';
    this.element.style.left = (event.clientX + 10) + 'px';
  };
  outListener = () => {
    this.element.remove();
    document.removeEventListener("pointermove", this.moveListener);
  };
  overListener = event => {
    const tooltipValue = event.target.dataset.tooltip;
    if (!tooltipValue) {
      return;
    }
    this.render(tooltipValue);
    document.addEventListener("pointermove", this.moveListener);
  };

  constructor() {
    if (typeof Tooltip.instance === 'object') {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
    return Tooltip.instance;
  }


  initialize() {
    document.addEventListener("pointerover", this.overListener);
    document.addEventListener("pointerout", this.outListener);
  }

  render(value) {
    const element = document.createElement("div");
    element.innerHTML = `<div class="tooltip">${value}</div>`;
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener("pointerover", this.overListener);
    document.removeEventListener("pointerout", this.outListener);
  }
}

export default Tooltip;
