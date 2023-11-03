import { HostBuilderMiddleWare } from "../interfaces";



export const configureLogging = (conf: any): HostBuilderMiddleWare => {
    const oldConsole = console
    const newConsole = {
        log: (data: any) => oldConsole.info(`${new Date}: ${data}`)
}


    return (ctx) => {
        ctx.events.on('preVmInit', ctx => {
            ctx.sandboxContext.console = newConsole
        })
        ctx.events.on('hostStarting', () => {
            newConsole.log("Host Starting")
        })
        ctx.events.on('hostStarted', () => {
            newConsole.log("Host Started")
        })
        ctx.events.on('hostStopping', () => {
            newConsole.log("Host Stopping")
        })
        ctx.events.on('hostStopping', () => {
            newConsole.log("Host Stopped... Goodbye")
        })
} 
}