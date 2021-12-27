// @ts-nocheck
// progress bar code from refs: https://github.com/unjs/webpackbar
import chalk from 'chalk'
import _consola from 'consola'
import ansiEscapes from 'ansi-escapes'
import wrapAnsi from 'wrap-ansi'
import figures from 'figures'

const { bullet, tick, cross, radioOff, pointerSmall } = figures
// const nodeModules = `${delimiter}node_modules${delimiter}`
const BAR_LENGTH = 25
const BLOCK_CHAR = '█'
const BLOCK_CHAR2 = '█'
const NEXT = ` ${chalk.blue(pointerSmall)} `
const BULLET = bullet
const TICK = tick
const CROSS = cross
const CIRCLE_OPEN = radioOff

function range(len) {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

export const consola = _consola.withTag('webpackbar')

export const colorize = (color) => {
  if (color[0] === '#') {
    return chalk.hex(color)
  }

  return chalk[color] || chalk.keyword(color)
}

export const renderBar = (progress, color) => {
  const w = progress * (BAR_LENGTH / 100)
  const bg = chalk.white(BLOCK_CHAR)
  const fg = colorize(color)(BLOCK_CHAR2)

  return range(BAR_LENGTH)
    .map((i) => (i < w ? fg : bg))
    .join('')
}

export function ellipsis(str, n) {
  if (str.length <= n - 3) {
    return str
  }
  return `${str.substr(0, n - 1)}...`
}

export function ellipsisLeft(str, n) {
  if (str.length <= n - 3) {
    return str
  }
  return `...${str.substr(str.length - n - 1)}`
}

export const formatRequest = (request) => {
  const loaders = request.loaders.join(NEXT)

  if (!loaders.length) {
    return request.file || ''
  }

  return `${loaders}${NEXT}${request.file}`
}

// Based on https://github.com/sindresorhus/log-update/blob/master/index.js

const originalWrite = Symbol('webpackbarWrite')
class LogUpdate {
  private prevLineCount: any
  private listening: any
  private extraLines: any
  private _streams: any

  constructor() {
    this.prevLineCount = 0
    this.listening = false
    this.extraLines = ''
    this._onData = this._onData.bind(this)
    this._streams = [process.stdout, process.stderr]
  }

  render(lines) {
    this.listen()

    const wrappedLines = wrapAnsi(lines, this.columns, {
      trim: false,
      hard: true,
      wordWrap: false,
    })

    const data = `${ansiEscapes.eraseLines(this.prevLineCount) + wrappedLines}\n${this.extraLines}`

    this.write(data)

    const _lines = data.split('\n')
    this.prevLineCount = _lines.length

    // Count wrapped line too
    // https://github.com/unjs/webpackbar/pull/90
    // TODO: Count length with regards of control chars
    // this.prevLineCount += _lines.reduce((s, l) => s + Math.floor(l.length / this.columns), 0)
  }

  get columns() {
    return (process.stderr.columns || 80) - 2
  }

  write(data) {
    const stream = process.stderr
    if (stream.write[originalWrite]) {
      stream.write[originalWrite].call(stream, data, 'utf-8')
    } else {
      stream.write(data, 'utf-8')
    }
  }

  clear() {
    this.done()
    this.write(ansiEscapes.eraseLines(this.prevLineCount))
  }

  done() {
    this.stopListen()

    this.prevLineCount = 0
    this.extraLines = ''
  }

  _onData(data) {
    const str = String(data)
    const lines = str.split('\n').length - 1
    if (lines > 0) {
      this.prevLineCount += lines
      this.extraLines += data
    }
  }

  listen() {
    // Prevent listening more than once
    if (this.listening) {
      return
    }

    // Spy on all streams
    for (const stream of this._streams) {
      // Prevent overriding more than once
      if (stream.write[originalWrite]) {
        continue
      }

      // Create a wrapper fn
      const write = (data, ...args) => {
        if (!stream.write[originalWrite]) {
          return stream.write(data, ...args)
        }
        this._onData(data)
        return stream.write[originalWrite].call(stream, data, ...args)
      }

      // Backup original write fn
      write[originalWrite] = stream.write

      // Override write fn
      stream.write = write
    }

    this.listening = true
  }

  stopListen() {
    // Restore original write fns
    for (const stream of this._streams) {
      if (stream.write[originalWrite]) {
        stream.write = stream.write[originalWrite]
      }
    }

    this.listening = false
  }
}

const logUpdate = new LogUpdate()

let lastRender = Date.now()

export interface State {
  start: [number, number] | null
  progress: number
  done: boolean
  message: string
  details: string[]
  request: null | {
    file: null | string
    loaders: string[]
  }
  hasErrors: boolean
  color: string
  name: string
}

export default class FancyReporter {
  statesArray: State[]

  updateStatesArray(statesArray: State[]) {
    this.statesArray = statesArray
  }

  allDone() {
    logUpdate.done()
  }

  done() {
    this._renderStates(this.statesArray)

    if (this.hasErrors) {
      logUpdate.done()
    }
  }

  progress() {
    if (Date.now() - lastRender > 50) {
      this._renderStates(this.statesArray)
    }
  }

  _renderStates(statesArray: State[]) {
    lastRender = Date.now()

    const renderedStates = statesArray.map((c) => this._renderState(c)).join('\n\n')

    logUpdate.render(`\n${renderedStates}\n`)
  }

  _renderState(state: State) {
    const color = colorize(state.color)

    let line1
    let line2

    if (state.progress >= 0 && state.progress < 100) {
      // Running
      line1 = [
        color(BULLET),
        color(state.name),
        renderBar(state.progress, state.color),
        state.message,
        `(${state.progress || 0}%)`,
        chalk.grey(state.details[0] || ''),
        chalk.grey(state.details[1] || ''),
      ].join(' ')

      line2 = state.request
        ? ` ${chalk.grey(ellipsisLeft(formatRequest(state.request), logUpdate.columns))}`
        : ''
    } else {
      let icon = ' '

      if (state.hasErrors) {
        icon = CROSS
      } else if (state.progress === 100) {
        icon = TICK
      } else if (state.progress === -1) {
        icon = CIRCLE_OPEN
      }

      line1 = color(`${icon} ${state.name}`)
      line2 = chalk.grey(`  ${state.message}`)
    }

    return `${line1}\n${line2}`
  }
}
