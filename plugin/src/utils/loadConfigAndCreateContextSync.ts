/* eslint-disable promise/prefer-await-to-then */

import { loadConfigAndCreateContext } from '@pandacss/node';
import deasync from 'deasync';

type LoadConfigAndCreateContextSync = (
  ...args: Parameters<typeof loadConfigAndCreateContext>
) => Awaited<ReturnType<typeof loadConfigAndCreateContext>>;

// @ts-expect-error TODO properly type this
export const loadConfigAndCreateContextSync: LoadConfigAndCreateContextSync = (
  ...args
) => {
  let done = false;
  let result;
  let error;

  loadConfigAndCreateContext(...args)
    .then((res) => {
      result = res;
      done = true;
    })
    .catch((error_) => {
      error = error_;
      done = true;
    });

  deasync.loopWhile(() => !done);

  if (error) {
    throw error;
  }

  return result;
};
