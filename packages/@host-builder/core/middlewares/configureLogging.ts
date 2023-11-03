import { HostBuilderMiddleWare } from "../interfaces";



export const configureLogging = (conf: any): HostBuilderMiddleWare => {
    const oldConsole = console

    return (ctx) => {

        ctx.services.register((args: any) => {


            return {
                async start() {
                    console.log("lol start")
                },
                async stop() {
                    console.log("lol end")

                }
            }
        })
        ctx.hooks.preVmInitializedHook((ctx) => {
            ctx.sandboxContext.console = {
                log: (data: any) => oldConsole.info(`${new Date}: ${data}`)
    }})

        }
}