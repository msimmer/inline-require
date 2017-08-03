const should = require('chai').should()
const path = require('path')
const exec = require('child_process').exec

const index = process.env.NODE_ENV == 'coverage' ? '../index.es' : '../index'
const inline = require(index)

describe('inline-require', () => {
    it('should process local modules', (done) => {
        inline(path.join(__dirname, 'local-dependencies.js'), (err, contents) => {
            should.equal(err, null)
            contents.should.not.match(/require\('\./)
            done()
        })
    })
    it('should not process global modules', (done) => {
        inline(path.join(__dirname, 'global-dependency.js'), (err, contents) => {
            should.equal(err, null)
            contents.should.match(/require\('fs/)
            done()
        })
    })
    it('should preserve the types of inlined dependencies', (done) => {
        inline(path.join(__dirname, 'local-dependencies.js'), (err, contents) => {

            const mod = eval(contents)

            mod.should.have.property('array')
            mod.should.have.property('object')
            mod.should.have.property('number')
            mod.should.have.property('string')
            mod.should.have.property('func')


            mod.array.should.be.an('array').that.includes.all.members([1,2,3])
            mod.object.should.be.an('object').that.deep.equals({ foo: 'foo' })
            mod.number.should.be.a('number').that.equals(1)
            mod.string.should.be.a('string').that.equals('foo')

            mod.func.should.be.a('function')
            mod.func().should.equal('foo')

            done()
        })
    })
    it('should return an error if improper arguments are provided', () => {
        inline(null, err => err.should.be.an('Error') )
        inline({}, err => err.should.be.an('Error') )
        inline([], err => err.should.be.an('Error') )
    })
    it('should return an error if source file does not exist', (done) => {
        inline('./bogus', (err) => {
            err.should.be.an('Error')
            done()
        })
    })
    it('should return an error if a dependency does not exist', () => {
        // handled by native module loader
    })
    it('should run on the command line', (done) => {
        exec(`node ${index} ./local-dependencies.js`, { cwd: __dirname }, (err, stdout, stderr) => {
            should.equal(err, null)
            should.equal(stderr, '')
            stdout.should.match(/const array = \[1,2,3\]/)
            done()
        })
    })
})
