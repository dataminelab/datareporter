export interface InputAttribute {
    name: string,
    type: string
}

export interface OutputAttribute {
    name: string,
    nativeType: string
    type: string,
    isSupported?: boolean

}
