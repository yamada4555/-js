

(function () {
  'use strict';
  const JOKER_IDX =14;
  const NUM_JOKER = 1;

  const NUMBER_STR = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K','Joker'];
  const SUITS = [['♠', 'black'], ['♦', 'red'], ['♥', 'red'], ['♣', 'black']];
  const NUM_SUITS = SUITS.length;

  const CARD_WIDTH = 80; // 例
  const CARD_HEIGHT = 120;
  const CARD_COLOR = 'white';
  const BACK_IMAGE = 'cd.png';

  const BORDER_COLOR = 'blue';
  const BORDER_RADIUS = 9;
  const BORDER_WIDTH = 1;

  const SHADOW_WIDTH = 2;
  const SHADOW_COLOR = '#404080';

  const FONT_SIZE = 32;
  const GRID_WIDTH = CARD_WIDTH + 2 * BORDER_WIDTH + SHADOW_WIDTH;
  const GRID_HEIGHT = CARD_HEIGHT + 2 * BORDER_WIDTH + SHADOW_WIDTH;

  const SHOW_MISTAKES = 1000;

  let colorSensitive;
  let numCols;
  let maxNumber;
  
  let hasJoker;
  let jokerCard;
  let numCards;
  let numPairs;
  let numRows;
  let countUpTimer;
  let turnUpTimer;
  let numBackPairs;
  let cards;
  let firstCard;
  let startTime;
  let fieldElem;
  let elapsedElem;

  let settingForm;
  let startButton;
  let colorSensitiveCheck;
  let numColsInput;
  let maxNumberSelect;
  
  
  let jokerCheck;
  
  
  const JOKER_COLOR = 'blue';
  const JOKER_FONT_SIZE = 13;
  let jokerOpen;


  function shuffle(a) {
    let i = a.length;
    while (i > 1) {
      const j = Math.floor(Math.random() * i);
      const t = a[--i];
      a[i] = a[j];
      a[j] = t;
    }
  }

  function gridX(idx) { return idx % numCols; }
  function gridY(idx) { return Math.floor(idx / numCols); }

  function cancelEvent() {
    clearInterval(countUpTimer);
    countUpTimer = null;
    if (turnUpTimer) {
      clearTimeout(turnUpTimer);
      turnUpTimer = null;
    }
    cards.forEach(card => 
      card.element.removeEventListener('click',card.clickHandler));
  }
class Card {
    constructor(idx, num, suit) {
    const isJoker  =(num === JOKER_IDX);
    if(isJoker)
		jokerCard = this;    
   
      this.number = num;
      this.suit = suit;

      const elem = document.createElement('div');
      this.element = elem;
      const s = elem.style;
      s.width = CARD_WIDTH + 'px';
      s.height = CARD_HEIGHT + 'px';
      s.lineHeight = CARD_HEIGHT + 'px';
      s.backgroundColor = CARD_COLOR;
      s.backgroundSize = 'cover';
      s.border = BORDER_WIDTH + 'px solid ' + BORDER_COLOR;
      s.borderRadius = BORDER_RADIUS + 'px';
      s.boxShadow = SHADOW_WIDTH + 'px ' + SHADOW_WIDTH + 'px ' + SHADOW_COLOR;
      s.textAlign = 'center';
      
      s.fontSize =( !isJoker ? FONT_SIZE: JOKER_FONT_SIZE) + 'px';
      s.color = !isJoker ? SUITS[suit][1]: JOKER_COLOR;
      s.position = 'absolute';

      this.setPos(idx);
      this.faceDown();
      this.clickHandler= this.onClick.bind(this);
      elem.addEventListener('click',this.clickHandler)
    }

    setPos(idx) {
      this.element.style.left = (gridX(idx) * GRID_WIDTH) + 'px';
      this.element.style.top = (gridY(idx) * GRID_HEIGHT) + 'px';
    }

    faceUp() {
      this.face = true;
      this.element.textContent = (this.number !== JOKER_IDX ? SUITS[this.suit][0]:'')
      +NUMBER_STR[this.number];
      this.element.style.backgroundImage = 'none';
    }

    faceDown() {
      this.element.style.backgroundImage = 'url("' + BACK_IMAGE + '")';
      this.element.textContent = '';
      this.face = false;

    }

    onClick(event) {
      if (turnUpTimer || this.face) {
        return;
      }
      this.faceUp();

	  if(this.number ===JOKER_IDX){
	  	++jokerOpen;
	  	if(jokerOpen === 2){
	  		stopGame();
	  		setTimeout(()=>alert('ジョーカーを2回開けました\n失敗です。'),300);
	  		return;
	  	
	  	}
	  }


      if (firstCard === null) {
        firstCard = this;
        return;
      }

      if (this.number === firstCard.number && 
      (!colorSensitive || SUITS[this.suit][1] === SUITS[firstCard.suit][1])) {
        firstCard = null;
        --numBackPairs;




        if (numBackPairs === 0) {
         if(hasJoker)
        	jokerCard.faceUp();
         stopGame();
          setTimeout(()=>alert('クリアしました'),300);
         
        }
        
       
        

      } else {
        turnUpTimer = setTimeout(() => {
          turnUpTimer = null;
          firstCard.faceDown();
          this.faceDown();
          firstCard = null;
        }, SHOW_MISTAKES);
      }
    }
  }

function countUp() {
    elapsedElem.textContent = ((Date.now() - startTime) / 1000).toFixed();
  }

function startGame() {
    if (countUpTimer)
      cancelEvent();
   
	colorSensitive = colorSensitiveCheck.checked;
	numCols = Number(numColsInput.value);
	maxNumber = Number(maxNumberSelect.value);
	if (isNaN(numCols)|| !Number.isInteger(numCols)|| numCols < 2|| numCols > 13){
		alert('横配置数が不正または範囲(2～13)外です');
		return;
	}
	
	for(let i = 0, len = settingForm.elements.length; i<len; ++i)
			settingForm.elements[i].disabled = true;
	
	hasJoker = jokerCheck.checked;
	
	jokerCard = null;
	jokerOpen = 0;
	
    numCards = NUM_SUITS * maxNumber+(hasJoker ? NUM_JOKER : 0);
    numPairs = (NUM_SUITS*maxNumber) / 2;
    numRows = Math.ceil(numCards / numCols);
    
    cards = new Array(numCards);
    const indexes = [...Array(numCards).keys()];
    shuffle(indexes);



    indexes.forEach((idx, i) => {
      const num = Math.floor(i / NUM_SUITS) + 1;
      
      
      if( i < NUM_SUITS*maxNumber)
      	cards[idx] = new Card(idx,num,i% NUM_SUITS);
      else
      	cards[idx] = new Card(idx,JOKER_IDX,-1);
    });

    fieldElem.style.width = (GRID_WIDTH * numCols) + 'px';
    fieldElem.style.height = (GRID_HEIGHT * numRows) + 'px';


	 while (fieldElem.firstChild)
      fieldElem.removeChild(fieldElem.firstChild);
    cards.forEach(card => fieldElem.appendChild(card.element));
    
    numBackPairs = numPairs;
    firstCard = null;
    startTime = Date.now();
    countUpTimer = setInterval(countUp, 970);
}
  
function stopGame(){
	cancelEvent();
	for(let i=0,len=settingForm.elements.length; i<len;++i)
		settingForm.elements[i].disabled = false;

}


  function init() {
    fieldElem = document.getElementById('field');
    fieldElem.style.position = 'relative';
    elapsedElem = document.getElementById('elapsed');


	settingForm = document.forms.settingForm;
	startButton = settingForm.startButton;
	colorSensitiveCheck = settingForm.colorSensitiveCheck;
	numColsInput = settingForm.numColsInput;
	maxNumberSelect = settingForm.maxNumberSelect;

	jokerCheck = settingForm.jokerCheck;
	
	startButton.addEventListener('click',startGame);


    fieldElem.onselectstart = () => false;
    fieldElem.onmousedown = ev => { ev.preventDefault(); return false; };
  }

  const readyState = document.readyState;
  if (readyState !== 'interactive' && readyState !== 'complete')
    document.addEventListener('DOMContentLoaded', init);
  else
    setTimeout(init);
})();

