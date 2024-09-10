/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.93.0
  Forc version: 0.62.0
  Fuel-Core version: 0.31.0
*/

/**
 * Mimics Sway Enum.
 * Requires one and only one Key-Value pair and raises error if more are provided.
 */
export type Enum<T> = {
  [K in keyof T]: Pick<T, K> & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];

/**
 * Mimics Sway Option and Vectors.
 * Vectors are treated like arrays in Typescript.
 */
export type Option<T> = T | undefined;

export type Vec<T> = T[];

/**
 * Mimics Sway Result enum type.
 * Ok represents the success case, while Err represents the error case.
 */
export type Result<T, E> = Enum<{ Ok: T; Err: E }>;
