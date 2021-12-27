import FancyReporter from '../src/fancy'

const reporter = new FancyReporter()

const done = () => {
  reporter.done()
}

const progress = () => {
  let progress = 0
  setInterval(() => {
    progress += 10
    reporter.updateStatesArray([
      {
        progress,
        details: ['a'],
        color: 'blue',
        name: 'webpack',
        message: 'webpack-mesage',
        hasErrors: false,
        done: false,
        start: [80, 80],
        request: null,
      },
    ])
    reporter.progress()
  }, 1000)
}
