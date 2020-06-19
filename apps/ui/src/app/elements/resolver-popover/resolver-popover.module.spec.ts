import { ResolverPopoverModule } from './resolver-popover.module';

describe('ResolverPopoverModule', () => {
  let resolverPopoverModule: ResolverPopoverModule;

  beforeEach(() => {
    resolverPopoverModule = new ResolverPopoverModule();
  });

  it('should create an instance', () => {
    expect(resolverPopoverModule).toBeTruthy();
  });
});
