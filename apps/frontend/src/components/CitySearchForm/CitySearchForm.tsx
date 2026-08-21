import { useState, type FormEvent } from 'react';
import styles from './CitySearchForm.module.css';

interface CitySearchFormProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

// Matches the backend's MAX_LOCATION_LENGTH (forecast.resolver.ts).
const MAX_CITY_LENGTH = 100;

export function CitySearchForm({ onSearch, isLoading }: CitySearchFormProps) {
  const [city, setCity] = useState('');
  const trimmedCity = city.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedCity) {
      onSearch(trimmedCity);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="city-input" className={styles.label}>
        City
      </label>
      <div className={styles.row}>
        <input
          id="city-input"
          type="text"
          className={styles.input}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="e.g. Lisbon"
          disabled={isLoading}
          autoComplete="off"
          maxLength={MAX_CITY_LENGTH}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={isLoading || !trimmedCity}
        >
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
