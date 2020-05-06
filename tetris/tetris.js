var tetrisGame = (function () {
    'use strict';

    class FigureFactory {
        constructor() {
            this.figures = [
                [
                    ['1', '1', '1'],
                    [null, '1', null],
                    [null, null, null]
                ],
                [
                    ['2', null, null],
                    ['2', '2', '2'],
                    [null, null, null]
                ],
                [
                    [null, null, '3'],
                    ['3', '3', '3'],
                    [null, null, null]
                ],
                [
                    ['4', '4', null],
                    [null, '4', '4'],
                    [null, null, null]
                ],
                [
                    [null, '5', '5'],
                    ['5', '5', null],
                    [null, null, null]
                ],
                [
                    [null, null, null,null],
                    ['6', '6', '6', '6'],
                    [null, null, null,null],
                    [null, null, null,null]
                ],
                [
                    ['7', '7'],
                    ['7', '7']
                ]
            ];
        }

        createRandomFigure() {
            function randomInteger(min, max) {
                const random = min + Math.random() * (max + 1 - min);
                return Math.floor(random);
              }
            const randomFigure = this.figures[randomInteger(0, this.figures.length - 1)];
            return [...randomFigure.map( row => [...row])];
        }

    }

    class Model {
        constructor(options) {
    		this.figureFactory = new FigureFactory();
    		this.fieldSize = options.size;
    		this.options = options;
            this.level = 1;
    		this._score = 0;
    		this._gameState = 'ready';
            this.field = [];
    		this.nextFigure = [];
    		this.activeFigure = [];
    	}

    	set score(value) {
    		this._score = value;
    		if (this.score > this.level * 1000) {
    			this.level = Math.floor(this.score / 1000) + 1;
    			this.onLevelUpdate(this.level);
    			this.startMoveDownInterval();
    		}
    	}

    	get score() {
    		return this._score;
    	}

    	set gameState(value) {
    		if (this.gameState === 'game over' || this.gameState === 'ready') {
    			this.restartGame();
    		}
    		this._gameState = value;
    		this.onGameStatepdate(value, {totalScore: this.score});
    		if (this.gameState === 'active') {
    			this.clearDownInterval();
    			this.startMoveDownInterval();
    		} else {
    			this.clearDownInterval();
    		}
    	}

    	get gameState() {
    		return this._gameState;
    	}
    	
    	bindFieldUpdate(callback) {
    		this.onFieldUpdate = callback;	
    	}
    	
    	bindTotalScoreUpdate(callback) {
    		this.onTotalScoreUpdate = callback;	
    	}
    	
    	bindLevelUpdate(callback) {
    		this.onLevelUpdate = callback;	
    	}
    	
    	bindGameStateUpdate(callback) {
    		this.onGameStatepdate = callback;	
    		this.onGameStatepdate(this.gameState);
    	}
    	
    	bindNextFigureUpdate(callback) {
    		this.onNextFigure = callback;	
    	}

    	restartGame() {
    		this.level = 1;
    		this._score = 0;
    		this._gameState = 'ready';
            this.field = this._createEmptyField({
    			x: this.fieldSize.rows || 10, 
    			y: this.fieldSize.columns || 20
    		});
    		this.nextFigure = this._createFigure();
    		this.activeFigure = this._createFigure();
    		this.onNextFigure(this.nextFigure.blocks);
    		this.onTotalScoreUpdate(this.score);
    		this.onLevelUpdate(this.level);
    	}

    	startMoveDownInterval() {
    		if (this.gameState !== 'active') {
    			return;
    		}
    		this.onFieldUpdate(this.getDataState());
    		if (this.moveDownInterval) {
    			clearInterval(this.moveDownInterval);
    		}
    		const speed = 1000 - this.level * 50;
    		this.moveDownInterval = setInterval( () => {
    			this.moveActiveFigure('down');
    		}, speed > 50 ? speed : 50);
    	}

    	clearDownInterval() {
    		if (this.moveDownInterval) {
    			clearInterval(this.moveDownInterval);
    		}
    	}

    	nextMove() {
    		this.activeFigure = {...this.nextFigure};
    		this.nextFigure = this._createFigure();
    		this.onNextFigure(this.nextFigure.blocks);
    		if (this._hasCollision(this.activeFigure)) {
    			this.gameState = 'game over';
    		}
    		
    	}

    	rotateActiveFigure(direction) {
    		if (this.gameState !== 'active') {
    			return;
    		}
    		let temp = {...this.activeFigure};
    		switch (direction) {
    			case 'left':
    				temp.blocks = temp.blocks.map( (row, indexRow) => {
    					return row.map( (block, indexBlock) => {
    						return temp.blocks[indexBlock][indexRow];
    					})
    				}).reverse();
    				if (!this._hasCollision(temp)) {
    					this.activeFigure = temp;
    				}
    				break;
    			case 'right':
    				temp.blocks = temp.blocks.map( (row, indexRow) => {
    					return row.map( (block, indexBlock) => {
    						return temp.blocks[indexBlock][indexRow];
    					}).reverse();
    				});
    				if (!this._hasCollision(temp)) {
    					this.activeFigure = temp;
    				}
    				break;
    		}
    		this.onFieldUpdate(this.getDataState());
    	}
    	
    	moveActiveFigure(direction) {
    		if (this.gameState !== 'active') {
    			return;
    		}
    		let temp;
    		switch (direction) {
    			case 'right':
    				temp = {...this.activeFigure, x: this.activeFigure.x + 1};
    				if (!this._hasCollision(temp)) {
    					this.activeFigure = temp;
    					this.activeFigure;
    				}
    				break;

    			case 'left':
    				temp = {...this.activeFigure, x: this.activeFigure.x - 1};
    				if (!this._hasCollision(temp)) {
    					this.activeFigure = temp;
    				}
    				break;

    			case 'down':
    				temp = {...this.activeFigure, y: this.activeFigure.y + 1};
    				if (!this._hasCollision(temp)) {
    					this.activeFigure = temp;
    				} else {
    					this._fixate(this.field, this.activeFigure);
    					this._clearFullRows();
    					this.nextMove();
    				}
    				break;
    		}
    		this.onFieldUpdate(this.getDataState());
    	}

    	getDataState() {
    		const fieldCopy = {
    			field: this.field.map( row => row.map( element => element))
    		};
    		this._fixate(fieldCopy.field, this.activeFigure);
    		return fieldCopy;
    	}

    	isEmptyField({x, y}) {
    		return !!(this.field[y] && (this.field[y][x] === null));
    	}

    	_hasCollision({x, y, blocks: figure}) {
    		for (let row = 0; row < figure.length; row++) {
    			let isCollision = figure[row].some((value, index) => {
    				return value && !this.isEmptyField({x: x + index , y: y + row});
    			});
    			if (isCollision) {
    				return true;
    			}
    		}
    		return false;
    	}

    	_createEmptyRow = (length) => {
    		return new Array(length).fill(null);
    	}

        _createEmptyField({x, y}) {
            return [...Array(y)].map(() => this._createEmptyRow(x));
    	}

    	_fixate(field, figure) {
    		const {x, y, blocks} = figure;
    		blocks.forEach( (row, rowIndex) => {
    			row.forEach( (element, elementIndex) => {
    				if (element) {
    					field[rowIndex + y][elementIndex + x] = element;
    				}
    			});
    		});
    	}
    	
    	_createFigure() {
    		const field_width = this.options.size.rows;
    		const figure_blocks = this.figureFactory.createRandomFigure();
    		const figure = {
                x: Math.floor(field_width / 2) - Math.floor(figure_blocks.length / 2),
                y: 0,
                blocks: figure_blocks
    		};
    		return figure;
    	}

    	_isRowFull(row) {
    		return row.every( block => block);
    	}

    	_clearFullRows() {
    		let lineCouneter = 0;
    		this.field = this.field.filter( row => {
    			if (this._isRowFull(row)) {
    				lineCouneter += 1;
    				return false;
    			} else {
    				return row;
    			}
    		});
    		for(let i = 0; i < lineCouneter; i++) {
    			const emptyRow = this._createEmptyRow(this.fieldSize.rows);
    			this.field.unshift(emptyRow);
    		}
    		this.score += this._calcScore(lineCouneter);
    		this.onTotalScoreUpdate(this.score);
    	}

    	_calcScore(lines) {
    		const pointsPerLine = 50;
    		const levelCoeff = this.level / 10 + 0.9;
    		const result = Math.floor(pointsPerLine * (lines * lines) * levelCoeff);
    		return result;
    	}
    }

    class View {
        constructor(options) {
            this.options = options;
            this.blockSize = options.size.block;
            this.rootElement = options.rootElement;
            this.nextFigureElement = options.nextFigure;
            this.scoreField = options.scoreField;
            this.levelField = options.levelField;
            this.modal = options.modal;
            this.modalsize = options.size.modal;
            this.fieldWidth = options.size.rows * this.blockSize;
            this.fieldHeight = options.size.columns * this.blockSize;
            this.fieldContext = this._setEmptyFieldContext();
            this.nextFigureContext = this._setEmptyFigureContext();
            this.modalContext = this._setEmptyModalContext();
            this.colors = {
                '1': '#FF851B',
                '2': '#FF4136',
                '3': '#B10DC9',
                '4': '#0074D9',
                '5': '#2ECC40',
                '6': '#FFDC00',
                '7': '#00CED1'
            };
        }

        bindMoveLeft(callback) {
            document.addEventListener('keydown', (event) => {
                if (event.keyCode == '37') {
                    callback();
                }
            });
        }

        bindResumeGame(callback) {
            document.addEventListener('keydown', (event) => {
                if (event.keyCode == '13') {
                    callback();
                }
            });
        }

        bindMoveRight(callback) {
            document.addEventListener('keydown', (event) => {
                if (event.keyCode == '39') {
                    callback();
                }
            });
        }

        bindMoveDown(callback) {
            document.addEventListener('keydown', (event) => {
                if (event.keyCode == '40') {
                    callback();
                }
            });
        }

        bindKeyupDownButton(callback) {
            document.addEventListener('keyup', (event) => {
                if (event.keyCode == '40') {
                    callback();
                }
            });
        }

        bindRotateRight(callback) {
            document.addEventListener('keydown', (event) => {
                if (event.keyCode == '38') {
                    callback();
                }
            });
        }

        render({field}, context = this.fieldContext) {
            context.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
            field.forEach( (row, rowIndex) => {
                row.forEach((block, blockIndex) => {
                    if(block) {
                        this._renderBlock({x: blockIndex, y: rowIndex, type: block}, context);
                    }
                });
            });
        }

        updateTotalScore(totalScore) {
            this.scoreField.innerHTML = totalScore;
        }

        updateLevel(level) {
            this.levelField.innerHTML = level;
        }

        renderNextFigure(nextFigure) {
            this.render({field: nextFigure}, this.nextFigureContext);
        }

        _renderBlock({x, y, type}, context) {
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
            context.fillStyle = this.colors[type];
            context.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2);
            context.stroke();
        }

        _setEmptyFieldContext() {
            this.rootElement.querySelector('#field').innerHTML = `
            <canvas width="${this.fieldWidth}" height="${this.fieldHeight}"></canvas>
            
        `;
            const fieldElement = document.getElementById('field').querySelector('canvas');
            return fieldElement.getContext('2d');
        }

        _setEmptyFigureContext() {
            this.nextFigureElement.innerHTML = `
            <canvas width="${this.blockSize * 5}" height="${this.blockSize * 5}"></canvas>
            
        `;
            const figureElement = this.nextFigureElement.querySelector('canvas');
            return figureElement.getContext('2d');
        }

        _setEmptyModalContext() {
            const modalElement = this.modal.querySelector('canvas');
            const modalContext =  modalElement.getContext('2d');
            
            return modalContext;
        }

        renderStateModal(state, data) {
            switch (state) {
                case 'active': {
                    if (this.modalContext.interval) {
                        clearInterval(this.modalContext.interval);
                    }
                    this.modalContext.clearRect(0, 0, this.modalsize.x, this.modalsize.y);
                    this.modal.style.display = 'none';
                    break;
                }
                    
                case 'ready': {
                    let isText = true;
                    const textLine1 = 'Press ENTER';
                    const textLine2 = 'to start the game';
                    this.modal.style.display = 'flex';
                    this.modalContext.font = '16px "Press Start 2P"';
                    this.modalContext.fillStyle = "white";
                    
                    this.modalContext.interval = setInterval( () => {
                        if (isText) {
                            this.modalContext.fillText(textLine1, this._calcPadding(300, textLine1, this.modalContext), 50);
                            this.modalContext.fillText(textLine2, this._calcPadding(300, textLine2, this.modalContext), 75);
                        } else {
                            this.modalContext.clearRect(0, 0, this.modalsize.x, this.modalsize.y);
                        }
                        isText =! isText;
                    }, 1000);
                    break;
                }

                case 'game over': { 
                    let isText = true;
                    const textLine1 = 'GAME OVER';
                    const textLine2 = 'Your total score:';
                    const textLine3 = data.totalScore || '0';
                    const textLine4 = 'Press ENTER';
                    const textLine5 = 'to start the game';
                    this.modal.style.display = 'flex';
                    this.modalContext.font = '16px "Press Start 2P"';
                    this.modalContext.fillStyle = "white";
                    this.modalContext.fillText(textLine1, this._calcPadding(300, textLine1, this.modalContext), 50);
                    this.modalContext.fillText(textLine2, this._calcPadding(300, textLine2, this.modalContext), 75);
                    this.modalContext.fillText(textLine3, this._calcPadding(300, textLine3, this.modalContext), 110);

                    this.modalContext.interval = setInterval( () => {
                        if (isText) {
                            this.modalContext.fillText(textLine4, this._calcPadding(300, textLine4, this.modalContext), 145);
                            this.modalContext.fillText(textLine5, this._calcPadding(300, textLine5, this.modalContext), 170);
                        } else {
                            this.modalContext.clearRect(0, 125, this.modalsize.x, this.modalsize.y);
                        }
                        isText =! isText;
                    }, 1000);
                    break;
                }
            }
        }

        _calcPadding(width, text, context) {
            const textWidth = context.measureText(text).width;
            return (width - textWidth) / 2;
        }
    }

    class Controller {
        constructor(options) {
            this.model = new Model({
                size: options.size,
            });
            this.view = new View(options);

            this.view.bindResumeGame(() => {
                this.model.gameState = 'active';
            });

            this.view.bindMoveLeft(() => {
                this.model.moveActiveFigure('left');
            });
            
            this.view.bindMoveRight(() => {
                this.model.moveActiveFigure('right');
            });
            
            this.view.bindMoveDown(() => {
                this.model.clearDownInterval();
                this.model.moveActiveFigure('down');
            });
            
            this.view.bindRotateRight(() => {
                this.model.rotateActiveFigure('right');
            });
            
            this.view.bindKeyupDownButton(() => {
                this.model.startMoveDownInterval();
            });
            
            this.model.bindFieldUpdate( (field) => {
                this.view.render(field);
            });
            
            this.model.bindTotalScoreUpdate( (score) => {
                this.view.updateTotalScore(score);
            });
            
            this.model.bindLevelUpdate( (level) => {
                this.view.updateLevel(level);
            });
            
            this.model.bindNextFigureUpdate( (figure) => {
                this.view.renderNextFigure(figure);
            });
            
            this.model.bindGameStateUpdate( (state, data = {}) => {
                this.view.renderStateModal(state, data);
            });
        }
    }

    class Interface {
        constructor(options) {
            this.controller = new Controller(options);
            if (!Interface._instance)
            {
                Interface._instance = this;
            }
            return Interface._instance;
        }
    }

    return Interface;

}());
