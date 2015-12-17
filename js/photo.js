(function(){
  /**
   * @param {Object} data
   * @constructor
   */
  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');
    var element;

    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
      //template не является объектом DocumentFragment, и мы имеем дело с IE
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    var IMAGE_TIMEOUT = 10000;
    var backgroundImage = new Image();
    backgroundImage.src = this._data.url;

    var imageLoadTimeout = setTimeout(function() {
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
  };

  window.Photo = Photo;
})();
