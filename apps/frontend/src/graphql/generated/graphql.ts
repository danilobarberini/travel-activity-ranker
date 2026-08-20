/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** An activity that gets ranked for a given day. */
export type ActivityType =
  | 'INDOOR_SIGHTSEEING'
  | 'OUTDOOR_SIGHTSEEING'
  | 'SKIING'
  | 'SURFING';

export type CityForecastQueryVariables = Exact<{
  location: string;
}>;


export type CityForecastQuery = { cityForecast: { location: { name: string, country: string | null, admin1: string | null }, days: Array<{ date: string, weather: { temperatureMaxC: number, temperatureMinC: number, precipitationSumMm: number }, activities: Array<{ activity: ActivityType, score: number | null, reasoning: Array<string> }> }> } };


export const CityForecastDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CityForecast"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"location"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cityForecast"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"location"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"admin1"}}]}},{"kind":"Field","name":{"kind":"Name","value":"days"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weather"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"temperatureMaxC"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureMinC"}},{"kind":"Field","name":{"kind":"Name","value":"precipitationSumMm"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"reasoning"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CityForecastQuery, CityForecastQueryVariables>;