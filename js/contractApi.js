const CONTRACT_ADDRESS = "n1yQzFrBWi5xEae1Tkyo42CvBJ1cvPGCs4u";
			
class SmartContractApi {
    constructor(contractAdress) {
        let NebPay = require("nebpay"); 
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this.contractAdress;
    }

    _simulateCall({ value = "0", callArgs = "[]", callFunction , callback }) {
        this.nebPay.simulateCall(this._contractAdress, value, callFunction, callArgs, {  
            callback: function(resp){
                if(callback){
                    callback(resp);
                }           
            }   
        });
    }
    
    _call({ value = "0", callArgs = "[]", callFunction , callback }) {
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {  
            callback: function(resp){
                if(callback){
                    callback(resp);
                }           
            }   
        });
    } 
}

class HoleContractApi extends SmartContractApi{

    add(text,cb) {
        this._call({
            callArgs : `[${Date.now()}, "${text}"]`,
            callFunction : "add", 
            callback: cb
        });
    }      

    get(cb){
        this._simulateCall({            
            callFunction : "get", 
            callback: cb
        });;
    }

}
