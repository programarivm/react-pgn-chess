import ActionTypes from '../constants/AppConstants';
import AppDispatcher from "../dispatcher/AppDispatcher.js";
import BoardStore from "./BoardStore.js";
import HistoryStore from "./HistoryStore.js";
import { EventEmitter } from 'events';
import Pgn from '../utils/Pgn.js';

class SquareStore extends EventEmitter {
  constructor() {
    super();
    this.state = {};
  }

  getState() {
    return this.state;
  }

  click(square) {
    if (HistoryStore.getState().back > 0) {
      return false;
    }
    let piece = BoardStore.getState().pieces[square];
    let pgn = null;
    switch (true) {
      // leave a piece on an empty square
      case BoardStore.getState().move !== null && piece === undefined:
        pgn = Pgn.convert({
          piece: BoardStore.getState().move.piece,
          from: BoardStore.getState().move.from,
          to: square
        });
        this.move(pgn, square);
        break;
      // leave a piece on a non-empty square
      case BoardStore.getState().move !== null && piece !== undefined:
        pgn = Pgn.convert({
          piece: BoardStore.getState().move.piece,
          from: BoardStore.getState().move.from,
          to: square
        }, 'x');
        this.move(pgn, square);
        break;
      // pick a piece on a non-empty square
      case BoardStore.getState().move === null && piece !== undefined:
        let newState = BoardStore.getState();
        newState.move = {
          piece: piece,
          from: square
        };
        BoardStore.setState(newState);
        break;
      // pick a piece on an empty square
      default:
        break;
    }
  }

  move(pgn, square) {
    let evEmitter = this;
    let newBoardState = BoardStore.getState();
    let newHistoryState = HistoryStore.getState();
    BoardStore.getSocket().send(BoardStore.getState().move.piece.color + ' ' + pgn);
    BoardStore.getSocket().onmessage = (function(ev) {
      if (ev.data === 'true') {
        delete newBoardState.pieces[BoardStore.getState().move.from];
        newBoardState.move.to = square;
        newBoardState.pieces[BoardStore.getState().move.to] = BoardStore.getState().move.piece;
        newHistoryState.items.push({
          pgn: pgn,
          move: newBoardState.move
        });
        BoardStore.castle(pgn, newBoardState)
					.enPassant(pgn, newBoardState)
					.promote(pgn, newBoardState);
        BoardStore.setState(newBoardState);
        HistoryStore.setState(newHistoryState);
        newBoardState = BoardStore.getState();
        evEmitter.emit("move");
      }
      newBoardState.move = null;
      BoardStore.setState(newBoardState);
    });
  }

	handleActions(action) {
		switch (action.type) {
			case ActionTypes.CLICK_SQUARE:
				this.click(action.square);
				break;
			default:
        // do nothing
		}
	}
}

const squareStore = new SquareStore().setMaxListeners(64);
AppDispatcher.register(squareStore.handleActions.bind(squareStore));

export default squareStore;