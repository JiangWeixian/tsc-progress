/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import fs from 'fs-extra'

const content = fs.readFileSync(path.join(__dirname, './fixtures/index.tpl')).toString()

export const main = async () => {
  const dir = path.join(__dirname, 'fixtures/fake')
  fs.ensureDirSync(dir)
  for (let i = 0; i < 1000; i++) {
    const filename = i === 0 ? 'index.ts' : `index${i}.ts`
    fs.outputFileSync(path.join(dir, filename), content)
  }
}
