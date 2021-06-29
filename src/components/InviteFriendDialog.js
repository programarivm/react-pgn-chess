import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel,
  MenuItem, TextField, Select } from '@material-ui/core';
import { useDispatch, useSelector } from "react-redux";
import { close as closeInviteFriendDialog } from "../actions/inviteFriendDialogActions";
import { startBoard } from '../actions/boardActions';
import { playfriend, quit } from '../actions/serverActions';
import Pgn from '../utils/Pgn';

const InviteFriendDialog = () => {
  const state = useSelector(state => state);
  const dispatch = useDispatch();

  const inviteFriendDialogInitialState = {
    color: "random",
    time: 10
  };

  const [inviteFriendDialogState, setInviteFriendDialogInitialState] = useState(inviteFriendDialogInitialState);

  const handleChange = (event) => {
    setInviteFriendDialogInitialState({
      ...inviteFriendDialogState,
      [event.target.name]: event.target.value
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(startBoard({ back: state.board.history.length - 1 }));
    if (state.server.ws) {
      dispatch(quit(state.server.ws)).then(() => {
        dispatch(playfriend(
          state.server.ws,
          inviteFriendDialogState.color,
          inviteFriendDialogState.time)
        ).then(() => dispatch(closeInviteFriendDialog()));
      });
    }

    setInviteFriendDialogInitialState(inviteFriendDialogInitialState);
  }

  return (
    <div>
      <Dialog open={state.inviteFriendDialog.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Invite a friend</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <InputLabel>Color</InputLabel>
            <Select
              name="color"
              fullWidth
              required
              defaultValue="random"
              onChange={handleChange}
            >
              <MenuItem value="" disabled>
                Select a color
              </MenuItem>
              <MenuItem key={0} value="random">
                Random
              </MenuItem>
              <MenuItem key={1} value={Pgn.symbol.WHITE}>
                White
              </MenuItem>
              <MenuItem key={2} value={Pgn.symbol.BLACK}>
                Black
              </MenuItem>
            </Select>
            <InputLabel>Minutes</InputLabel>
            <TextField
              name="time"
              type="number"
              fullWidth
              required
              defaultValue={10}
              inputProps={{ min: "1", max: "60", step: "1" }}
              onChange={handleChange}
            />
            <DialogActions>
              <Button color="primary" type="submit">
                Create code
              </Button>
              <Button onClick={() => dispatch(closeInviteFriendDialog())} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InviteFriendDialog;