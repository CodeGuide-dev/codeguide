import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5174", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Complete TypeScript SDK for integrating CodeGuide functionality into your applications.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Database API keys, legacy keys, and JWT tokens with automatic fallback').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Create, update, and manage projects programmatically with full CRUD operations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Create and manage AI-powered coding tasks with support for multiple execution modes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Query and manage LLM models and providers for your codespace tasks').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Securely manage provider API keys and GitHub tokens with encryption').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Full type safety and IntelliSense support for all API methods').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=npm install @codeguide/core').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=const project = await codeguide.projects.createProject({ title: 'My New Project', description: 'Project description here' });').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=const task = await codeguide.codespace.createCodespaceTaskV2({ project_id: project.id, task_description: 'Implement user authentication', execution_mode: 'implementation' });').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=await codeguide.securityKeys.createProviderAPIKey({ provider_key: 'openai', api_key: 'sk-your-openai-key' });').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=await codeguide.securityKeys.createGitHubToken({ github_token: 'ghp_your_github_token' });').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    