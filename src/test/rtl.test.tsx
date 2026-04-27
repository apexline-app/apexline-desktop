import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type='button' onClick={() => setCount(c => c + 1)}>
      count: {count}
    </button>
  );
}

describe('RTL + happy-dom smoke', () => {
  it('renders a component', () => {
    render(<Counter />);

    expect(screen.getByRole('button')).toHaveTextContent('count: 0');
  });

  it('reacts to user interaction', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent('count: 2');
  });
});
