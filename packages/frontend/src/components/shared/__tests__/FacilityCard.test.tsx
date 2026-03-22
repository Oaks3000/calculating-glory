import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacilityCard } from '../FacilityCard';
import { Facility } from '@calculating-glory/domain';

// Minimal Facility builder — TRAINING_GROUND is a real FacilityType with well-known config
function makeFacility(overrides: Partial<Facility> = {}): Facility {
  return {
    type: 'TRAINING_GROUND',
    level: 1,
    upgradeCost: 15_000_00, // £150,000 in pence
    benefit: { type: 'performance', improvement: 5 },
    ...overrides,
  };
}

const BUDGET_RICH  = 50_000_000; // £500,000
const BUDGET_BROKE = 100;        // £1

describe('FacilityCard — rendering', () => {
  it('shows the facility label and description from FACILITY_CONFIG', () => {
    render(<FacilityCard facility={makeFacility()} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.getByText('Training Ground')).toBeInTheDocument();
  });

  it('renders the correct level label', () => {
    render(<FacilityCard facility={makeFacility({ level: 0 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.getByText(/Derelict/)).toBeInTheDocument();

    render(<FacilityCard facility={makeFacility({ level: 3 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it('shows MAX badge at level 5', () => {
    render(<FacilityCard facility={makeFacility({ level: 5 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.getByText('MAX')).toBeInTheDocument();
  });

  it('does not show MAX badge below level 5', () => {
    render(<FacilityCard facility={makeFacility({ level: 4 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.queryByText('MAX')).not.toBeInTheDocument();
  });
});

describe('FacilityCard — upgrade button', () => {
  it('renders an enabled Upgrade button when affordable and not at max', () => {
    render(<FacilityCard facility={makeFacility({ level: 1 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /upgrade/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('calls onUpgrade when Upgrade button is clicked', () => {
    const onUpgrade = vi.fn();
    render(<FacilityCard facility={makeFacility({ level: 1 })} budget={BUDGET_RICH} onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole('button', { name: /upgrade/i }));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('disables the Upgrade button when budget is insufficient', () => {
    render(<FacilityCard facility={makeFacility({ level: 1 })} budget={BUDGET_BROKE} onUpgrade={vi.fn()} />);
    expect(screen.getByRole('button', { name: /upgrade/i })).toBeDisabled();
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
  });

  it('hides the upgrade section entirely at level 5', () => {
    render(<FacilityCard facility={makeFacility({ level: 5 })} budget={BUDGET_RICH} onUpgrade={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument();
  });
});

describe('FacilityCard — construction state', () => {
  it('shows "Under Construction" banner with week count when building', () => {
    render(
      <FacilityCard
        facility={makeFacility({ constructionWeeksRemaining: 3 })}
        budget={BUDGET_RICH}
        onUpgrade={vi.fn()}
      />
    );
    expect(screen.getByText('Under Construction')).toBeInTheDocument();
    expect(screen.getByText(/3 weeks remaining/)).toBeInTheDocument();
  });

  it('uses singular "week" when constructionWeeksRemaining is 1', () => {
    render(
      <FacilityCard
        facility={makeFacility({ constructionWeeksRemaining: 1 })}
        budget={BUDGET_RICH}
        onUpgrade={vi.fn()}
      />
    );
    expect(screen.getByText(/1 week remaining/)).toBeInTheDocument();
    expect(screen.queryByText(/1 weeks remaining/)).not.toBeInTheDocument();
  });

  it('hides the upgrade button while under construction', () => {
    render(
      <FacilityCard
        facility={makeFacility({ constructionWeeksRemaining: 2 })}
        budget={BUDGET_RICH}
        onUpgrade={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument();
  });

  it('does not show construction banner when constructionWeeksRemaining is 0', () => {
    render(
      <FacilityCard
        facility={makeFacility({ constructionWeeksRemaining: 0 })}
        budget={BUDGET_RICH}
        onUpgrade={vi.fn()}
      />
    );
    expect(screen.queryByText('Under Construction')).not.toBeInTheDocument();
  });

  it('does not show construction banner when constructionWeeksRemaining is undefined', () => {
    render(
      <FacilityCard
        facility={makeFacility({ constructionWeeksRemaining: undefined })}
        budget={BUDGET_RICH}
        onUpgrade={vi.fn()}
      />
    );
    expect(screen.queryByText('Under Construction')).not.toBeInTheDocument();
  });
});
