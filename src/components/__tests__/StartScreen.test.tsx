import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../StartScreen';
import { useGameStore } from '../../state/gameStore';

beforeEach(() => {
  useGameStore.getState().resetGame();
});

describe('StartScreen', () => {
  it('renders title and mode buttons', () => {
    render(<StartScreen />);
    expect(screen.getByText(/MIASMA MANAGER/i)).toBeInTheDocument();
    expect(screen.getByTestId('mode-pathogen')).toBeInTheDocument();
    expect(screen.getByTestId('mode-defender')).toBeInTheDocument();
  });

  it('renders pathogen-class options', () => {
    render(<StartScreen />);
    expect(screen.getByTestId('pathogen-virus')).toBeInTheDocument();
    expect(screen.getByTestId('pathogen-bacteria')).toBeInTheDocument();
    expect(screen.getByTestId('pathogen-fungus')).toBeInTheDocument();
  });

  it('clicking Start transitions store to "playing"', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('start-button'));
    expect(useGameStore.getState().phase).toBe('playing');
  });

  it('selected mode propagates to store after start', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('mode-defender'));
    fireEvent.click(screen.getByTestId('start-button'));
    expect(useGameStore.getState().mode).toBe('defender');
  });

  it('custom pathogen name propagates to store', () => {
    render(<StartScreen />);
    fireEvent.change(screen.getByTestId('pathogen-name'), { target: { value: 'Custom-X' } });
    fireEvent.click(screen.getByTestId('start-button'));
    expect(useGameStore.getState().pathogen.name).toBe('Custom-X');
  });
});
