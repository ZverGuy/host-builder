import { start } from "repl";
import { HostBuilderMiddleWare, HostedService, ServiceFactoryOrFilePath } from "../interfaces";
import { readFileSync } from "fs";

export const currentThreadWorker = (worker: ServiceFactoryOrFilePath | string , initialData: any[]): HostBuilderMiddleWare => {


    return (ctx) => {
            ctx.services.register(typeof worker === 'string' ? {source: worker, currentFilePath: undefined} : worker, initialData)
        }


        
}


export const otherThreadWorker = (worker: ServiceFactoryOrFilePath, initialData: any[]): HostBuilderMiddleWare => {
    const isFunction = typeof worker === 'function'
    const source = isFunction ? worker.toString() : worker.source
    const backgroundWorkerInitialData = {
        source,
        initialData
    }
    return (ctx) => {
            ctx.services.register({source: '../internals/backgroundWorker.js', currentFilePath: module.path},  backgroundWorkerInitialData)
        }
}