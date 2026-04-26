/**
 * Conventional Commits enforcement for @apexline-app/* packages.
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(client): add member.chart_data resource
 *
 * See: https://www.conventionalcommits.org/
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'build',
        'revert',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [1, 'always', 120],
    'footer-max-line-length': [1, 'always', 120],
  },
};
