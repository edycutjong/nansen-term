#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './app.js';
import SizeGuard from './components/SizeGuard.js';

render(
  React.createElement(SizeGuard, null, React.createElement(App)),
);
