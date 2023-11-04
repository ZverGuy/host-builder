const http = require('http')

module.exports = (args) => {


    return {

        async start() {
           throw new Error()
        },
        async stop() {
            console.log('2222')
        }
    }
}