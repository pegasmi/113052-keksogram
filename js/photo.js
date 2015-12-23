'use strict';

(function() {
  /**
   * @param {Object} data
   * @return {Object}
   * @constructor
   */
  function Photo(data) {
    this._data = data;
    this._onPhotoClick = this._onPhotoClick.bind(this);
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

    // Заполнение данными.
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    /**
     * Таймаут ожидания загрузки фотографии.
     * @const
     * @type {number}
     */
    var IMAGE_TIMEOUT = 10000;

    /**
     * @type {Image}
     */
    var backgroundImage = new Image();

    // Задавая src начинаем загрузку.
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

    this.element.addEventListener('click', this._onPhotoClick);

    return this.element;
  };

  /**
   * @param {Event} evt
   * @private
   */
  Photo.prototype._onPhotoClick = function(evt) {
    evt.preventDefault();
    //Клик транслируется вовне только если у элемента есть фотография.
    if (evt.target.classList.contains('picture') &&
      !this.element.classList.contains('picture-load-failure')) {
      //Вызываем коллбэк, который будет переопределен снаружи
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  };

  /**
   * Удаление обработчика клика по фотографии
   * @override
   */
  Photo.prototype.hide = function() {
    this.element.removeEventListener('click', this._onPhotoClick);
  };

  /**
   * @type {?Function}
   */
  Photo.prototype.onClick = null;

  /**
   * TODO: Реализовать
   */
  Photo.prototype.remove = function () {
    // Удалить обработчики на элементе this.element
    this.element.removeEventListener('click', this._onPhotoClick);

    // Удалить элемент this.element из DOM-дерева

  };

  /**
   * Делаем констуктор доступным в глобальной области видимости.
   */
  window.Photo = Photo;
})();
