'use strict';

(function() {
  /**
   * @param {Object} data
   * @return {Object}
   * @constructor
   */
  function Photo(data) {
    this._data = data;
  }

  /**
   * Отрисовкой элемента фотографии в списке. Для каждого элемента создаем DOM-элемент на основе шаблона.
   * @method
   * @return {HTMLElement}
   */
  Photo.prototype.render = function() {

    /**
     * Ссылка на шаблон.
     * @type {HTMLElement}
     */
    var template = document.querySelector('#picture-template');

    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
      //template не является объектом DocumentFragment, и мы имеем дело с IE
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    /**
     * Таймаут ожидания загрузки фотографии.
     * @const {number}
     */
    var IMAGE_TIMEOUT = 10000;

    /**
     * @type {Image}
     */
    var backgroundImage = new Image();

    backgroundImage.src = this._data.url;

    var imageLoadTimeout = setTimeout(function() {
      // Остановка загрузки изображения.
      backgroundImage.src = '';
      this.element.classList.add('picture-load-failure');
    }.bind(this), IMAGE_TIMEOUT);

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      backgroundImage.setAttribute('width', '182');
      backgroundImage.setAttribute('height', '182');
      this.element.replaceChild(backgroundImage, this.element.querySelector('img'));
    }.bind(this);

    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);
  };

  /**
   * Делаем констуктор доступным в глобальной области видимости.
   */
  window.Photo = Photo;
})();
