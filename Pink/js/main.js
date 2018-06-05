window.onload = function() {
  var button = document.querySelector('.main-nav__button');
  button.onclick = function() {
    document.querySelector('.main-nav').classList.toggle('main-nav--active');
    document.querySelector('.page-header').classList.toggle('page-header--active');
    document.querySelector('.page-header__wrapper').classList.toggle('page-header__wrapper--active');
  };
};
