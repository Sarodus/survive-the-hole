import fs from 'fs'

let index = fs.readFileSync('./build/index.html').toString()

index = index.replace('<link rel="manifest" href="/app.json" />', '')

index = index.replace(/href=\"\//g, 'href="')

index = index.replace('__sveltekit',
    `const path = window.location.pathname.replace('/index.html', '').replace('/build/', '/build');
    __sveltekit`)

index = index.replace('base: "",', 'assets: path, base: path,')

index = index.replace('import("/_app', 'import(path+"/_app')
index = index.replace('import("/_app', 'import(path+"/_app')

fs.writeFileSync('./build/index.html', index)

