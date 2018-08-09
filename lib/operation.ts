import { observable, action } from 'mobx';
import { OperationStates } from './constants';
import { mergeData } from './utils';

/**
 * Operation class represents a unit of work
 */
export class Operation {
    /**
     * Unique name for operation.
     */
    private _name: string;
    /**
     * get name of operation
     * @returns string Name of Operation
     */
    get name() {
        return this._name
    }
    
    /**
     * Defines current state of operation
     */
    @observable private _operationState: OperationStates;
    /**
     * get current state of operation.
     * @returns Observable<OperationStated> current state of operation
     */
    get operationState() {
        return this._operationState;
    }

    /**
     * Data output of the operation
     */
    @observable private _data?: any;
    /**
     * get output data of operation
     * @returns Observable<any> data output of operation
     */
    get data() {
        return this._data;
    }

    /**
     * Error output of the operation
     */
    @observable private _error?: any;
    /**
     * Get error output og operation
     * @return Observable<any> error output of operation
     */
    get error() {
        return this._error;
    }

    /**
     * Callback method that will be called when this operations starts
     */
    private _startLogic: Function;

    /**
     * Constructor for Operation class
     * @param name string Unique name of Operation
     * @param startLogic Function Callback method for operation start
     */
    constructor(name: string, startLogic: Function) {
        if(!name) {
            throw new Error('name is mandatory');
        }
        if(typeof startLogic !== 'function') {
            throw new Error('startLogic must be a function');
        }

        this._name = name;
        this._startLogic = startLogic;
        this._operationState = OperationStates.notStarted;
    }

    /**
     * Start method. Call when this operation needs to be started.
     * @param persistOldData boolean. Set to true if you want to merge existing operation data with new output of startLogic
     * @param startArgs any. Arguments for startLogic
     */
    @action async start(persistOldData: boolean, ...startArgs: Array<any>) {
        this._operationState = OperationStates.pending;
        if (!persistOldData) {
            this._data = null;
        }
        this._error = null;

        if (this._startLogic) {
            this.end(await this._startLogic(...startArgs), false, persistOldData);
        }
    }

    /**
     * End Operation. Normally Operation class will itself end the operation on completion of startLogic if any.
     * @param data any Data for operation
     * @param isError boolean if operation errored out
     * @param shouldPersistOldData boolean. Set to true if you want to merge existing operation data with new output of startLogic
     */
    @action end(data: any, isError: boolean, shouldPersistOldData:boolean) {
        if (isError) {
            this._error = data;
        } else {
            this._data = shouldPersistOldData ?
                mergeData(this._data, data) :
                data;
        }
    }

    @action reset() {
        this._data = null;
        this._error = null;
        this._operationState = OperationStates.notStarted
    }
}
