import * as ts from 'typescript'
import prettyTime from 'pretty-time'

import FancyReporter from './fancy'

const reporter = new FancyReporter()

type Options = {
  title: string
  color: string
}

const progress = {
  total: 0,
  loaded: 0,
  start: process.hrtime(),
}

export default function tscProgress(
  program: ts.Program,
  options: Options,
): ts.TransformerFactory<any> {
  const total = program.getRootFileNames().filter((filepath) => !filepath.endsWith('.d.ts')).length

  progress.total = total

  return () => {
    return (sourceFile: ts.SourceFile) => {
      progress.loaded += 1
      let percent = 99.9
      if (progress.total > 0) {
        percent = Math.round((100 * progress.loaded) / progress.total)
      }
      reporter.updateStatesArray([
        {
          name: options.title || 'TSC',
          progress: percent,
          color: options.color || 'green',
          details: [sourceFile.fileName],
          message:
            percent !== 100
              ? 'building'
              : `Compiled successfully in ${prettyTime(process.hrtime(progress.start))}`,
          hasErrors: false,
          done: false,
          start: null,
          request: null,
        },
      ])
      reporter.progress()
      return sourceFile
    }
  }
}

process.on('exit', () => {
  reporter.done()
})
