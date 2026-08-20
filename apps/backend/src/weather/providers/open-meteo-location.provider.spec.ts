import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { OpenMeteoLocationProvider } from './open-meteo-location.provider';

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}

describe('OpenMeteoLocationProvider', () => {
  let provider: OpenMeteoLocationProvider;
  let httpGetMock: jest.Mock;

  beforeEach(async () => {
    httpGetMock = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OpenMeteoLocationProvider,
        { provide: HttpService, useValue: { get: httpGetMock } },
      ],
    }).compile();

    provider = moduleRef.get(OpenMeteoLocationProvider);
  });

  it('normalizes geocoding results', async () => {
    httpGetMock.mockReturnValueOnce(
      of(
        mockAxiosResponse({
          results: [
            {
              name: 'Florianópolis',
              latitude: -27.5954,
              longitude: -48.548,
              country: 'Brazil',
              admin1: 'Santa Catarina',
            },
          ],
        }),
      ),
    );

    const result = await provider.findByName('Florianópolis');

    expect(result).toEqual([
      {
        name: 'Florianópolis',
        country: 'Brazil',
        admin1: 'Santa Catarina',
        latitude: -27.5954,
        longitude: -48.548,
      },
    ]);
  });

  it('defaults missing country/admin1 to null instead of undefined', async () => {
    httpGetMock.mockReturnValueOnce(
      of(
        mockAxiosResponse({
          results: [{ name: 'Somewhere', latitude: 1, longitude: 2 }],
        }),
      ),
    );

    const [result] = await provider.findByName('Somewhere');

    expect(result.country).toBeNull();
    expect(result.admin1).toBeNull();
  });

  it('returns an empty array when the API finds no matches', async () => {
    httpGetMock.mockReturnValueOnce(of(mockAxiosResponse({})));

    const result = await provider.findByName('asdkfjasldkjf');

    expect(result).toEqual([]);
  });
});
