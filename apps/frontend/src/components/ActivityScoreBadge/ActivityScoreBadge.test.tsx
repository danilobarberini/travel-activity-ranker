import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityScoreBadge } from './ActivityScoreBadge';

describe('ActivityScoreBadge', () => {
  it('renders the activity label, score and tier label', () => {
    render(
      <ActivityScoreBadge
        activity="SURFING"
        score={85}
        reasoning={['Boa ondulação (1.2m)']}
      />,
    );

    expect(screen.getByText('Surf')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Ótimo')).toBeInTheDocument();
  });

  it('renders a dash instead of a fabricated number when score is null', () => {
    render(
      <ActivityScoreBadge
        activity="SURFING"
        score={null}
        reasoning={['Sem dados de ondas disponíveis']}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });
});
