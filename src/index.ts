import * as ts from 'typescript'
import fs from 'fs'
import path from 'path'
import os from 'os'
import FancyReporter from './fancy'

const reporter = new FancyReporter()

export default function tscProgress(_program: ts.Program) {
  let total = 0
  const totalFilePath = path.resolve(os.tmpdir(), './tsc-progress')
  try {
    total = Number(fs.readFileSync(totalFilePath).toString())
  } catch (e) {
    fs.writeFileSync(totalFilePath, '0')
  }

  const progress = {
    total,
    loaded: 0,
  }

  return {
    before(_ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        progress.loaded += 1
        let percent = 80
        if (progress.total > 0) {
          percent = Math.round((100 * progress.loaded) / progress.total)
        }
        reporter.updateStatesArray([
          {
            name: 'webpack',
            progress: percent,
            color: 'blue',
            details: [sourceFile.fileName],
            message: '',
            hasErrors: false,
            done: false,
            start: null,
            request: null,
          },
        ])
        reporter.progress()
        fs.writeFileSync(totalFilePath, progress.loaded.toString())
        return sourceFile
      }
    },
  }
}

process.on('exit', () => {
  reporter.done()
})
