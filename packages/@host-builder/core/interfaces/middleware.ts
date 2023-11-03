import { HostedService } from "./hosts";

export type HostBuilderMiddleWare = (ctx: HostBuilderMiddleWareContext) => void
export type HostedServiceFactory = (args: any) => HostedService;
export type AsyncHostedServiceFactory = (args: any) => Promise<HostedService>


export type ServiceFactoryOrFilePath = string | HostedServiceFactory | AsyncHostedServiceFactory;

export interface HostBuilderMiddleWareContext {

    services: {
        register(service: ServiceFactoryOrFilePath): void
    }
    hooks: {
        preVmInitializedHook(cb: (ctx: InitializingContext) => void): void
        preStartHook(cb: (ctx: InitializingAfterRunScriptContext) => void): void
        postStartHook(cb: (ctx: InitializingAfterRunScriptContext) => void): void
        preStopHook(cb: (ctx: InitializingAfterRunScriptContext) => void): void
        postStopHook(cb: (ctx: InitializingAfterRunScriptContext) => void): void
    }

}

export interface InitializingContext {
    service: ServiceFactoryOrFilePath,
    sandboxContext: any,
}
export interface InitializingAfterRunScriptContext extends InitializingContext {
    evaledModule: any
}


