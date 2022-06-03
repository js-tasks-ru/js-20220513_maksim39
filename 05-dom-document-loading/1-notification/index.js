export default class NotificationMessage {
  static staticElement;

  constructor(value, {
    duration = 20,
    type = 'success',
  } = {}) {
    this.duration = duration;
    this.type = type;
    this.value = value;
    this.init();
  }

  init() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  getTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.duration}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">success</div>
      <div class="notification-body">
        ${this.value}
      </div>
    </div>
  </div>`;
  }

  show(elem) {
    this.remove();
    if (elem) {
      elem.append(this.element);
    } else {
      document.body.append(this.element);
    }
    NotificationMessage.staticElement = this.element;
    setTimeout(() => this.element.remove(), this.duration * 1000);
  }

  remove() {
    if (NotificationMessage.staticElement) {
      NotificationMessage.staticElement.remove();
      NotificationMessage.staticElement = null;
    } else {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }

}
