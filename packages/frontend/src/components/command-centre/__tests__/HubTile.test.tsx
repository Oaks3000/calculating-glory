import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HubTile } from '../HubTiles';

describe('HubTile', () => {
  const defaultProps = {
    icon: '🏟',
    label: 'Stadium',
    sub: 'Facilities Lv2',
    hasEvent: false,
    onClick: vi.fn(),
  };

  it('renders the icon, label, and sub text', () => {
    render(<HubTile {...defaultProps} />);
    expect(screen.getByText('🏟')).toBeInTheDocument();
    expect(screen.getByText('Stadium')).toBeInTheDocument();
    expect(screen.getByText('Facilities Lv2')).toBeInTheDocument();
  });

  it('does not show the badge when hasEvent is false', () => {
    render(<HubTile {...defaultProps} hasEvent={false} />);
    expect(screen.queryByText('Action needed')).not.toBeInTheDocument();
  });

  it('shows the badge when hasEvent is true', () => {
    render(<HubTile {...defaultProps} hasEvent={true} />);
    expect(screen.getByText('Action needed')).toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', () => {
    const onClick = vi.fn();
    render(<HubTile {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a button element', () => {
    render(<HubTile {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies has-event class when hasEvent is true', () => {
    render(<HubTile {...defaultProps} hasEvent={true} />);
    expect(screen.getByRole('button').className).toContain('has-event');
  });

  it('does not apply has-event class when hasEvent is false', () => {
    render(<HubTile {...defaultProps} hasEvent={false} />);
    expect(screen.getByRole('button').className).not.toContain('has-event');
  });
});
