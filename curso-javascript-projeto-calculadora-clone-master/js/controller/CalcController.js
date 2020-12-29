class CalcController {
    
    constructor(){

        this._audio = new Audio('click.mp3');

        this._audioOnOff = false;
        this._lastOperator = '';    // recebe o ultimo operador +-/*
        this._lastNumber = '';      // recebe o ultimo numero

        this._operation = [];       // guarda toda operação digitada na calculadora
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");

        this._currentDate;

        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    copyToClipboard(){

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    pasteFromClipboard(){

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text);
        });

    }

    initialize(){

        this.setDisplayDateTime();

        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();                      // atualizar o display
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();

            });

        });

    }

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;

    }

    playAudio(){
        if(this._audioOnOff){
            this._audio.currentTime = 0;    // reseta o audio caso precise tocar novamente
            this._audio.play();
        }
    }

    initKeyboard(){

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch(e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();       // falz calculo da conta
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }

    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event => {

            // false evita que o evento aconteça mais de uma vez, pois existe 2 camadas nos botões
            element.addEventListener(event, fn, false); 

        });

    }

    clearAll(){
        
        this._operation = [];           // zera o array
        this._lastNumber = '';
        this._lastOperator = '';

        this.setLastNumberToDisplay();  // atualizar o display
    }

    clearEntry(){
        this._operation.pop();          // remove ultima posição no array
        this.setLastNumberToDisplay();  // atualizar o display
    }

    getLastOperation(){
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value){
        this._operation[this._operation.length-1] = value;
    }

    isOperator(value){
        return (['+','-','*','%','/'].indexOf(value) > -1);
    }

    pushOperation(value){

        this._operation.push(value);    // add no array

        if(this._operation.length > 3){

            this.calc();

        }

    }

    getResult(){
        try {
            return eval(this._operation.join(""));
        } catch(e){
            setTimeout(()=> {
                this.setError();
            },1);
        }
    }

    // faz o calculo math
    calc(){

        let last = '';

        this._lastOperator = this.getLastItem();        // pega o ultimo operador

        // se tiver 2 itens dentro do array
        if(this._operation.length < 3){

            let firstItem = this._operation[0];
            // faz um array para calcular 3 itens
            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3){

            last = this._operation.pop();                   // tira o ultimo elemento do array

            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3){

            this._lastNumber = this.getLastItem(false);     // pega o ultimo numero

        }
        
        let result = this.getResult();

        if(last == '%'){

            result /= 100;  // divide por 100 para obter a porcentagem
            this._operation = [result];               // junta o resultado do math, mas o operador


        } else {

            this._operation = [result];               // junta o resultado do math, mas o operador

            if(last) this._operation.push(last);    // add se tiver conteudo dentro de last

        }

        this.setLastNumberToDisplay();                      // atualizar o display

    }

    // por padrão ele retorna um operador, se for false retorna um numero
    getLastItem(isOperator = true){

        let lastItem;
        
        for(let i = this._operation.length-1; i >= 0; i--){
            // se true retorna um operador, se false retorna um numero
            if(this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }

        }

        if(!lastItem){
            // se for verdadeiro pega o operador, false pega o numero
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;

    }

    // atualizar o display com os numeros
    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);   // pega o ultimo numero da operação

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;  // mostra o numero na calculadora

    }

    // adiciona o calculo no array
    addOperation(value){

        if(isNaN(this.getLastOperation())){
            // string
            if(this.isOperator(value)){
                // trocar o operador
                this.setLastOperation(value);   // substitui o valor antigo pelo novo
            } else {
                this.pushOperation(value);      // add numero no array
                this.setLastNumberToDisplay();  // atualizar o display
            }
        } else {

            if(this.isOperator(value)){
                this.pushOperation(value);    // se for um operador add no array
            } else {
                // se for outro numero converte tudo para string para junta os numeros
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);   // substitui o valor antigo pelo novo

                // atualizar o display
                this.setLastNumberToDisplay();

            }

        }

    }

    setError(){
        this.displayCalc = "Error";
    }

    addDot(){

        let lastOperation = this.getLastOperation();

        // se existir um ponto dentro de lastOperation não deixa executar codigo abaixo
        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');   // se tiver vazio quando apertar o ponto add 0.
        } else {
            // se tiver numeros quando apertar o ponto add number.
            this.setLastOperation(lastOperation.toString() + '.'); 
        }

        this.setLastNumberToDisplay();

    }

    execBtn(value){

        this.playAudio();

        switch(value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();       // falz calculo da conta
                break;
            case 'ponto':
                this.addDot();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        
        buttons.forEach((btn, index) =>{

            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-","");
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=> {
                btn.style.cursor = "pointer";
            });

        });

    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        if(value.toString().length > 10){
            this.setError();    // se passar de 10 digitos dá erro
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}