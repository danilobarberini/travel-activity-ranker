import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitySearchForm } from './CitySearchForm';

describe('CitySearchForm', () => {
  it('disables the submit button until there is non-whitespace input', async () => {
    const user = userEvent.setup();
    render(<CitySearchForm onSearch={vi.fn()} isLoading={false} />);

    const button = screen.getByRole('button', { name: /buscar/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/cidade/i), '   ');
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/cidade/i), 'Florianópolis');
    expect(button).toBeEnabled();
  });

  it('calls onSearch with the trimmed city on submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<CitySearchForm onSearch={onSearch} isLoading={false} />);

    await user.type(screen.getByLabelText(/cidade/i), '  Florianópolis  ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('Florianópolis');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('disables the input and shows a loading label while isLoading is true', () => {
    render(<CitySearchForm onSearch={vi.fn()} isLoading={true} />);

    expect(screen.getByLabelText(/cidade/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /buscando/i })).toBeDisabled();
  });
});
