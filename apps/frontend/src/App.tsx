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
          Digite uma cidade e veja o ranking de esqui, surf e passeios pros
          próximos 7 dias.
        </p>
      </header>

      <CitySearchForm onSearch={setSearchedCity} isLoading={loading} />

      <main>
        {loading && (
          <p role="status" className={styles.status}>
            Buscando previsão…
          </p>
        )}

        {error && (
          <p role="alert" className={styles.errorMessage}>
            {getFriendlyErrorMessage(error)}
          </p>
        )}

        {!loading && !error && !forecast && searchedCity === null && (
          <p className={styles.status}>Busque uma cidade pra ver o ranking.</p>
        )}

        {!loading && !error && forecast && (
          <ForecastResults forecast={forecast} />
        )}
      </main>
    </div>
  );
}

export default App;
