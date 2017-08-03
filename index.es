const fs = require('fs')
const path = require('path')

function Token({ begin, end, offset, value }) {
    this.begin = begin
    this.end = end
    this.offset = offset
    this.value = value
}

function inliner(fpath, callback) {
    if (!fpath || typeof fpath !== 'string') {
        return callback(new Error(`[inline] expects first argument to be a string, ${typeof fpath} given`))
    }

    const re = /\brequire\s*\(\s*['"]([./]+[^'"]+)['"]\s*\)/g
    const tokens = []

    fs.readFile(path.resolve(fpath), 'utf8', (err, _data) => {
        if (err) { return callback(err) }

        let match
        let offset = 0
        while ((match = re.exec(_data)) !== null) {

            const [requireDeclaration, relativePath] = match
            const dpath = `${path.resolve(path.resolve(path.dirname(fpath)), relativePath)}.js`
            const required = require(dpath)
            const dependency = typeof required === 'function' ? String(required) : JSON.stringify(required)

            tokens.push(new Token({
                begin: match.index + offset,
                end: re.lastIndex + offset,
                offset,
                value: dependency,
            }))

            offset += dependency.length - requireDeclaration.length

        }

        let token
        let data = _data
        while ((token = tokens.shift())) {
            data = `${data.slice(0, token.begin)}${token.value}${data.slice(token.end)}`
        }

        return callback(null, data)
    })

}

/* istanbul ignore next */
if (require.main === module) { // called from CLI
    if (process.argv && process.argv[2]) {
        inliner(process.argv[2], (err, data) => {
            if (err) { throw err }
            process.stdout.write(data)
        })
    }
}


module.exports = inliner
