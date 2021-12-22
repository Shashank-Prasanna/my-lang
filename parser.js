/*
import {InvalidSyntaxError} from './error.js';
import ParseResult from './parser_classes/parseresult.js';
import {UnaryOpNode, BinOpNode, NumberNode} from './parser_classes/nodes.js';
*/

const { InvalidSyntaxError } = require('./error.js')
const ParseResult = require('./parser_classes/parseresult.js');
const {UnaryOpNode, BinOpNode, NumberNode} = require('./parser_classes/nodes.js');

let DIGITS = '0123456789'

let TT_INT = 'INT'
let TT_FLOAT = 'FLOAT'

let TT_PLUS = 'PLUS'
let TT_MINUS = 'MINUS'
let TT_MUL = 'MUL'
let TT_DIV = 'DIV'
let TT_LPAREN = 'LPAREN'
let TT_RPAREN = 'RPAREN'

let TT_EOF = 'EOF'


class Parser{
    constructor(tokens){
        this.tokens = tokens
        this.token_index = -1
        this.advance()
    }

    advance(){
        this.token_index += 1
        if(this.token_index < this.tokens.length){
            this.current_token = this.tokens[this.token_index]
        }
    }

    parse(){
        let result = this.expr()
        if(!result.error && this.current_token.type != 'EOF'){
            return result.failure(new InvalidSyntaxError(
                this.current_token.pos_start, this.current_token.pos_end,
                "Expected an operator"
            ))
        }
        return result
    }

    bin_op(func, ops){
        let result = new ParseResult()
        let left = result.register(func())
        if(result.error != null){
            return result
        }

        while(ops.includes(this.current_token.type)){
            let op_token = this.current_token
            result.register(this.advance())
            let right = result.register(func())
            if(result.error != null){
                return result
            }
            left = new BinOpNode(left, op_token, right)
        }

        return result.success(left)
    }

    factor(){
        let result = new ParseResult()
        let token = this.current_token

        if([TT_PLUS, TT_MINUS].includes(token.type)){
            result.register(this.advance())
            let factor = result.register(this.factor())
            if(result.error){
                return result
            }
            return result.success(new UnaryOpNode(token, factor))
        }

        else if([TT_INT, TT_FLOAT].includes(token.type)){
            result.register(this.advance())
            return result.success(new NumberNode(token))
        }

        else if(token.type == TT_LPAREN){
            result.register(this.advance())
            let expr = result.register(this.expr())
            if(result.error){
                return result
            }
            if(this.current_token.type == TT_RPAREN){
                result.register(this.advance())
                return result.success(expr)
            }
            else{
                return result.failure(new InvalidSyntaxError(
                    this.current_token.pos_start, this.current_token.pos_end,
                    "Expected ')'"                    
                ))
            }
        }
    
        return result.failure(new InvalidSyntaxError(
            this.current_token.pos_start, this.current_token.pos_end,
            'Expected int or float'
        ))
    }

    term(){
        let result = this.bin_op(this.factor.bind(this), [TT_MUL, TT_DIV])
        return result 
    }
  
    expr(){
        let result = this.bin_op(this.term.bind(this), [TT_PLUS, TT_MINUS])
        return result
    }

}

module.exports = Parser