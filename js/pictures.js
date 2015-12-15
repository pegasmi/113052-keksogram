'use strict';

(function() {

  var picturesDomElem = document.querySelector('.pictures');
  var filtersDomElem = document.querySelector('.filters');

  var cachedPictures;
  var currentFilter;
  var currentPage;
  var MAX_PICTURES_PER_PAGE = 12;

  var scrollTimeout;

  init();

  function init() {
    cachedPictures = [];
    currentFilter = 'filter-all';
    currentPage = 0;

    // Показать все фотографии
    getPictures(function(pictures) {
      cachedPictures = pictures;
      renderPictures(pictures);
    });

    // Прячем блок с фильтрами .filters, добавляя ему класс hidden.
    if (!filtersDomElem.classList.contains('hidden')) {
      filtersDomElem.classList.add('hidden');
    }

    filtersDomElem.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;

      if (clickedFilter.classList.contains('filters-radio')) {
        if (currentFilter === clickedFilter.id) {
          return;
        }

        currentFilter = clickedFilter.id;

        renderPictures(
          getFilteredPictures(clickedFilter.id),
          { replace: true }
        );
      }
    });

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(renderPagesPerScreen, 100);
    });

    // Добавляем блок с фильтрами .filters, удаляя класс hidden.
    if (filtersDomElem.classList.contains('hidden')) {
      filtersDomElem.classList.remove('hidden');
    }
  }

  /**
   * Показывает фотографии на текущей странице
   */
  function renderPagesPerScreen() {
    // Положение контейнера относительно экрана.
    var containerCoordinates = picturesDomElem.getBoundingClientRect();

    var viewportSize = window.innerHeight;
    var isPagesBottomReached = containerCoordinates.bottom > viewportSize;
    var picturesFiltered = getFilteredPictures(currentFilter);
    var isExistPicturesToShow = currentPage < Math.ceil(picturesFiltered.length / MAX_PICTURES_PER_PAGE);

    // Проверяем виден ли нижний край контейнера.
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
    var from = pageNumber * MAX_PICTURES_PER_PAGE;
    var to = from + MAX_PICTURES_PER_PAGE;
    var pagePictures = cachedPictures.slice(from, to);

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
    options = options || {};

    if (options.replace) {
      picturesDomElem.innerHTML = '';
    }

    var fragment = document.createDocumentFragment();

    pictures.forEach(function(picture) {
      fragment.appendChild(renderPicture(picture));
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
    // Показ прелоадера пока длится загрузка файла.
    informGetPicturesStatus('loading');

    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'data/pictures.json');

    xhr.onload = function(evt) {
      informGetPicturesStatus('success');
      callback(JSON.parse(evt.target.response));
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
   * Создание DOM-элемента на основе шаблона.
   * @param {Object} data
   * @param {Number} data.likes - количество лайков фотографии
   * @param {Number} data.comments - количество комментариев фотографии
   * @param {String} data.url - ссылка на фотографию
   * @return {Element}
   */
  function renderPicture(data) {
    var template = document.querySelector('#picture-template');
    var element;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
      //template не является объектом DocumentFragment, и мы имеем дело с IE
    } else {
      element = template.children[0].cloneNode(true);
    }

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    var IMAGE_TIMEOUT = 10000;
    var backgroundImage = new Image();
    backgroundImage.src = data.url;

    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      //backgroundImage.src = data.url;
      backgroundImage.setAttribute('width', '182');
      backgroundImage.setAttribute('height', '182');
      element.replaceChild(backgroundImage, element.querySelector('img'));
    };

    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    return element;
  }

  /**
   * Возвращает отфильтрованные по `filterID` фотографии
   *
   * @param {String} filterID
   * @returns {Array}
   */
  function getFilteredPictures(filterID) {
    var filteredPictures = cachedPictures.slice(0);

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
    var now = new Date();
    var nowNamber = +now;
    //Количество милисекунд в трех месяцах
    var time = 1000 * 60 * 60 * 24 * 30 * 3;
    var imgDate = new Date(img.date);
    var imgDateNamber = +imgDate;

    return imgDateNamber > nowNamber - time;
  }
})();
