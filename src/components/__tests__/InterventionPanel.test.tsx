import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterventionPanel } from '../InterventionPanel';
import { useGameStore } from '../../state/gameStore';

beforeEach(() => {
  useGameStore.getState().resetGame();
  useGameStore.getState().startGame('defender', 'virus', 'lon');
  useGameStore.setState({ budget: 100 });
});

describe('InterventionPanel', () => {
  it('renders all interventions', () => {
    render(<InterventionPanel onClose={() => {}} />);
    expect(screen.getByTestId('intervention-lockdown')).toBeInTheDocument();
    expect(screen.getByTestId('intervention-public-info')).toBeInTheDocument();
    expect(screen.getByTestId('intervention-healthcare-surge')).toBeInTheDocument();
  });

  it('shows current budget', () => {
    render(<InterventionPanel onClose={() => {}} />);
    expect(screen.getByTestId('budget-balance')).toHaveTextContent('100');
  });

  it('deploys city-scope intervention when city selected and affordable', () => {
    useGameStore.getState().selectCity('lon');
    render(<InterventionPanel onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('intervention-lockdown'));
    expect(useGameStore.getState().cities.lon.interventions.has('lockdown')).toBe(true);
    expect(useGameStore.getState().budget).toBe(94);
  });

  it('deploys global intervention without city selection', () => {
    render(<InterventionPanel onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('intervention-public-info'));
    expect(useGameStore.getState().budget).toBe(88);
  });

  it('city-scope intervention cannot be deployed without selected city', () => {
    useGameStore.getState().selectCity(null);
    render(<InterventionPanel onClose={() => {}} />);
    const btn = screen.getByTestId('intervention-lockdown');
    expect(btn).toBeDisabled();
  });

  it('budget shortfall disables interventions', () => {
    useGameStore.setState({ budget: 0 });
    useGameStore.getState().selectCity('lon');
    render(<InterventionPanel onClose={() => {}} />);
    expect(screen.getByTestId('intervention-lockdown')).toBeDisabled();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<InterventionPanel onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-interventions'));
    expect(onClose).toHaveBeenCalled();
  });
});
