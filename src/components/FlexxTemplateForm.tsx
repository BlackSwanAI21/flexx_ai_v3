import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FlexxTemplateFormProps {
  onSubmit: (prompt: string) => void;
}

export function FlexxTemplateForm({ onSubmit }: FlexxTemplateFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [service, setService] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWebsite, setClientWebsite] = useState('');
  const [clientOffer, setClientOffer] = useState('');
  const [openingMessage, setOpeningMessage] = useState('');
  const [openingTimes, setOpeningTimes] = useState('');
  const [qualifiedProspect, setQualifiedProspect] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);

  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format FAQs for the prompt
    const formattedFAQs = faqs
      .filter(faq => faq.question && faq.answer)
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join('\n');

    // Construct the prompt template
    const prompt = `Your job is to qualify leads over SMS for ${clientIndustry}. You will complete your job by asking questions related to 'the qualified prospect' section. If a user doesn't follow the conversational direction, default to your SPIN selling training to keep them engaged. Always stay on topic and do not use conciliatory phrases ("Ah, I see", "I hear you", etc.) when the user expresses disinterest.
###
Your Output style: casual message, empathetic, conversational, ${country} Idiom, 
###
Your training: SPIN Selling, ${service}
###
Qualified prospect section:
${qualifiedProspect}
5) if they're not free to speak with an adviser now, ask them what day and time they're free to speak
6) When they agree to a time to talk tell them we will call from this phone number: ${clientPhone} ( do not send the phone number until they agree a time to speak)
###
Rules: Only ask one question at a time to find out one piece of information. Persistently engage with the user, avoiding any phrases that acknowledge rejection. Utilize SPIN selling training to navigate through objections and guide your interactions. You are not AI; you are Sarah, working in admin at ${companyName}. If a user asks you a question we haven't provided you with an answer to default to telling them you're in admin and you can schedule a call with an adviser who can better help them. IMPORTANT if a user appears angry that we're messaging them you must output this word exactly how I type it 'goodbye' - we will stop the conversation.
###
Note: This is the message they're responding to: "${openingMessage}". Therefore, omit introductions & begin conversation.
###
FAQ:
- We are ${companyName}
- They submitted an inquiry via our website a few days ago
- We're open from ${openingTimes}
- If they ask where we got their details from you MUST tell them "You made an enquiry via our website, if you no longer wish to speak with us, reply with the word 'delete'"
${formattedFAQs}`;

    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <Input
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
        <Input
          label="Client Industry"
          value={clientIndustry}
          onChange={(e) => setClientIndustry(e.target.value)}
          required
        />
        <Input
          label="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
        />
        <Input
          label="Client Phone Number"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          required
        />
        <Input
          label="Client Website"
          value={clientWebsite}
          onChange={(e) => setClientWebsite(e.target.value)}
          required
        />
        <Input
          label="Client Offer"
          value={clientOffer}
          onChange={(e) => setClientOffer(e.target.value)}
          required
        />
        <Input
          label="Client Opening Times"
          value={openingTimes}
          onChange={(e) => setOpeningTimes(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Opening Message</label>
        <textarea
          value={openingMessage}
          onChange={(e) => setOpeningMessage(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Qualified Prospect Section</label>
        <textarea
          value={qualifiedProspect}
          onChange={(e) => setQualifiedProspect(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Client FAQ</h3>
          <Button
            type="button"
            onClick={handleAddFAQ}
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        {faqs.map((faq, index) => (
          <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-700">FAQ #{index + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveFAQ(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer</label>
                <input
                  type="text"
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Generate Prompt
        </Button>
      </div>
    </form>
  );
}