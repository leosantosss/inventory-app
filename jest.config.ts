import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}

const jestConfig = createJestConfig(config)

// Wrap the async config to append bson/mongodb/mongoose to transformIgnorePatterns
export default async () => {
  const resolved = await (jestConfig as () => Promise<Config>)()
  const existing = resolved.transformIgnorePatterns ?? []
  return {
    ...resolved,
    transformIgnorePatterns: existing.map((pattern: string) =>
      pattern === '/node_modules/'
        ? '/node_modules/(?!(bson|mongodb|mongoose)/)'
        : pattern
    ),
  }
}
