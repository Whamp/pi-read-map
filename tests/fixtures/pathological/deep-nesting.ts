// TypeScript file with 20 levels of nesting for stress testing

export namespace Level0 {
  export const value0 = 0;

  export namespace Level1 {
    export const value1 = 1;

    export namespace Level2 {
      export const value2 = 2;

      export namespace Level3 {
        export const value3 = 3;

        export namespace Level4 {
          export const value4 = 4;

          export namespace Level5 {
            export const value5 = 5;

            export namespace Level6 {
              export const value6 = 6;

              export namespace Level7 {
                export const value7 = 7;

                export namespace Level8 {
                  export const value8 = 8;

                  export namespace Level9 {
                    export const value9 = 9;

                    export namespace Level10 {
                      export const value10 = 10;

                      export namespace Level11 {
                        export const value11 = 11;

                        export namespace Level12 {
                          export const value12 = 12;

                          export namespace Level13 {
                            export const value13 = 13;

                            export namespace Level14 {
                              export const value14 = 14;

                              export namespace Level15 {
                                export const value15 = 15;

                                export namespace Level16 {
                                  export const value16 = 16;

                                  export namespace Level17 {
                                    export const value17 = 17;

                                    export namespace Level18 {
                                      export const value18 = 18;

                                      export namespace Level19 {
                                        export const value19 = 19;

                                        export class DeepestClass {
                                          private value: number = 20;

                                          getValue(): number {
                                            return this.value;
                                          }

                                          setValue(v: number): void {
                                            this.value = v;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
