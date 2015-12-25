/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var pointX = resizeForm['resize-x'];
    var pointY = resizeForm['resize-y'];
    var resizeSize = resizeForm['resize-size'];
    if (pointX.value + resizeSize.value > currentResizer._image.naturalWidth ||
      pointY.value + resizeSize.value > currentResizer._image.naturalHeight) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
          setTimeout(getDisplacement, 100);
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  //Обработчик изменения формы кадрирования.
  resizeForm.addEventListener('change', function() {
    var pointX = resizeForm['resize-x'];
    var pointY = resizeForm['resize-y'];
    var resizeSize = resizeForm['resize-size'];

    currentResizer.setConstraint(pointX.value, pointY.value, resizeSize.value);

    var resizeSubmit = document.querySelector('#resize-fwd');
    if (resizeFormIsValid()) {
      resizeSubmit.disabled = false;
      deleteMsgErrorResize();
    } else {
      resizeSubmit.disabled = true;
      msgErrorResize();
    }
  });

  //При некорректных параметрах кадрирования создается элемент с сообщением об ошибке.
  var formControls = document.querySelector('.upload-form-controls');
  var errorMsg = document.createElement('div');
  var showed = false;

  function msgErrorResize() {
    errorMsg.className = 'resize-error';
    errorMsg.innerHTML = 'Кадр должен находится в пределах исходного изображения';
    //errorMsg.style = 'position: absolute; top: 40px; left: 90px; color: red;';
    errorMsg.setAttribute('style', 'position: absolute; top: 40px; left: 90px; color: red;');
    formControls.appendChild(errorMsg);
    showed = true;
  }

  function deleteMsgErrorResize() {
    if (showed) {
      formControls.removeChild(errorMsg);
      showed = false;
    } else {
      return;
    }
  }

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Определение периода жизни cookies.
   * @returns {string}
   */
  function cookiePeriodToLive() {
    var periodForCookies;
    var sinceBirthday;
    var now = new Date();
    var nowYear = now.getFullYear();
    var lastYear = nowYear - 1;
    var thisYearBirthday = new Date(nowYear, 2, 21, 2, 40, 0, 0);
    var lastYearBirthday = new Date(lastYear, 2, 21, 2, 40, 0, 0);
    var nowNamber = +now;
    var thisYearBirthdayNumber = +thisYearBirthday;
    var lastYearBirthdayNumber = +lastYearBirthday;

    if (nowNamber > thisYearBirthdayNumber) {
      sinceBirthday = nowNamber - thisYearBirthdayNumber;
    } else {
      sinceBirthday = nowNamber - lastYearBirthdayNumber;
    }
    periodForCookies = nowNamber + sinceBirthday;
    return new Date(periodForCookies).toUTCString();
  }

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');

    document.cookie = 'filter=' + filterImage.className.split(' ')[1] + ';expires=' + cookiePeriodToLive();
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  /**
   * Функция восстанавливает значение фильтра по прежде сохраненной cookie.
   */
  function restorePrevFilterValue() {
    var filterID = docCookies.getItem('filter');
    // Проверяем, есть ли cookie, содержащая значение фильтра.
    if (filterID) {
      //Применяем фильтр к фотографии.
      filterImage.className = 'filter-image-preview ' + filterID;
      //Подсвечиваем кнопку, соответствующую примененному фильтру.
      filterForm['upload-' + filterID].setAttribute('checked', 'checked');
    }
  }

  /**
   * Выставление значений фильтра по загрузке страницы.
   */
  window.addEventListener('load', function() {
    restorePrevFilterValue();
  });

  /**
   *  Добавление значий смещений и размера размера кадра в поля формы.
   */
  function getDisplacement() {
    var displacement = currentResizer.getConstraint();
    console.log(currentResizer);
    resizeForm['resize-x'].value = displacement.x;
    resizeForm['resize-y'].value = displacement.y;
    resizeForm['resize-size'].value = displacement.side;
  }

  /**
   * Обработчик берет значения смещения и размера кадра
   * из объекта resizer для добавления их в форму
   * @event resizerchange
   */
  window.addEventListener('resizerchange', getDisplacement);

  cleanupResizer();
  updateBackground();

})();
