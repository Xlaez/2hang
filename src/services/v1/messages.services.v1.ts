import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";

export class MessageService extends DolphServiceHandler<Dolph>{
    constructor(){
        super("message");
    }

    
}