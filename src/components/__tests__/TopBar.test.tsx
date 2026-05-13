import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from '../TopBar';
import { useGameStore } from '../../state/gameStore';

beforeEach(() => {
  useGameStore.getState().resetGame();
  useGameStore.getState().startGame('pathogen', 'virus', 'lon');
});

describe('TopBar', () => {
  it('renders speed buttons', () => {
    render(<TopBar />);
    [0, 1, 2, 3, 5].forEach((s) => {
      expect(screen.getByTestId(`speed-${s}`)).toBeInTheDocument();
    });
  });

  it('clicking a speed button updates the store', () => {
    render(<TopBar />);
    fireEvent.click(screen.getByTestId('speed-5'));
    expect(useGameStore.getState().speed).toBe(5);
  });

  it('shows day counter', () => {
    render(<TopBar />);
    expect(screen.getByTestId('day-counter')).toHaveTextContent(/Day\s*0/);
  });

  it('shows DNA in pathogen mode', () => {
    render(<TopBar />);
    expect(screen.getByTestId('dna-points')).toBeInTheDocument();
  });

  it('shows Budget in defender mode', () => {
    useGameStore.getState().resetGame();
    useGameStore.getState().startGame('defender', 'virus', 'lon');
    render(<TopBar />);
    expect(screen.getByTestId('budget')).toBeInTheDocument();
  });

  it('renders the cure bar', () => {
    render(<TopBar />);
    expect(screen.getByTestId('cure-bar')).toBeInTheDocument();
  });
});
