import { HostBuilder } from "../interfaces/hosts"
import { HostBuilderMiddleWare } from "../interfaces/middleware";
import { HostImpl } from "./host";




export const createHostBuilder = (): HostBuilder => {

    

    let middlewaresList: any[] = []
    return {
        use(...middlewares: HostBuilderMiddleWare[]): HostBuilder {
            middlewaresList = middlewaresList.concat(middlewares)
            return this;
            
        },

        build() {
            return new HostImpl(middlewaresList)
        }
    } 
}