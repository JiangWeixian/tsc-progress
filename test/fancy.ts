import FancyReporter from '../src/fancy'

const reporter = new FancyReporter()

export const progress = () => {
  let progress = 0
  setInterval(() => {
    if (progress >= 100) {
      return
    }
    progress += 10
    reporter.updateStatesArray([
      {
        progress,
        details: [],
        color: 'green',
        name: 'TSC',
        message: progress === 100 ? 'Success' : 'Building',
        hasErrors: false,
        done: false,
        start: null,
        request: null,
      },
    ])
    reporter.progress()
    if (progress === 100) {
      reporter.done()
    }
  }, 1000)
}
