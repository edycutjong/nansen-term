import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import Table from '../Table.js';

describe('Table', () => {
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Score', key: 'score', width: 10, align: 'right' as const, color: 'green' },
  ];

  const data = [
    { id: 1, name: 'Alice', score: 95 },
    { id: 2, name: 'Bob', score: 82 },
  ];

  it('renders headers correctly', () => {
    const { lastFrame } = render(<Table columns={columns} data={[]} />);
    const frame = lastFrame();
    
    expect(frame).toContain('ID       ');
    expect(frame).toContain('Name               ');
    expect(frame).toContain('     Score'); // right aligned
  });

  it('renders data rows correctly', () => {
    const { lastFrame } = render(<Table columns={columns} data={data} />);
    const frame = lastFrame();
    
    expect(frame).toContain('1        ');
    expect(frame).toContain('Alice              ');
    expect(frame).toContain('        95');
  });

  it('handles empty data', () => {
    const { lastFrame } = render(<Table columns={columns} data={[]} />);
    const frame = lastFrame();
    expect(frame).toContain('No data available');
  });

  it('respects maxRows prop', () => {
    const threeRows = [
      { id: 1, name: 'Alice', score: 95 },
      { id: 2, name: 'Bob', score: 82 },
      { id: 3, name: 'Carol', score: 70 },
    ];
    // maxRows=1 with 2 items: only 1 remaining → shows both (no ▼ for single extra)
    const { lastFrame: twoFrame } = render(<Table columns={columns} data={data} maxRows={1} />);
    expect(twoFrame()).toContain('Alice');
    expect(twoFrame()).toContain('Bob');

    // maxRows=1 with 3 items: 2 remaining → shows ▼
    const { lastFrame: threeFrame } = render(<Table columns={columns} data={threeRows} maxRows={1} />);
    expect(threeFrame()).toContain('Alice');
    expect(threeFrame()).not.toContain('Carol');
  });

  it('handles selectedIndex', () => {
    const { lastFrame } = render(<Table columns={columns} data={data} selectedIndex={0} />);
    const frame = lastFrame();
    // In ink-testing-library, inverse coloring might not be easily assertable via plain text,
    // but we can ensure it doesn't crash and renders the content.
    expect(frame).toContain('Alice');
  });

  it('handles missing values', () => {
    const incompleteData = [{ id: 3, name: null }];
    const { lastFrame } = render(<Table columns={columns} data={incompleteData} />);
    const frame = lastFrame();
    
    expect(frame).toContain('3        ');
    expect(frame).toContain('—                  '); // fallback for missing values
  });
});
