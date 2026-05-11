import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MutationTree } from '../MutationTree';
import { useGameStore } from '../../state/gameStore';

beforeEach(() => {
  useGameStore.getState().resetGame();
  useGameStore.getState().startGame('pathogen', 'virus', 'lon');
  useGameStore.setState({ dnaPoints: 100 });
});

describe('MutationTree', () => {
  it('renders the modal with category headers', () => {
    render(<MutationTree onClose={() => {}} />);
    expect(screen.getByTestId('mutation-tree-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Transmission/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Symptoms/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Abilities/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Lethality/i })).toBeInTheDocument();
  });

  it('shows DNA balance', () => {
    render(<MutationTree onClose={() => {}} />);
    expect(screen.getByTestId('dna-balance')).toHaveTextContent('100');
  });

  it('clicking an affordable mutation buys it', () => {
    render(<MutationTree onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('mutation-airborne-1'));
    expect(useGameStore.getState().pathogen.mutations.has('airborne-1')).toBe(true);
    expect(useGameStore.getState().dnaPoints).toBe(96);
  });

  it('does not buy when prereqs missing', () => {
    render(<MutationTree onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('mutation-airborne-2'));
    expect(useGameStore.getState().pathogen.mutations.has('airborne-2')).toBe(false);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<MutationTree onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-mutations'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables already-owned mutations', () => {
    useGameStore.getState().buyMutationAction('airborne-1');
    render(<MutationTree onClose={() => {}} />);
    const node = screen.getByTestId('mutation-airborne-1');
    expect(node).toBeDisabled();
  });
});
