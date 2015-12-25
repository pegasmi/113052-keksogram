'use strict';

(function() {
  /**
   * Функция-конструктор для галереи.
   * @constructor
   */
  function Gallery() {
    /**
     * Галерея на странице
     * @type {Element}
     */
    this.element = document.querySelector('.gallery-overlay');

    /**
     * Крест для закрытия галереи
     * @type {Event}
     */
    this._closeButton = document.querySelector('.gallery-overlay-close');

    /**
     * Контейнер для фотографии
     * @type {Element}
     */
    this._photoImage = this.element.querySelector('.gallery-overlay-image');

    this._likes = document.querySelector('.gallery-overlay-controls-like');
    this._comments = document.querySelector('.gallery-overlay-controls-comments');

    /**
     * Список фотографий из json
     * @type {Array}
     */
    this.pictures = [];

    /**
     * Текущая фотография
     * @type {Number}
     */
    this._currentImage = 0;

    this._onCloseClick = this._onCloseClick.bind(this);
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
   * Обработчик клика по кресту.
   * @method
   * @private
   */
  Gallery.prototype._onCloseClick = function() {
    location.hash = '';
  };

  /**
   * Обработчик клика по фотографии.
   * @method
   * @private
   */

  Gallery.prototype._onPhotoClick = function() {
    if (this.pictures[this._currentImage + 1]) {
      this._setHash(this.pictures[++this._currentImage].url);
    } else {
      this._currentImage = 0;
      this._setHash(this.pictures[this._currentImage].url);
    }
  };

  /**
   * Mетод принимает на вход массив фотографий из json и сохраняет его в объекте.
   * @param {Array.<Object>} pictures
   * @method
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * Mетод принимает на вход массив фотографий из json и сохраняет его в объекте
   * @param {number} index
   * @method
   */
  Gallery.prototype.setCurrentPicture = function(index) {
    var picture;
    if (typeof key === 'number') {
      picture = this.pictures[index];
    } else {
      for (var i = 0; i < this.pictures.length; i++) {
        if (this.pictures[i].url === index) {
          picture = this.pictures[i];
          break;
        }
      }
    }
    console.log(index);
    this._photoImage.src = picture.url;
    this._likes.querySelector('.likes-count').textContent = picture.likes;
    this._comments.querySelector('.comments-count').textContent = picture.comments;
  };

  /**
   * Обработчик нажатия на клавишу Esc.
   * @method
   * @private
   * @param {KeyboardEvent} evt
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    // Esc
    if (evt.keyCode === 27) {
      //this.hide();
      location.hash = '';
    }
    // Стрелка вправо
    if (evt.keyCode === 39) {
      if (this._currentImage === this.pictures.length - 1) {
        this._currentImage = 0;
        this._setHash(this.pictures[this._currentImage].url);
      } else {
        this._setHash(this.pictures[++this._currentImage].url);
      }
    }
    // Стрелка влево
    if (evt.keyCode === 37) {
      if (this._currentImage === 0) {
        this._currentImage = this.pictures.length - 1;
        this._setHash(this.pictures[this._currentImage].url);
      } else {
        this._setHash(this.pictures[--this._currentImage].url);
      }
    }
  };

  /**
   * Добавление hash в адресную строку.
   * @param {string} hash
   * @private
   */
  Gallery.prototype._setHash = function(hash) {
    location.hash = hash ? 'photo/' + hash : '';
  };

  /**
   * Делаем конструктор доступным в глобальной области видимости.
   */
  window.Gallery = Gallery;
})();
