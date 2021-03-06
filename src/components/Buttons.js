import React, { useState } from 'react';
import { Button, ButtonGroup, Menu, MenuItem } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import SettingsIcon from '@material-ui/icons/Settings';
import { useDispatch, useSelector } from 'react-redux';
import boardActionTypes from '../constants/boardActionTypes';
import createInvitationDialogActions from '../constants/createInvitationDialogActionTypes';
import enterCodeDialogActions from '../constants/enterCodeDialogActionTypes';
import modeActionTypes from '../constants/modeActionTypes';
import { startBoard } from '../actions/boardActions';
import { wsConnect, wsMssgStartAnalysis, wsMssgQuit } from '../actions/serverActions';

const Settings = ({props}) => {
  const state = useSelector(state => state);
  const dispatch = useDispatch();

  const [anchorElPlayFriend, setAnchorElPlayFriend] = React.useState(null);
  const [anchorElSettings, setAnchorElSettings] = React.useState(null);

  const handleClickPlayFriend = (event) => {
    setAnchorElPlayFriend(event.currentTarget);
  };

  const handleClosePlayFriend = () => {
    setAnchorElPlayFriend(null);
  };

  const handleClickSettings = (event) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setAnchorElSettings(null);
  };

  return (
    <ButtonGroup variant="text">
      <Button
        startIcon={<TuneIcon />}
        style={{textTransform: 'none'}}
        onClick={() => wsMssgQuit(state).then(() => {
          wsMssgStartAnalysis(state.server.ws).then(() => {
            dispatch({ type: modeActionTypes.RESET });
            dispatch(startBoard({ back: state.board.history.length - 1 }));
          });
        })}
      >
        Analysis board
      </Button>
      <Button
        startIcon={<GroupAddIcon />}
        onClick={handleClickPlayFriend}
        style={{textTransform: 'none'}}
      >
        Invite a friend
      </Button>
      <Menu
        anchorEl={anchorElPlayFriend}
        keepMounted
        open={Boolean(anchorElPlayFriend)}
        onClose={handleClosePlayFriend}
      >
        <MenuItem onClick={() => {
          dispatch({ type: createInvitationDialogActions.OPEN });
          handleClosePlayFriend();
        }}>Create invitation</MenuItem>
        <MenuItem onClick={() => {
          dispatch({ type: enterCodeDialogActions.OPEN });
          handleClosePlayFriend();
        }}>Enter code</MenuItem>
      </Menu>
      <Button
        onClick={handleClickSettings}
        startIcon={<SettingsIcon />}
      />
      <Menu
        anchorEl={anchorElSettings}
        keepMounted
        open={Boolean(anchorElSettings)}
        onClose={handleCloseSettings}
      >
        <MenuItem
          key={0}
          onClick={() => {
            dispatch({ type: boardActionTypes.FLIP });
            handleCloseSettings();
          }}
        >
          Flip board
        </MenuItem>
        <MenuItem
          key={1}
          onClick={() => {
            dispatch(wsConnect(state, props)).then((ws) => {
              wsMssgStartAnalysis(ws).then(() => {
                dispatch({ type: modeActionTypes.RESET });
                dispatch(startBoard({ back: state.board.history.length - 1 }));
                handleCloseSettings();
              });
            });
          }}
        >
          Connect
        </MenuItem>
      </Menu>
    </ButtonGroup>
  );
}

export default Settings;
