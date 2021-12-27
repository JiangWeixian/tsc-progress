# tsc-progress
*build ts lib template*

[![npm](https://img.shields.io/npm/v/tsc-progress)](https://github.com/JiangWeixian/tsc-progress/tree/master) [![GitHub](https://img.shields.io/npm/l/tsc-progress)](https://github.com/JiangWeixian/tsc-progress/tree/master)

## install

```console
npm i tsc-progress
```
## usage

in `tsconfig.json`

```json
{
  // ...
  "plugins": [
    {
      "transform": "tsc-progress",
      "title": "TSC"
    }
  ]
}
```

`options`

- `title` - define progressbar title, default `TSC`
- `color` - define progressbar color, default `green`

# 
<div align='right'>

*built with ❤️ by 😼*

</div>