'use strict';

/**
 * Генерация сообщения на основе загруженной фотографии.
 * @param a
 * @param b
 * @return {String} Сообщение
 */
function getMessage(a, b) {
  if (typeof a == 'boolean') {
    if (a === true){
      var str = 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
      return str;
    }
    else {
      var str = 'Переданное GIF-изображение не анимировано';
      return str;
    }
  }
  if (typeof a === 'number') {
    var c = b * 4;
    var str = 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + c + ' аттрибутов';
    return str;
  }
  if (a && (a instanceof Array)) {
    if (!(b instanceof Array)) {
      var sum = 0;
      for (var i = 0; i < a.length; i++) {
        sum += a[i];
      }
      var str = 'Количество красных точек во всех строчках изображения: ' + sum;
      return str;
    }
    if (b && (b instanceof Array)) {
      var square = 0;
      for (var i = 0, j = 0; i < a.length, j< b.length; i++, j++) {
        square += a[i] * b [j];
      }
      var str = 'Общая площадь артефактов сжатия: ' + square + ' пикселей.';
      return str;
    }
  }
}
