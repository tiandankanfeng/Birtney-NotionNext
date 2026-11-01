/** @jest-environment node */
import fs from 'node:fs'
import vm from 'node:vm'

describe('fork dependency validation', () => {
  function validatePackage(packageJson) {
    const context = {
      require: name =>
        name === 'fs'
          ? { readFileSync: () => JSON.stringify(packageJson) }
          : require(name),
      module: { exports: {} },
      process,
      console
    }
    vm.createContext(context)
    vm.runInContext(
      fs.readFileSync('scripts/final-validation.js', 'utf8'),
      context
    )

    return context.validateDependencies('package.json')
  }

  it('accepts the dependencies of the synced project', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(validatePackage(packageJson)).toBe(true)
  })

  it('still rejects an outdated Next.js dependency', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    packageJson.dependencies.next = '^14.2.30'
    expect(validatePackage(packageJson)).toBe(false)
  })
})
