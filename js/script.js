window.onload = begin;

function begin() {
  var elem = document.querySelector('.popup--new');
  elem.classList.add('popup--active');
  elem.querySelector('button').onclick = function() {
    elem.classList.remove('popup--active');
    newGame();
  };
}

function newGame() {
  // clearField();
  var playerField = document.querySelector('.hand--player');
  var playerScoreField = document.querySelector('.score__hand--player span');
  var computerField = document.querySelector('.hand--computer');
  var computerScoreField = document.querySelector('.score__hand--computer span');
  var moreButton = document.querySelector('button[name="more"]');
  var quiteButton = document.querySelector('button[name="quite"]');
  var randomCard = getRundomCard(); // получаем случайный элемент массива.
  togleButtons(false); //вкл/выкл кнопки
  addCard(randomCard, playerField); // показываем две первые карты
  addCard(randomCard, playerField);
  showScore(playerField, playerScoreField); //счетаем сумму очков
  moreButton.onclick = function() {
    addCard(randomCard, playerField);
    showScore(playerField, playerScoreField);
    checkScore(playerScoreField, 21);
  }
  quiteButton.onclick = function() {
    togleButtons(true);
    while (Number(playerScoreField.textContent) >=  Number(computerScoreField.textContent)) { // цикл, пока очки компьютера меньше очков игрока
      addCard(randomCard, computerField);
      showScore(computerField, computerScoreField);
      checkScore(playerScoreField, computerScoreField);
    };
    endGame(Number(playerScoreField.textContent), Number(computerScoreField.textContent))
  }
}

function endGame(score1, score2) {
  togleButtons(true);
  var popup = document.querySelector('.popup--resume');
  var massage = popup.querySelector('p');
  var resumeButton = document.querySelector('.popup--resume button');
  if (score1 === 21 || score2 > 21 || score1 > score2) {
    massage.innerHTML = 'Вы выиграли!</br>У вас ' + score1 + ' очков.</br>У соперника ' + score2 + ' очков.';
  }
  else {
    score1 > 21 ?  massage.innerHTML = 'У вас перебор.' : massage.innerHTML = 'Вы проиграли.</br>У вас ' + score1 + ' очков.</br>У соперника ' + score2 + ' очков.';
  }
  popup.classList.add('popup--active');
  resumeButton.addEventListener('click', function() {
    // debugger;
    clearField();
    newGame();
    togleButtons(false);
    popup.classList.remove('popup--active');
  })
}

function getRundomCard() { // через замыканиe тащим по одной позиции из отсортированного массива.
  var cards = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'd1', 'd2', 'd3', 'd4', 'd5','d6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13'];
  var shuffleCards = shuffle(cards); // перемешиваем массив
  return function() {
    return shuffleCards.shift();
  }
}

function shuffle(arr) {
  function compareRandom(a, b) { // "случайный порядок элементов в массиве" скопипастил с learnjavascript, не понял - как работает
    return Math.random() - 0.5;
  }
  return arr.sort(compareRandom);
}

function addCard(func, obj) {
  var card = document.createElement('div');
  card.value = func();
  card.classList.add('hand__card');
  card.style.backgroundImage = 'url("img/Cards/' + card.value + '.png")';
  obj.appendChild(card);
}

function showScore(obj, field) {
  var cards = obj.querySelectorAll('.hand__card'); //получаем массив объектов карт
  field.innerHTML = calcScore(cards); // счетаем сумму из значения obj.value
}

function calcScore(collect) {
  var arr = getArr(collect); // получаем массив из псевдомассива
  var newArr = arr.map( function(el) {
    return Number(el.value.substr(1)) > 10 ? 10 : Number(el.value.substr(1)); // вырезаем цифровое значение из value
  });
  var result = newArr.reduce( function calc(sum, el) {
    if (el === 1 || sum === 1) el += 10; // тузы по 11 очков
    return sum += el;
  });
  if (result > 21) result = newArr.reduce( function calc(sum, el) {
    return sum += el; // если перебор - тузы по одному очку(по умолчанию value туза === 1)
  });
  return result;
}

function getArr(obj) { // получаем массив из псевдомассива
  var arr = [];
  for (var i = 0; i < obj.length; i++) {
    arr.push(obj[i]);
  }
  return arr;
}

function checkScore(obj, max) {
  var score = Number(obj.textContent);
  if (score > Number(max) || score > 21 || Number(max.textContent) > 21) typeof max === 'object' ? endGame(score, Number(max.textContent)) : endGame(score); // если макс - объект, передаём в функцию финальный результат
}

function togleButtons(value) {
  var buttons = document.querySelectorAll('.score__controls button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = value;
  }
}

function clearField() {
  document.querySelector('.hand--player').innerHTML = '';
  document.querySelector('.score__hand--player span').innerHTML = '0';
  document.querySelector('.hand--computer').innerHTML = '';
  document.querySelector('.score__hand--computer span').innerHTML = '0';
}
