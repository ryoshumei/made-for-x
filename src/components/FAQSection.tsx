interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

// Visible FAQ that mirrors FAQStructuredData: Google requires FAQ structured data
// to reflect content that is actually on the page, and AI search engines can only
// cite content present in the rendered HTML.
export default function FAQSection({ items }: FAQSectionProps) {
  return (
    <section aria-labelledby="faq-heading" className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 id="faq-heading" className="text-xl font-semibold text-gray-900 mb-4">
          よくある質問
        </h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium text-gray-800 mb-2">Q. {item.question}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
