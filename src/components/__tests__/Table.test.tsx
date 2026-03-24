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

  it('scrolls to selectedIndex and shows scroll-up indicator', () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, name: `User${i + 1}`, score: (i + 1) * 10,
    }));

    // selectedIndex=5 with maxRows=3 → should scroll down, showing ▴ indicator
    const { lastFrame } = render(
      <Table columns={columns} data={manyRows} maxRows={3} selectedIndex={5} />
    );
    const frame = lastFrame();

    expect(frame).toContain('▴'); // scroll-up indicator
    expect(frame).toContain('more'); // "N more" text
    expect(frame).toContain('User6');
  });

  it('reclaims bottom row when exactly 1 item remaining', () => {
    const fourRows = [
      { id: 1, name: 'Alice', score: 95 },
      { id: 2, name: 'Bob', score: 82 },
      { id: 3, name: 'Carol', score: 70 },
      { id: 4, name: 'Dave', score: 60 },
    ];

    // maxRows=3 with 4 items, selected at 2 → remaining=1 → reclaim ▼ row
    const { lastFrame } = render(
      <Table columns={columns} data={fourRows} maxRows={3} selectedIndex={2} />
    );
    const frame = lastFrame();

    // Should show Carol and Dave (reclaimed), no ▼
    expect(frame).toContain('Carol');
    expect(frame).toContain('Dave');
    expect(frame).not.toContain('▾');
  });

  it('reclaims bottom row when scrolled to very end', () => {
    const fiveRows = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, name: `User${i + 1}`, score: (i + 1) * 10,
    }));

    // maxRows=3, selectedIndex at the last item → at bottom, reclaim ▼
    const { lastFrame } = render(
      <Table columns={columns} data={fiveRows} maxRows={3} selectedIndex={4} />
    );
    const frame = lastFrame();

    expect(frame).toContain('User5');
    expect(frame).not.toContain('▾');
  });

  it('shows scroll-down indicator when not at bottom', () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, name: `User${i + 1}`, score: (i + 1) * 10,
    }));

    // selectedIndex=0 with maxRows=3 → should show ▾ at bottom
    const { lastFrame } = render(
      <Table columns={columns} data={manyRows} maxRows={3} selectedIndex={0} />
    );
    const frame = lastFrame();

    expect(frame).toContain('User1');
    expect(frame).toContain('▾');
    expect(frame).toContain('more');
  });

  it('handles no selectedIndex with data exceeding maxRows', () => {
    const fiveRows = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, name: `User${i + 1}`, score: (i + 1) * 10,
    }));

    // no selectedIndex, maxRows=3 → should default to scrollOffset=0
    const { lastFrame } = render(
      <Table columns={columns} data={fiveRows} maxRows={3} />
    );
    const frame = lastFrame();

    expect(frame).toContain('User1');
    expect(frame).toContain('User2');
    expect(frame).toContain('▾');
  });
});
