
console.log('1')

const {createHostBuilder} = require('../dist/@host-builder/core');
const {configureLogging, currentThreadWorker} = require('../dist/@host-builder/core/middlewares');


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
    .use(configureLogging(), currentThreadWorker(Executetable)).build();


(async () => {
    
    await host.start()


    setTimeout(() => {
        host.stop()
    }, 10000)
    
})()


