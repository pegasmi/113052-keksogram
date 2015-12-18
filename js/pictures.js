/* global Photo: true */

'use strict';

(function() {

  var picturesDomElem = document.querySelector('.pictures');
  var filtersDomElem = document.querySelector('.filters');

  /**
   * @type {Array}
   */
  var cachedPictures;

  var currentFilter;
  var currentPage;
  var MAX_PICTURES_PER_PAGE = 12;

  var scrollTimeout;

  init();


  function init() {
    console.log('init');

    cachedPictures = [];
    currentFilter = 'filter-all';
    currentPage = 0;


    // Прячем блок с фильтрами .filters, добавляя ему класс hidden.
    if (!filtersDomElem.classList.contains('hidden')) {
      filtersDomElem.classList.add('hidden');
    }

    // Показать все фотографии
    getPictures(
      // callback (begin)
      function() {
        // Допущение, что фотографии сохранились в cachedPictures, см код getPictures
        renderPage(currentPage);
      }
      // callback (end)
    );

    // Отрисовка фотографий по смене фильтра
    filtersDomElem.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;

      if (clickedFilter.classList.contains('filters-radio')) {
        if (currentFilter === clickedFilter.id) {
          return;
        }

        currentFilter = clickedFilter.id;

        // TODO: переписать на getPictures() вместо cachedPictures
        var filteredPictures = filterPictures(cachedPictures, clickedFilter.id);

        renderPictures(filteredPictures, { replace: true });

      }
    });

    // Подгрузить фото при скроле
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(renderPagesPerScreen, 100);
    });


    // Показываем блок с фильтрами .filters, удаляя класс hidden.
    if (filtersDomElem.classList.contains('hidden')) {
      filtersDomElem.classList.remove('hidden');
    }
  }

  /**
   * Показывает фотографии на текущей странице
   */
  function renderPagesPerScreen() {
    console.log('renderPagesPerScreen');

    // Положение контейнера относительно экрана.
    var containerCoordinates = picturesDomElem.getBoundingClientRect();

    var viewportSize = window.innerHeight;
    var isPagesBottomReached = containerCoordinates.bottom > viewportSize;

    // TODO: переписать на getPictures() вместо cachedPictures
    var picturesFiltered = filterPictures(cachedPictures, currentFilter);

    var isExistPicturesToShow = currentPage < Math.ceil(picturesFiltered.length / MAX_PICTURES_PER_PAGE);

    // Проверяем виден ли нижний край контейнера и есть фотографии для показа
    if (!isPagesBottomReached && isExistPicturesToShow) {
      renderPage(++currentPage);
    }
  }

  /**
   * Показывает страницу `pageNumber`
   *
   * @param {Number} pageNumber Номер страницы для показа
   */
  function renderPage(pageNumber) {
    console.log('renderPage: ', pageNumber);


    var picturesFiltered = filterPictures(cachedPictures, currentFilter);

    var firstPictureIndex = pageNumber * MAX_PICTURES_PER_PAGE;
    var lastPictureIndex = firstPictureIndex + MAX_PICTURES_PER_PAGE;

    // Фото lastPictureIndex не будет включено
    var pagePictures = picturesFiltered.slice(firstPictureIndex, lastPictureIndex);

    renderPictures(pagePictures);
  }

  /**
   * Показывает фотографии в picturesDomElem
   *
   * @param {Array} pictures
   * @param {Object} [options]
   * @param {Boolean} [options.replace=] Флаг замены, если true, будет обновление
   */
  function renderPictures(pictures, options) {
    console.log('renderPictures');

    options = options || {};

    if (options.replace) {
      var renderedPictures = picturesDomElem.querySelectorAll('.picture');
      Array.prototype.forEach.call(renderedPictures, function(el) {
        picturesDomElem.removeChild(el);
      });
    }

    var fragment = document.createDocumentFragment();

    pictures.forEach(function(picture) {
      var photoElement = new Photo(picture);
      photoElement.render();
      fragment.appendChild(photoElement.element);
    });

    picturesDomElem.appendChild(fragment);
  }

  /**
   * Получает фотографии по ajax-запросу
   *
   * @param {Function} callback Обработчик асинхронного получения фотографий
   *
   * @callback callback(Array)
   */
  function getPictures(callback) {
    console.log('getPictures');


    // Показ прелоадера пока длится загрузка файла.
    informGetPicturesStatus('loading');

    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'data/pictures.json');

    xhr.onload = function(evt) {
      informGetPicturesStatus('success');

      var pictures = JSON.parse(evt.target.response);

      cachedPictures = pictures;

      /*
       function(pictures) {
       var filteredPictures = filterPictures(pictures, currentFilter);
       renderPictures(filteredPictures);
       }
       * */

      callback(pictures);
    };

    xhr.onerror = function() {
      informGetPicturesStatus('error');
    };

    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      informGetPicturesStatus('error');
    };

    xhr.send();
  }

  /**
   *  Показывает статус запроса за фотографиями
   *
   * @param {String} message Сообщение
   */
  function informGetPicturesStatus(message) {
    console.log('informGetPicturesStatus: ', message);

    switch (message) {
      case 'error':
        picturesDomElem.classList.remove('pictures-loading');
        picturesDomElem.classList.add('pictures-failure');
        break;

      case 'success':
        picturesDomElem.classList.remove('pictures-loading');
        picturesDomElem.classList.remove('pictures-failure');
        break;

      case 'loading':
        picturesDomElem.classList.add('pictures-loading');
        break;

    }
  }

  /**
   * Возвращает отфильтрованные по `filterID` фотографии
   *
   * @param {Array} pictures
   * @param {String} filterID
   * @returns {Array}
   */
  function filterPictures(pictures, filterID) {
    console.log('filterPictures');

    var filteredPictures = pictures.slice(0);

    switch (filterID) {

      case 'filter-new':
        // Отбираем изображения за последние 3 месяца.
        filteredPictures = filteredPictures.filter(filterThreeMonths);
        // Сортировка по убыванию даты.
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.date - a.date;
        });
        break;

      case 'filter-discussed':
        // Сортировка по порядку убывания комментариев.
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    return filteredPictures;
  }

  function filterThreeMonths(img) {
    // console.log('filterThreeMonths');


    var now = new Date();
    var nowNamber = +now;
    //Количество милисекунд в трех месяцах
    var time = 1000 * 60 * 60 * 24 * 30 * 3;
    var imgDate = new Date(img.date);
    var imgDateNamber = +imgDate;

    return imgDateNamber > nowNamber - time;
  }
})();