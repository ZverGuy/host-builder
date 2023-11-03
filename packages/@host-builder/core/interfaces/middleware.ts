import { HostEvents, HostedService } from "./hosts";
import TypedEmitter from 'typed-emitter'
export type HostBuilderMiddleWare = (ctx: HostBuilderMiddleWareContext) => void
export type HostedServiceFactory = (args: any) => HostedService;
export type AsyncHostedServiceFactory = (args: any) => Promise<HostedService>


export type ServiceFactoryOrFilePath = string | HostedServiceFactory | AsyncHostedServiceFactory;



export type ServiceEvents = {
    preVmInit: (ctx: InitializingContext) => void,
    preStart: (ctx: InitializingAfterRunScriptContext) => void,
    postStart: (ctx: InitializingAfterRunScriptContext) => void,
    preStop: (ctx: StoppingContext) => void,
    postStop: (ctx: StoppingContext) => void,
}
export interface HostBuilderMiddleWareContext {

    services: {
        register(service: ServiceFactoryOrFilePath, ...args: any[]): void
    }
    events: TypedEmitter<ServiceEvents & HostEvents>

}

export interface InitializingContext {
    service: ServiceFactoryOrFilePath,
    sandboxContext: any,
}
export interface InitializingAfterRunScriptContext extends InitializingContext {
    evaledModule: any
}

export interface StoppingContext {
    evaledModule: any
}


