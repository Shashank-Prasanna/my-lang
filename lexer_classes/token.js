export default class Token{
    constructor(type, value=null, pos_start=null, pos_end=null){
        this.type = type
        this.value = value

        if(pos_start){
            this.pos_start = pos_start.copy()
            this.pos_end = pos_start.copy()
            this.pos_end.advance()
        }

        if(pos_end){
            this.pos_end = po_end
        }
    }

    repr(){
        if(this.value){
            return `${this.type}(${this.value})`
        }

        return `${this.type}`
    }
}