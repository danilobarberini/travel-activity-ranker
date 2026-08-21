import { useState } from 'react';
import { CitySearchForm } from './components/CitySearchForm/CitySearchForm';
import { ForecastResults } from './components/ForecastResults/ForecastResults';
import { useCityForecast } from './hooks/useCityForecast';
import { getFriendlyErrorMessage } from './utils/get-friendly-error-message';
import styles from './App.module.css';

function App() {
  const [searchedCity, setSearchedCity] = useState<string | null>(null);
  const { forecast, loading, error } = useCityForecast(searchedCity);

  return (
    <div className={styles.app}>
      <header className={styles.hero}>
        <h1>Travel Activity Ranker</h1>
        <p className={styles.subtitle}>
          Enter a city and see the ranking for skiing, surfing, and sightseeing
          for the next 7 days.
        </p>
      </header>

      <CitySearchForm onSearch={setSearchedCity} isLoading={loading} />

      <main>
        {loading && (
          <p role="status" className={styles.status}>
            Loading forecast…
          </p>
        )}

        {error && (
          <p role="alert" className={styles.errorMessage}>
            {getFriendlyErrorMessage(error)}
          </p>
        )}

        {!loading && !error && !forecast && searchedCity === null && (
          <p className={styles.status}>Search a city to see the ranking.</p>
        )}

        {!loading && !error && forecast && (
          <ForecastResults forecast={forecast} />
        )}
      </main>
    </div>
  );
}

export default App;
