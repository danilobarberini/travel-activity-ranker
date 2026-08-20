import { BestDaySummary } from '../BestDaySummary/BestDaySummary';
import { DayForecastCard } from '../DayForecastCard/DayForecastCard';
import type { CityForecastQuery } from '../../graphql/generated/graphql';
import styles from './ForecastResults.module.css';

interface ForecastResultsProps {
  forecast: CityForecastQuery['cityForecast'];
}

export function ForecastResults({ forecast }: ForecastResultsProps) {
  const { location, days } = forecast;

  return (
    <section className={styles.results}>
      <header className={styles.locationHeader}>
        <h2>
          {location.name}
          {location.country ? `, ${location.country}` : ''}
        </h2>
      </header>

      <BestDaySummary days={days} />

      <div className={styles.daysList}>
        {days.map((day) => (
          <DayForecastCard
            key={day.date}
            date={day.date}
            temperatureMaxC={day.weather.temperatureMaxC}
            temperatureMinC={day.weather.temperatureMinC}
            precipitationSumMm={day.weather.precipitationSumMm}
            activities={day.activities}
          />
        ))}
      </div>
    </section>
  );
}
