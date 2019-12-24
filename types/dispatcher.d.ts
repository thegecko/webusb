/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * @hidden
 */
export interface TypedDispatcher<T> {
    addEventListener<K extends keyof T>(type: K, listener: (event: CustomEvent<T[K]>) => void): void;
    removeEventListener<K extends keyof T>(type: K, callback: (event: CustomEvent<T[K]>) => void): void;
    dispatchEvent(event: CustomEvent<T>): boolean;
    dispatchEvent<K extends keyof T>(type: K, detail: T[K]): boolean;
    addListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    once<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    prependListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    prependOnceListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    removeListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
    listeners<K extends keyof T>(event: K): Array<Function>;
    emit<K extends keyof T>(event: K, data: T[K]): boolean;
    eventNames<K extends keyof T>(): Array<K>;
    listenerCount<K extends keyof T>(type: K): number;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
}
/**
 * @hidden
 */
export declare class EventDispatcher extends EventEmitter implements EventTarget {
    private isEventListenerObject;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void;
    dispatchEvent(event: Event): boolean;
    dispatchEvent<T>(type: string, detail: T): boolean;
}
