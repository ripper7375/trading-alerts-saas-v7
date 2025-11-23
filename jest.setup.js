// Jest setup file for Next.js 15 with TypeScript
// This file runs before each test file

// Extend Jest matchers with @testing-library/jest-dom
import '@testing-library/jest-dom';

// Optional: Set timeout for all tests
jest.setTimeout(30000);

// Mock Next.js router (if needed in tests)
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     prefetch: jest.fn(),
//     back: jest.fn(),
//     forward: jest.fn(),
//     refresh: jest.fn(),
//   }),
//   useSearchParams: () => ({}),
//   usePathname: () => '/',
// }));

// Mock Next.js image component (if needed in tests)
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props) => {
//     return <img {...props} />;
//   },
// }));

// Global test utilities can be added here
global.testUtils = {
  // Add any custom test utilities here
};

// Suppress console warnings in tests (optional)
// console.warn = jest.fn();
