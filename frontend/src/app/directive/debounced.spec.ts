import { Debounced } from './debounced';

describe('Debounced', () => {
  it('should create an instance', () => {
    const directive = new Debounced();
    expect(directive).toBeTruthy();
  });
});
