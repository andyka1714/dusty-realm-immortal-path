import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tickCultivation } from '../store/slices/characterSlice';
import { GAME_TICK_RATE_MS } from '../constants';

export const useGameLoop = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(tickCultivation());
    }, GAME_TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [dispatch]);
};