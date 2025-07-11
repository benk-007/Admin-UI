import { AuditNamePipe } from './audit-name.pipe';

describe('AuditNamePipe', () => {
  it('create an instance', () => {
    const pipe = new AuditNamePipe();
    expect(pipe).toBeTruthy();
  });
});
