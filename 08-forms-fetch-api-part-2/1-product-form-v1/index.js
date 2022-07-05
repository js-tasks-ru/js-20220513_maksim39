import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
    // this.render();

  }

  async render() {
    const div = document.createElement("div");
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();
    this.formFields = this.getFormFields();
    this.initEventListeners();
    this.loadData();
    return this.element;
  }

  getTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list"></ul></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }

  getFormFields() {
    const result = {};
    const elements = this.element.querySelectorAll('.form-control');
    for (const elem of elements) {
      const name = elem.name;
      result[name] = elem;
    }
    return result;
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

  initEventListeners() {
    this.element.addEventListener('click', event => {
      event.preventDefault();
      const removeBtn = event.target.closest("[data-delete-handle]");
      const formBtn = event.target.closest(".button-primary-outline");
      const saveBtn = formBtn && formBtn.name === 'save';
      const uploadImageBtn = formBtn && formBtn.name === 'uploadImage';
      if (removeBtn) {
        const imageElement = event.target.closest(".sortable-list__item");
        if (imageElement) {
          imageElement.remove();
          delete this.images[imageElement.children[1].value];
        }
      } else if (saveBtn) {
        this.onSubmit(event);
      } else if (uploadImageBtn) {
        this.uploadImage();
      }
    });
  }

  async loadData() {
    const categories = await this.loadSubcategories();
    this.subElements.productForm['subcategory'].innerHTML = this.getSubcategoryTemplate(categories);
    if (this.productId) {
      const productResponse = await this.loadProduct(this.productId);
      if (productResponse.length) {
        this.updatePage(productResponse[0]);
      }
    }
  }

  async loadSubcategories() {
    const url = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    return await fetchJson(url, {
      method: 'GET',
      mode: 'cors'
    });
  }

  getSubcategoryTemplate(categories) {
    let result = '';
    for (const category of categories) {
      if (category.subcategories) {
        result = result + category.subcategories
          .map(subcategory => `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`).join("");
      }
    }
    return result;
  }

  async loadProduct(productId) {
    const url = new URL('/api/rest/products?', BACKEND_URL) + new URLSearchParams({
      id: productId
    });
    return await fetchJson(url, {
      method: 'GET',
      mode: 'cors'
    });
  }

  updatePage(product) {
    Object.entries(this.formFields).forEach(entry => entry[1].value = product[entry[0]]);
    this.subElements.imageListContainer.firstElementChild.innerHTML = this.getImages(product.images);
    this.images = Object.fromEntries([...product.images].map(obj => [obj.source, obj]));

  }

  getImages(images) {
    return images.map(image => this.getImageTemplate(image.url, image.source)).join("");
  }

  getImageTemplate(url, source) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${url}">
                <span>${source}</span>
            </span>
            <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
        </li>`;
  }

  uploadImage() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.hidden = true;
    fileInput.addEventListener('change', async () => {
      let formData = new FormData();
      let file = fileInput.files[0];
      formData.append("image", file);
      const uploadImageClassList = this.subElements.productForm.uploadImage.classList;
      uploadImageClassList.add("is-loading");
      const uploadResponse = await fetchJson("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData,
      });
      uploadImageClassList.remove("is-loading");

      const imageLink = uploadResponse.data.link;
      this.subElements.imageListContainer.firstElementChild.append(this.createImageItem(imageLink, file.name));
      this.images[file.name] = {source: file.name, url: imageLink};
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  createImageItem(url, source) {
    const div = document.createElement("div");
    div.innerHTML = this.getImageTemplate(url, source);
    return div.firstElementChild;
  }

  onSubmit(event) {
    event.preventDefault();
    this.save();
  }

  async save() {
    const formData = this.getFormData();
    const response = await fetchJson(new URL('/api/rest/products', BACKEND_URL), {
      method: this.productId ? 'PATCH' : 'PUT',
      mode: 'cors',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
    this.element.dispatchEvent(this.productId
      ? new CustomEvent("product-saved")
      : new CustomEvent("product-updated", {detail: response.id}));
  }

  getFormData() {
    const result = Object.fromEntries(Object.entries(this.formFields).map(pairs => [pairs[0], pairs[1].value]));
    result.images = Object.values(this.images);
    return result;
  }

  destroy() {
    this.element = null;
  }
}
