import { backendReady } from '../src/index';

describe('backend setup', () => {
  it('returns initialised message', () => {
    expect(backendReady()).toBe('backend-initialised');
  });
});
