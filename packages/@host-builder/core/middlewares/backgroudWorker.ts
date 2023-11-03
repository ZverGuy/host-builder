import { start } from "repl";
import { HostBuilderMiddleWare, HostedService, ServiceFactoryOrFilePath } from "../interfaces";
import { readFileSync } from "fs";

export const currentThreadWorker = (worker: ServiceFactoryOrFilePath, initialData: any[]): HostBuilderMiddleWare => {


    const isFunction = typeof worker === 'function'
    const source = isFunction ? worker.toString() : readFileSync(worker).toString()

    return (ctx) => {
            ctx.services.register((args) => {
                const src = args[0]
                const isF = args[1]
                const inData = args[2]
                let obj: HostedService
                if(isF) {
                    obj = eval(src)(inData)
                } else {
                    obj = require(src)(inData)

                }
                return {


                    async start() {
                        await obj.start()
                    },
    
                    async stop() {
                        await obj.stop()
                    },
                }
            }, source, isFunction, initialData)
        }

}