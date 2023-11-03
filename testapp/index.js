
const {createHostBuilder} = require('../dist/@host-builder/core');
const {configureLogging} = require('../dist/@host-builder/core/middlewares');

(async () => {
    const host = createHostBuilder()
    .use(configureLogging()).build();
    await host.start()

    await host.stop()
})()
