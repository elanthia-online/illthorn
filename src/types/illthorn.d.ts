declare namespace Illthorn {
  export type LichSessionDescriptor = 
      { name: string
      ; host: string
      ; port: number
      }
      
  export namespace Session {
    interface Config 
      { port : number
      ; name : string
      }
    
    interface Pojo 
      { name: string
      ; port: number
      }
  }
}