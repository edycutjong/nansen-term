#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './app.js';
import SizeGuard from './components/SizeGuard.js';

// Wrap stdout.write with synchronized output protocol to eliminate
// iTerm2 flickering. Terminals that don't support it ignore the sequences.
const BSU = '\x1B[?2026h'; // Begin Synchronized Update
const ESU = '\x1B[?2026l'; // End Synchronized Update
const origWrite = process.stdout.write.bind(process.stdout);
(process.stdout as { write: typeof process.stdout.write }).write = function (
  chunk: string | Uint8Array,
  encodingOrCb?: BufferEncoding | ((err?: Error | null) => void),
  cb?: (err?: Error | null) => void,
): boolean {
  const str = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString();
  const wrapped = `${BSU}${str}${ESU}`;
  if (typeof encodingOrCb === 'function') {
    return origWrite(wrapped, encodingOrCb);
  }
  return origWrite(wrapped, encodingOrCb, cb);
} as typeof process.stdout.write;

render(
  React.createElement(SizeGuard, null, React.createElement(App)),
);
