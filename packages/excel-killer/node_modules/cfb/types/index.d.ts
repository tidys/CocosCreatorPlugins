/* index.d.ts (C) 2013-present SheetJS */
// TypeScript Version: 2.2

/** Version string */
export const version: string;

/** Parse a buffer or array */
export function parse(f: CFB$Blob, options?: CFB$ParsingOptions): CFB$Container;

/** Read a blob or file or binary string */
export function read(f: CFB$Blob | string, options?: CFB$ParsingOptions): CFB$Container;

/** Find a file entry given a path or file name */
export function find(cfb: CFB$Container, path: string): CFB$Entry | null;

/** Generate a container file */
export function write(cfb: CFB$Container, options?: any): any;

/** Write a container file to the filesystem */
export function writeFile(cfb: CFB$Container, filename: string, options?: any): any;

/** Utility functions */
export const utils: CFB$Utils;


/** Options for read and readFile */
export interface CFB$ParsingOptions {
    /** Input data encoding */
    type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array';

    /** If true, throw errors when features are not understood */
    WTF?: boolean;

    /** If true, include raw data in output */
    raw?: boolean;
}

export type CFB$Blob = number[] | Uint8Array;

export enum CFB$EntryType { unknown, storage, stream, lockbytes, property, root }
export enum CFB$StorageType { fat, minifat }

/** CFB File Entry Object */
export interface CFB$Entry {
    /** Case-sensitive internal name */
    name: string;

    /** CFB type (salient types: stream, storage) -- see CFB$EntryType */
    type: number;

    /** Raw Content (Buffer when available, Array of bytes otherwise) */
    content: CFB$Blob;

    /** Creation Time */
    ct?: Date;

    /** Modification Time */
    mt?: Date;

    /** Red/Black Tree color: 0 = red, 1 = black */
    color: number;

    /** Class ID represented as hex string */
    clsid: string;

    /** User-Defined State Bits */
    state: number;

    /** Starting Sector */
    start: number;

    /** Data Size */
    size: number;

    /** Storage location -- see CFB$StorageType */
    storage?: string;
}

/* File object */
export interface CFB$Container {
    /* List of streams and storages */
    FullPaths: string[];

    /* Array of entries in the same order as FullPaths */
    FileIndex: CFB$Entry[];

    /* Raw Content, in chunks (Buffer when available, Array of bytes otherwise) */
    raw?: {
        header: CFB$Blob,
        sectors: CFB$Blob[];
    };
}

/** General utilities */
export interface CFB$Utils {
    cfb_new(opts?: any): CFB$Container;
    cfb_add(cfb: CFB$Container, name: string, content: any, opts?: any): CFB$Entry;
    cfb_del(cfb: CFB$Container, name: string): boolean;
    cfb_mov(cfb: CFB$Container, old_name: string, new_name: string): boolean;
    cfb_gc(cfb: CFB$Container): void;
    ReadShift(size: number, t?: string): number|string;
    WarnField(hexstr: string, fld?: string): void;
    CheckField(hexstr: string, fld?: string): void;
    prep_blob(blob: any, pos?: number): CFB$Blob;
    bconcat(bufs: any[]): any;
}
