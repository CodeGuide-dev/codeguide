import * as fs from 'fs'
import * as path from 'path'

export interface ProjectInfo {
  name: string
  type: string
  language: string
  hasPackageJson: boolean
  hasReadme: boolean
  mainFiles: string[]
  dependencies: string[]
  devDependencies: string[]
}

export function getCurrentDirectory(): string {
  return process.cwd()
}

export function isRootDirectory(dir: string): boolean {
  // On Unix/Mac, root is '/'
  // On Windows, root is like 'C:\\'
  return dir === path.parse(dir).root
}

export function getProjectInfo(dir: string): ProjectInfo {
  const packageJsonPath = path.join(dir, 'package.json')
  const readmePath = path.join(dir, 'README.md')

  let hasPackageJson = false
  let hasReadme = false
  let name = path.basename(dir)
  let type = 'unknown'
  let language = 'unknown'
  let dependencies: string[] = []
  let devDependencies: string[] = []
  let mainFiles: string[] = []

  // Check for package.json
  if (fs.existsSync(packageJsonPath)) {
    hasPackageJson = true
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      name = packageJson.name || name
      dependencies = Object.keys(packageJson.dependencies || {})
      devDependencies = Object.keys(packageJson.devDependencies || {})

      // Determine project type and language
      if (dependencies.includes('react') || devDependencies.includes('react')) {
        type = 'react'
        language = 'typescript'
      } else if (dependencies.includes('vue') || devDependencies.includes('vue')) {
        type = 'vue'
        language = 'javascript'
      } else if (dependencies.includes('angular') || devDependencies.includes('@angular/core')) {
        type = 'angular'
        language = 'typescript'
      } else if (dependencies.includes('express')) {
        type = 'express'
        language = 'javascript'
      } else if (dependencies.includes('next')) {
        type = 'next'
        language = 'typescript'
      } else if (devDependencies.includes('@types/node')) {
        type = 'node'
        language = 'typescript'
      } else if (dependencies.includes('python')) {
        type = 'python'
        language = 'python'
      }
    } catch (error) {
      // Invalid package.json
    }
  }

  // Check for README
  hasReadme = fs.existsSync(readmePath)

  // Find main files
  const files = fs.readdirSync(dir)
  mainFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs'].includes(ext)
  })

  return {
    name,
    type,
    language,
    hasPackageJson,
    hasReadme,
    mainFiles,
    dependencies,
    devDependencies,
  }
}

export function generateProjectDescription(projectInfo: ProjectInfo): string {
  const {
    name,
    type,
    language,
    hasPackageJson,
    hasReadme,
    mainFiles,
    dependencies,
    devDependencies,
  } = projectInfo

  let description = `Project: ${name}\n`
  description += `Type: ${type}\n`
  description += `Language: ${language}\n`
  description += `Has package.json: ${hasPackageJson}\n`
  description += `Has README: ${hasReadme}\n`

  if (mainFiles.length > 0) {
    description += `Main files: ${mainFiles.slice(0, 5).join(', ')}${mainFiles.length > 5 ? '...' : ''}\n`
  }

  if (dependencies.length > 0) {
    description += `Key dependencies: ${dependencies.slice(0, 5).join(', ')}${dependencies.length > 5 ? '...' : ''}\n`
  }

  return description
}

export function validateDirectory(dir: string): { valid: boolean; error?: string } {
  if (!fs.existsSync(dir)) {
    return { valid: false, error: 'Directory does not exist' }
  }

  if (!fs.statSync(dir).isDirectory()) {
    return { valid: false, error: 'Path is not a directory' }
  }

  if (isRootDirectory(dir)) {
    return { valid: false, error: 'Cannot generate documentation for root directory' }
  }

  return { valid: true }
}
