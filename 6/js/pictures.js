'use strict';

/* global pictures: true */

(function() {

  //Прячем блок с фильтрами .filters, добавляя ему класс hidden.
  var hotelFilters = document.querySelector('.filters');
  if (!hotelFilters.classList.contains('hidden')) {
    hotelFilters.classList.add('hidden');
  }

  var container = document.querySelector('.pictures');

  //Перебор всех элементов массива pictures и добавление элемента в контейнер.
  pictures.forEach(function(picture) {
    var element = getElementFromTemplate(picture);
    container.appendChild(element);
  });

  /**
   * Создание DOM-элемента на основе шаблона.
   * @param {Object} data
   * @param {Element}
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

    //backgroundImage.src = data.url;
    var IMAGE_TIMEOUT = 10000;

    return element;
  }

  //Добавляем блок с фильтрами .filters, удаляя класс hidden.
  if (hotelFilters.classList.contains('hidden')) {
    hotelFilters.classList.remove('hidden');
  }
})();
