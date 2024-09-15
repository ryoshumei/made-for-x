import Image from 'next/image'

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

            {/* Body */}
            <main className="flex-grow container mx-auto py-8">
                <form className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="productName" className="block text-gray-700 text-sm font-bold mb-2">ProductName:</label>
                        <input
                            type="text"
                            id="productName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter Product Name"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Generate Invoice
                    </button>
                </form>
            </main>

            {/* Footer - Updated styles */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p className="text-sm">© 2024 madeforx.com All Rights Reserved. Powered by OpenAI GPT-4o</p>
            </footer>
        </div>
    )
}