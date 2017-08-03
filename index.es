const fs = require('fs')
const path = require('path')

const REGEXP_REQUIRE = new RegExp(/\brequire\s*\(\s*['"]([./]+[^'"]+)['"]\s*\)/)

function inliner(fpath, callback) {
    if (!fpath || typeof fpath !== 'string') {
        return callback(new Error(`[inline] expects first argument to be a string, ${typeof fpath} given`))
    }


    if (!fs.existsSync(path.resolve(fpath))) {
        return callback(new Error(`${fpath} does not exist, aborting`))
    }

    fs.readFile(path.resolve(fpath), 'utf8', (err, data) => {
        if (err) { return callback(err) }

        let contents = data
        let match

        while ((match = REGEXP_REQUIRE.exec(contents))) {

            const [requireDeclaration, relativePath] = match
            const dpath = `${path.resolve(path.resolve(path.dirname(fpath)), relativePath)}.js`

            if (!fs.existsSync(dpath)) {
                return callback(new Error(`Dependency [${dpath}] does not exist, aborting`))
            }

            const dependency = JSON.stringify(require(dpath))
            contents = contents.replace(requireDeclaration, dependency)

        }


        return callback(null, contents)
    })

}

if (require.main === module) { // called from CLI
    if (process.argv && process.argv[2]) {
        inliner(process.argv[2], (err, data) => {
            if (err) { throw err }
            process.stdout.write(data)
        })
    }
}


module.exports = inliner
