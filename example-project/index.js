const { CodeGuide } = require('@codeguide/core');

async function main() {
  console.log('🚀 CodeGuide Development Mode Example');
  console.log('===================================\n');

  // Initialize CodeGuide with configuration
  const codeguide = new CodeGuide({
    baseUrl: 'https://api.codeguide.app',
    // Note: You'll need to provide actual API keys for real usage
    // databaseApiKey: 'sk_your_database_api_key'
    // apiKey: 'your_legacy_api_key',
    // userId: 'your_user_id',
    // jwtToken: 'your_jwt_token'
  });

  try {
    // Check API health
    console.log('🔍 Checking API health...');
    const isHealthy = await codeguide.isHealthy();
    console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);

    // Example usage (will fail without valid API key, but shows the structure)
    console.log('💬 Example: Asking for code guidance...');
    console.log('Note: This will fail without valid authentication\n');

    try {
      const response = await codeguide.getGuidance('How to create a React component in TypeScript?');
      console.log('Response:', response.response);
    } catch (error) {
      console.log('Expected error (no API key configured):', error.message);
    }

    console.log('\n📚 Available Services:');
    console.log('- generation: Prompt refinement and code generation');
    console.log('- projects: Project management');
    console.log('- usage: Usage tracking and credit management');
    console.log('- repositoryAnalysis: Repository analysis');
    console.log('- tasks: Task management');

    console.log('\n🔧 To use with real API calls:');
    console.log('1. Set up API keys in environment variables');
    console.log('2. Or pass them directly to the CodeGuide constructor');
    console.log('3. Use the CLI: codeguide ask "your question" --database-api-key sk_your_key');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);