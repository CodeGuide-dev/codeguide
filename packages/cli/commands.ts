import { Command } from 'commander';
import { CodeGuide } from '@codeguide/core';

export function createCommands(program: Command): void {
  program
    .command('ask <prompt>')
    .description('Ask for code guidance')
    .option('-l, --language <language>', 'Programming language')
    .option('-c, --context <context>', 'Additional context')
    .option('-v, --verbose', 'Verbose output')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.app'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async (prompt: string, options) => {
      try {
        const codeguide = new CodeGuide(
          {
            baseUrl: options.apiUrl,
            apiKey: options.apiKey,
            userId: process.env.CODEGUIDE_USER_ID,
          },
          {
            language: options.language,
            context: options.context,
            verbose: options.verbose,
          }
        );

        const isHealthy = await codeguide.isHealthy();
        if (!isHealthy) {
          console.error('Error: API service is not available');
          process.exit(1);
        }

        const response = await codeguide.getGuidance(prompt);
        console.log('Response:', response.response);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  program
    .command('health')
    .description('Check API health')
    .option(
      '--api-url <url>',
      'API URL',
      process.env.CODEGUIDE_API_URL || 'https://api.codeguide.app'
    )
    .option('--api-key <key>', 'API key', process.env.CODEGUIDE_API_KEY)
    .action(async options => {
      try {
        const codeguide = new CodeGuide({
          baseUrl: options.apiUrl,
          apiKey: options.apiKey,
          userId: process.env.CODEGUIDE_USER_ID,
        });

        const isHealthy = await codeguide.isHealthy();
        if (isHealthy) {
          console.log('✅ API is healthy');
        } else {
          console.log('❌ API is not healthy');
          process.exit(1);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
