/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'chore',
        'docs',
        'style',
        'test',
        'perf',
        'ci',
        'revert',
        'optimization',
        'merge',
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'research',
        'projects',
        'events',
        'community',
        'users',
        'infra',
        'ui',
        'backend',
        'web',
        'contracts',
        'deps',
        'docs',
        'ci',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
    'subject-case': [0],
  },
  ignores: [
    (commit) =>
      commit.startsWith('Merge') ||
      commit.startsWith('Revert') ||
      commit.includes('dependabot') ||
      commit.includes('Copilot Autofix'),
  ],
};
