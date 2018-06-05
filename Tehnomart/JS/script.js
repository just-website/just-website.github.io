var popupForm = document.querySelector('.popup-form');
var popupAdd = document.querySelector('.popup-add');
var link = document.querySelectorAll('.card-goods .buy');
var feedback = document.querySelector('.feedback a');
var layoute = document.querySelector('.layoute');
var closePopupAdd = document.querySelector('.popup .close');
var returnBuy = document.querySelector('.popup .return');
var serviseMenuElems = document.querySelectorAll('.servise-nav li');
var serviseMenuText = document.querySelectorAll('.servise-info');

for(var i=0;i<link.length;i++) {
  link[i].addEventListener('click', function (event) {
      event.preventDefault();
      popupAdd.classList.add('show');
  });
}
for(var i=0;i<link.length;i++) {
  link[i].addEventListener('click', function (event) {
      event.preventDefault();
      layoute.classList.add('show');
  });
}

closePopupAdd.addEventListener('click', function(event) {
    event.preventDefault();
    layoute.classList.remove('show');
    popupAdd.classList.remove('show');
});
returnBuy.addEventListener('click', function(event) {
    event.preventDefault();
    layoute.classList.remove('show');
    popupAdd.classList.remove('show');
});
layoute.addEventListener('click', function(event) {
    event.preventDefault();
    layoute.classList.remove('show');
    popupAdd.classList.remove('show');
});

feedback.addEventListener('click', function (event) {
    event.preventDefault();
    popupForm.classList.add('show');
});
feedback.addEventListener('click', function (event) {
    event.preventDefault();
    layoute.classList.add('show');
});

layoute.addEventListener('click', function(event) {
    event.preventDefault();
    layoute.classList.remove('show');
    popupForm.classList.remove('show');
});

window.onload = function() {
    for (var i=0; i<serviseMenuElems.length; i++) {
        serviseMenuElems[i].addEventListener('click', menuSelect);
    }
    function menuSelect(event) {
        for (var i=0; i<serviseMenuElems.length; i++) {
            serviseMenuElems[i].classList.remove('active');
            serviseMenuText[i].classList.remove('active');
        }
        this.classList.add('active');
        for (var i=0; i<serviseMenuElems.length; i++) {
            if (serviseMenuElems[i] === this) serviseMenuText[i].classList.add('active');
        }
    }
};
