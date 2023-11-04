
console.log('1')

const {configureLogging, currentThreadWorker} = require('@host-builder/core/middlewares');
const {createHostBuilder} = require('@host-builder/core')
const Executetable = (args) => ({
    iterval: undefined,
    async start() {

        this.iterval = setInterval(() => {
            console.log('cur time ' + new Date())
        }, 1000)
    },
    async stop() {
        clearInterval(this.iterval)
    }
})

const host = createHostBuilder()
    .use(configureLogging(), currentThreadWorker('./worker.js'), currentThreadWorker(Executetable)).build();


(async () => {
    
    await host.start()


    setTimeout(() => {
        host.stop()
    }, 10000)
    
})()


