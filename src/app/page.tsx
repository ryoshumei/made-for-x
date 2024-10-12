'use client'
import Image from 'next/image'
import ExportInvoiceForm from "@/components/ExportInvoiceForm";

export default function Home() {

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex items-center">
                    <Image
                        src="/logo.svg" // Ensure you have a logo image in your public folder
                        alt="Logo"
                        width={50}
                        height={50}
                    />
                    <h1 className="ml-4 text-2xl font-bold">Export invoice generator for Japan Post</h1>
                </div>
            </header>

            <ExportInvoiceForm />

            {/* Footer - Updated styles */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p className="text-sm">© 2024 madeforx.com All Rights Reserved. Powered by OpenAI GPT-4o</p>
            </footer>
        </div>
    )
}