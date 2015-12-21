'use strict';

(function() {
  /**
   * Функция-конструктор для галереи.
   * @constructor
   */
  function Gallery() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._onCloseClick = this._onCloseClick.bind(this);
    this._photoImage = this.element.querySelector('.gallery-overlay-image');
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
  }

  /**
   * Показ галереи.
   * @method
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._photoImage.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи.
   * @method
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._photoImage.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Обработчик клика по крестику.
   * @method
   * @private
   */
  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  /**
   * Обработчик клика по фотографии.
   * @method
   * @private
   */
  Gallery.prototype._onPhotoClick = function() {
  };

  /**
   * Обработчик нажатия на клавишу Esc.
   * @method
   * @private
   * @param {KeyboardEvent} e
   */
  Gallery.prototype._onDocumentKeyDown = function(e) {
    if (e.keyCode === 27) {
      this.hide();
    }
  };

  /**
   * Делаем конструктор доступным в глобальной области видимости.
   */
  window.Gallery = Gallery;
})();
