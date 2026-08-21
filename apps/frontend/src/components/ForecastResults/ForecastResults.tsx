import { DayForecastCard } from '../DayForecastCard/DayForecastCard';
import { useDragScroll } from '../../hooks/useDragScroll';
import type { CityForecastQuery } from '../../graphql/generated/graphql';
import styles from './ForecastResults.module.css';

interface ForecastResultsProps {
  forecast: CityForecastQuery['cityForecast'];
}

export function ForecastResults({ forecast }: ForecastResultsProps) {
  const { location, days } = forecast;
  const dragScrollRef = useDragScroll<HTMLDivElement>();

  return (
    <section className={styles.results}>
      <header className={styles.locationHeader}>
        <h2>
          {location.name}
          {location.country ? `, ${location.country}` : ''}
        </h2>
      </header>

      <div className={styles.daysList} ref={dragScrollRef}>
        {days.map((day) => (
          <DayForecastCard
            key={day.date}
            date={day.date}
            temperatureMaxC={day.weather.temperatureMaxC}
            temperatureMinC={day.weather.temperatureMinC}
            precipitationSumMm={day.weather.precipitationSumMm}
            snowfallSumCm={day.weather.snowfallSumCm}
            activities={day.activities}
          />
        ))}
      </div>
    </section>
  );
}
