import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityScoreBadge } from './ActivityScoreBadge';

describe('ActivityScoreBadge', () => {
  it('renders the activity label, score and tier label', () => {
    render(
      <ActivityScoreBadge
        activity="SURFING"
        score={85}
        reasoning={['Good swell (1.2m)']}
      />,
    );

    expect(screen.getByText('Surfing')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders a dash instead of a fabricated number when score is null', () => {
    render(
      <ActivityScoreBadge
        activity="SURFING"
        score={null}
        reasoning={['No wave data available']}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('exposes the reasoning through an info button instead of a hover-only title', () => {
    render(
      <ActivityScoreBadge
        activity="SURFING"
        score={85}
        reasoning={['Good swell (1.2m)']}
      />,
    );

    const infoButton = screen.getByRole('button', {
      name: /why this score/i,
    });
    const describedById = infoButton.getAttribute('aria-describedby');

    expect(describedById).toBeTruthy();
    expect(document.getElementById(describedById!)).toHaveTextContent(
      'Good swell (1.2m)',
    );
  });

  it('renders no info button when there is no reasoning', () => {
    render(<ActivityScoreBadge activity="SURFING" score={85} reasoning={[]} />);

    expect(
      screen.queryByRole('button', { name: /why this score/i }),
    ).not.toBeInTheDocument();
  });
});
