// Type definitions for kavenegar package
declare module 'kavenegar' {
    interface KavenegarConfig {
        apikey: string;
    }

    interface SendParams {
        message: string;
        sender: string;
        receptor: string;
    }

    interface KavenegarAPI {
        Send: (params: SendParams, callback: (response: any, status: number) => void) => void;
    }

    function KavenegarApi(config: KavenegarConfig): KavenegarAPI;

    export = { KavenegarApi };
}
