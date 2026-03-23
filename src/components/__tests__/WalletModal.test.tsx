import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import WalletModal from '../WalletModal.js';

describe('WalletModal', () => {
  it('renders correctly', () => {
    const { lastFrame } = render(<WalletModal />);
    const frame = lastFrame();

    expect(frame).toContain('👛 ADD NEW WALLET');
    expect(frame).toContain('nansen wallet create');
  });
});
