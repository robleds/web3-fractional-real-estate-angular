import { TestBed } from '@angular/core/testing';

import { RecoverPassGuard } from './recover-pass.guard';

describe('RecoverPassGuard', () => {
  let guard: RecoverPassGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RecoverPassGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
