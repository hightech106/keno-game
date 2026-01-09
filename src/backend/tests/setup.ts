/**
 * Jest Test Setup
 * 
 * This file runs before all tests to ensure proper initialization
 * Must import reflect-metadata before any decorators are processed
 */
import 'reflect-metadata';

// Ensure reflect-metadata is available globally
if (!global.Reflect) {
  // @ts-ignore
  global.Reflect = require('reflect-metadata');
}
