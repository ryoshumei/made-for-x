'use client'

import React, {useState, FormEvent} from 'react';

export default function ExportInvoiceForm() {
    const [productName, setProductName] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 这里添加表单提交逻辑
        console.log('Form submitted with product name:', productName);
        // TODO: 发送数据到服务器或执行其他操作
    };

    return (
        <main className="flex-grow container mx-auto py-8">

            <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="productName" className="block text-gray-700 text-sm font-bold mb-2">
                        Product Name:
                    </label>
                    <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter Product Name"
                        required
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
    );
}