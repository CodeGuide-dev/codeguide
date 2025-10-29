import { CodeGuide, GetProjectsRequest, PaginatedProjectsRequest, Project } from '../index'

// Example usage of the new has_repository filtering functionality
async function demonstrateProjectFiltering() {
  const codeGuide = new CodeGuide({
    baseUrl: 'https://api.example.com',
    apiKey: 'your-api-key'
  })

  console.log('=== Project Filtering Examples ===\n')

  // Example 1: Get all projects with repositories
  console.log('1. Getting all projects with repositories:')
  try {
    const projectsWithRepos = await codeGuide.projects.getAllProjects({
      has_repository: true
    })
    console.log(`Found ${projectsWithRepos.length} projects with repositories`)
    projectsWithRepos.forEach((project: Project) => {
      console.log(`- ${project.title} (${project.project_repositories.length} repositories)`)
    })
  } catch (error: any) {
    console.log('Error:', error.message)
  }

  console.log('\n')

  // Example 2: Get all projects without repositories
  console.log('2. Getting all projects without repositories:')
  try {
    const projectsWithoutRepos = await codeGuide.projects.getAllProjects({
      has_repository: false
    })
    console.log(`Found ${projectsWithoutRepos.length} projects without repositories`)
    projectsWithoutRepos.forEach((project: Project) => {
      console.log(`- ${project.title}`)
    })
  } catch (error: any) {
    console.log('Error:', error.message)
  }

  console.log('\n')

  // Example 3: Paginated projects with repository filter
  console.log('3. Getting paginated projects with repositories:')
  try {
    const paginatedRequest: PaginatedProjectsRequest = {
      page: 1,
      page_size: 10,
      has_repository: true,
      status: 'active'
    }

    const paginatedResponse = await codeGuide.projects.getPaginatedProjects(paginatedRequest)
    console.log(`Page ${paginatedResponse.page} of ${paginatedResponse.total_pages}`)
    console.log(`Total projects with repositories: ${paginatedResponse.count}`)
    console.log(`Showing ${paginatedResponse.data.length} projects:`)

    paginatedResponse.data.forEach((project: Project) => {
      console.log(`- ${project.title}`)
      project.project_repositories.forEach((repo: any) => {
        console.log(`  Repository: ${repo.repo_url} (${repo.branch})`)
      })
    })
  } catch (error: any) {
    console.log('Error:', error.message)
  }

  console.log('\n')

  // Example 4: Combining filters
  console.log('4. Combining multiple filters:')
  try {
    const combinedFilters: PaginatedProjectsRequest = {
      page: 1,
      page_size: 5,
      has_repository: false,
      search_query: 'web',
      sort_by_date: 'desc'
    }

    const filteredProjects = await codeGuide.projects.getPaginatedProjects(combinedFilters)
    console.log(`Found ${filteredProjects.count} projects matching filters:`)
    filteredProjects.data.forEach((project: Project) => {
      console.log(`- ${project.title} (Updated: ${project.updated_at})`)
    })
  } catch (error: any) {
    console.log('Error:', error.message)
  }
}

// Export for use in tests or other modules
export { demonstrateProjectFiltering }

// Run example if this file is executed directly
if (require.main === module) {
  demonstrateProjectFiltering().catch(console.error)
}