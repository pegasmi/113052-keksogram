'use strict';

(function() {

  var filtersBlock = document.querySelector('.filters');
  var pictures = [];
  var container = document.querySelector('.pictures');
  var currentFilter = 'filter-all';
  var isFirstLoad = true;
  var filteredPictures = [];
  var currentPage = 0;
  // количество фотографий на странице
  var MAX_PICTURES_PER_PAGE = 12;
  var scrollTimeout;

  //Прячем блок с фильтрами .filters, добавляя ему класс hidden.
  if (!filtersBlock.classList.contains('hidden')) {
    filtersBlock.classList.add('hidden');
  }

  filtersBlock.addEventListener('click', function(evt) {
    var clickedFilter = evt.target;
    if (clickedFilter.classList.contains('filters-radio')) {
      setActiveFilterAndRenderPictures(clickedFilter.id);
    }
  });

  function renderPagesPerScreen() {
    // Положение контейнера относительно экрана.
    var containerCoordinates = container.getBoundingClientRect();
    // Высота вьюпорта.
    var viewportSize = window.innerHeight;
    // Проверяем виден ли нижний край контейнера.
    if (containerCoordinates.bottom <= viewportSize) {
      if (currentPage < Math.ceil(filteredPictures.length / MAX_PICTURES_PER_PAGE)) {
        renderPictures(filteredPictures, ++currentPage);
      }
    }
  }

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(renderPagesPerScreen, 100);
  });

  /**
   * Отрисовка списка фотографий.
   * @param {Array.<Object>} pictures
   * @param {number} pageNumber
   * @param {boolean=} replace
   */
  function renderPictures(images, pageNumber, replace) {
    if (replace) {
      container.innerHTML = '';
    }

    var fragment = document.createDocumentFragment();

    var from = pageNumber * MAX_PICTURES_PER_PAGE;
    var to = from + MAX_PICTURES_PER_PAGE;
    var pagePictures = pictures.slice(from, to);

    //Перебор элементов массива pictures, предназначенных для показа на странице, и добавление элемента в fragment.
    pagePictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }

  /**
   * Загрузка списка фотографий
   */
  function getPicturesAndSetFilterAndRender() {

    var xhr = new XMLHttpRequest();
    /**
     * @param {string} method
     * @param {string} URL
     * @param {boolean} async
     */
    xhr.open('GET', 'data/pictures.json');
    xhr.onload = function(evt) {
      var rawData = evt.target.response;
      var loadedPictures = JSON.parse(rawData);
      pictures = loadedPictures;
      // Обработка загружаемых данных.
      setActiveFilterAndRenderPictures(currentFilter);
      //renderPictures(loadedPictures);
      if (container.classList.contains('pictures-failure')) {
        container.classList.remove('pictures-failure');
      }
    };

    xhr.onerror = function() {
      picturesFailure();
    };

    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      picturesFailure();
    };
    xhr.send();
  }

  //Показ предупреждения об ошибке
  function picturesFailure() {
    container.classList.add('pictures-failure');
  }

  /**
   * Создание DOM-элемента на основе шаблона.
   * @param {Object} data
   * @param {Number} data.likes - количество лайков фотографии
   * @param {Number} data.comments - количество комментариев фотографии
   * @param {String} data.url - ссылка на фотографию
   * @return {Element}
   */
  function getElementFromTemplate(data) {
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

  // Лучше добавить слово render в название – сразу будет видно, что метод показывает картинки
  // Длинные названия методов говорят о недостаточной декомпозиции -- разделения ответственности
  // Хороший метод делает только одну работу
  function setActiveFilterAndRenderPictures(id) {
    // Защита от повторного выбора текущего фильтра.
    if (currentFilter === id) {
      // При первой загрузке надо показать фото
      if (!isFirstLoad) {
        return;
      }
    }

    // Копируем массив в новую переменную.
    currentPage = 0;
    filteredPictures = pictures.slice(0);

    switch (id) {
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
    renderPictures(filteredPictures, 0, true);
    renderPagesPerScreen();

    // Сменить значение текущего фильтра
    currentFilter = id;
    isFirstLoad = false;
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

  //Показ прелоадера пока длится загрузка файла.
  container.classList.add('pictures-loading');

  //Начало загрузки изображений
  getPicturesAndSetFilterAndRender();

  //Убираем прелоадер.
  container.classList.remove('pictures-loading');

  //Добавляем блок с фильтрами .filters, удаляя класс hidden.
  if (filtersBlock.classList.contains('hidden')) {
    filtersBlock.classList.remove('hidden');
  }

})();
