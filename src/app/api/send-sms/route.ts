import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { mobile, code } = body;

        console.log('API Route: Received request', { mobile, code });

        if (!mobile || !code) {
            return NextResponse.json({ error: 'Mobile and Code are required' }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_KAVENEGAR_API_KEY;
        const sender = process.env.NEXT_PUBLIC_KAVENEGAR_SENDER || "1000689696";

        if (!apiKey) {
            console.error('API Route: API Key is missing');
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
        }

        const message = `HesseKhub Code: ${code} (5min)`;
        // Convert to URLSearchParams for proper encoding
        const params = new URLSearchParams({
            receptor: mobile,
            message: message,
            sender: sender,
        });

        const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?${params.toString()}`;

        console.log('API Route: Sending request to Kavenegar Endpoint');

        const response = await fetch(url);
        const data = await response.json();

        console.log('API Route: Kavenegar Response', data);

        if (response.ok && data.return?.status === 200) {
            return NextResponse.json({ success: true, api_response: data });
        } else {
            console.error('API Route: Kavenegar Failed', data);
            return NextResponse.json(
                { error: 'SMS Provider Error', details: data },
                { status: data.return?.status || 500 }
            );
        }

    } catch (error: any) {
        console.error('API Route: Fatal Error', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
