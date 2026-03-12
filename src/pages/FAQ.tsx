import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      q: "How fast is shipping?",
      a: "We ship within 24-48 hours of your order. Domestic shipping takes 2-4 business days. International can take 7-14 days depending on how far you are from the noise."
    },
    {
      q: "What is your return policy?",
      a: "If the vibe isn't right, you have 30 days to return it. Items must be unworn and unwashed. We don't accept returns on items damaged in the mosh pit."
    },
    {
      q: "How do your shirts fit?",
      a: "Our shirts are a modern, slightly oversized streetwear fit. If you want it tight, size down. If you want it baggy, stick to your true size. Check the size guide on each product page."
    },
    {
      q: "Do you do custom designs?",
      a: "Not for individuals, but we're always looking for underground artists to collaborate with. Hit us up on the contact page."
    }
  ];

  return (
    <div className="min-h-screen bg-black py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-16 text-center">FAQ</h1>
        <div className="space-y-12">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/5 pb-12">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-emerald-500">{faq.q}</h3>
              <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
