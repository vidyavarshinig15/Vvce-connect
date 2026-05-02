'use client';
import { Mail, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support Ticket Created! Our campus team will contact you shortly.");
  };

  return (
    <div className="flex-grow bg-white flex flex-col items-center py-24 px-6 font-sans">
      
      {/* Heading Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-black text-black tracking-tight mb-4">
          Get In Touch
        </h1>
        <p className="text-gray-500 font-medium">
          We do love to hear from you. Please fill out the form below or use our contact details.
        </p>
      </div>

      {/* Info Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mb-16">
        {/* Email Card */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
            <Mail size={20} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-black text-lg mb-2">Email Us</h3>
          <p className="text-red-600 font-semibold text-sm">info@vvce.ac.in</p>
        </div>

        {/* Phone Card */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
            <Phone size={20} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-black text-lg mb-2">Call Us</h3>
          <p className="text-gray-400 font-medium text-sm italic">Available for Enterprise</p>
        </div>

        {/* Business Hours Card */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
            <Clock size={20} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-black text-lg mb-2">Business Hours</h3>
          <p className="text-gray-500 font-medium text-sm">Mon - Fri: 9:00 - 6:00 PM</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="w-full max-w-4xl bg-[#FAFAFA] border border-gray-100 rounded-3xl p-10 md:p-14 shadow-sm">
        <h2 className="text-center font-black text-xl tracking-wide mb-10 text-black uppercase">
          Send Us A Message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
              <input 
                required 
                type="text" 
                placeholder="John Doe" 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-black placeholder-gray-300" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Email</label>
              <input 
                required 
                type="email" 
                placeholder="john@example.com" 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-black placeholder-gray-300" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
            <input 
              required 
              type="text" 
              placeholder="How can we help you?" 
              className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-black placeholder-gray-300" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
            <textarea 
              required 
              rows={6} 
              className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-black placeholder-gray-300 resize-none" 
              placeholder="Your message here..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#B91C1C] text-white font-bold py-4 rounded-xl hover:bg-red-800 transition-colors text-center text-lg mt-4 shadow-lg shadow-red-900/20"
          >
            Send Message
          </button>
        </form>
      </div>

    </div>
  );
}