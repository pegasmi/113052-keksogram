'use strict';

(function() {

  //Прячем блок с фильтрами .filters, добавляя ему класс hidden.
  var filtersBlock = document.querySelector('.filters');
  var images = [];
  if (!filtersBlock.classList.contains('hidden')) {
    filtersBlock.classList.add('hidden');
  }

  var container = document.querySelector('.pictures');

  function renderPictures(pictures) {
    container.innerHTML = '';
    var fragment = document.createDocumentFragment();

    //Перебор всех элементов массива pictures и добавление элемента в контейнер.
    pictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }

  /**
   * Загрузка списка фотографий
   */
  function getPictures() {
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
      images = loadedPictures;
      // Обработка загружаемых данных.
      renderPictures(loadedPictures);
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

  var filters = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var currentFilter = evt.target.id;
      setActiveFilter(currentFilter);
    };
  }

  var activeFilter = 'filter-all';

  function setActiveFilter(id) {
    // Защита от повторного выбора текущего фильтра.
    if (activeFilter === id) {
      return;
    }

    // Копируем массив в новую переменную.
    var filteredImages = images.slice(0);

    switch (id) {
      case 'filter-new':
        //Отбираем изображения за последние 3 месяца.
        filteredImages = filteredImages.filter(filterThreeMonths);
        // Сортировка по убыванию даты.
        filteredImages = filteredImages.sort(function(a, b) {
          return b.date - a.date;
        });
        break;
      case 'filter-discussed':
        // Сортировка по порядку убывания комментариев.
        filteredImages = filteredImages.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    renderPictures(filteredImages);
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
  getPictures();

  //Убираем прелоадер.
  container.classList.remove('pictures-loading');
  //Добавляем блок с фильтрами .filters, удаляя класс hidden.
  if (filtersBlock.classList.contains('hidden')) {
    filtersBlock.classList.remove('hidden');
  }

})();
