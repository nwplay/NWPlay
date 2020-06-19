import { CardPopoverModule } from './card-popover.module';

describe('CardPopoverModule', () => {
  let cardPopoverModule: CardPopoverModule;

  beforeEach(() => {
    cardPopoverModule = new CardPopoverModule();
  });

  it('should create an instance', () => {
    expect(cardPopoverModule).toBeTruthy();
  });
});
