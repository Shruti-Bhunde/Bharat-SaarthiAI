export const CHAT_LANGUAGES = {
  English: {
    greeting:
      'Namaste! I am Bharat Saarthi, your AI Civic Companion. How can I assist you today? You can ask me about government documents, schemes, complaint filings, or other municipal processes.',
    resetGreeting: 'Session reset. Namaste! How can I help you now?',
    placeholder: 'Ask a civic question in English...',
    loading: 'Consulting Government Guidelines...',
    suggestionsTitle: 'Try asking one of these questions:',
    connectionError:
      'Apologies, I encountered an issue connecting to the server. Please verify the backend is running.',
    suggestions: [
      { label: 'Lost Aadhaar Card', text: 'I lost my Aadhaar card. How do I get a new one?' },
      { label: 'Apply for Passport', text: 'I want to apply for a fresh Indian passport. What is the process?' },
      { label: 'Scholarships for Higher Studies', text: 'What government scholarships are available for graduate studies?' },
      { label: 'Report Local Pothole', text: 'I want to report a huge pothole in my local street.' },
    ],
  },
  Hindi: {
    greeting:
      'नमस्ते! मैं भारत सारथी, आपका AI नागरिक सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता/सकती हूँ? आप मुझसे सरकारी दस्तावेज़, योजनाएँ, शिकायत दर्ज करने या अन्य नगरपालिका प्रक्रियाओं के बारे में पूछ सकते हैं।',
    resetGreeting: 'सत्र रीसेट हो गया। नमस्ते! अब मैं आपकी कैसे मदद कर सकता/सकती हूँ?',
    placeholder: 'हिंदी में अपना नागरिक प्रश्न पूछें...',
    loading: 'सरकारी दिशानिर्देश देखे जा रहे हैं...',
    suggestionsTitle: 'इनमें से कोई एक प्रश्न पूछकर देखें:',
    connectionError:
      'क्षमा करें, सर्वर से जुड़ने में समस्या आई। कृपया जाँचें कि बैकएंड चल रहा है।',
    suggestions: [
      { label: 'आधार कार्ड खो गया', text: 'मेरा आधार कार्ड खो गया है। मैं नया आधार कार्ड कैसे प्राप्त करूँ?' },
      { label: 'पासपोर्ट के लिए आवेदन', text: 'मैं नया भारतीय पासपोर्ट के लिए आवेदन करना चाहता/चाहती हूँ। प्रक्रिया क्या है?' },
      { label: 'उच्च शिक्षा छात्रवृत्ति', text: 'स्नातक अध्ययन के लिए कौन-कौन सी सरकारी छात्रवृत्तियाँ उपलब्ध हैं?' },
      { label: 'स्थानीय गड्ढे की शिकायत', text: 'मैं अपनी गली में एक बड़े गड्ढे की शिकायत दर्ज करना चाहता/चाहती हूँ।' },
    ],
  },
  Marathi: {
    greeting:
      'नमस्कार! मी भारत सारथी, तुमचा AI नागरी सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो/शकते? तुम्ही मला सरकारी कागदपत्रे, योजना, तक्रार नोंदणी किंवा इतर नगरपालिका प्रक्रियांबद्दल विचारू शकता.',
    resetGreeting: 'सत्र रीसेट झाले. नमस्कार! आता मी तुम्हाला कशी मदत करू शकतो/शकते?',
    placeholder: 'मराठीत तुमचा नागरी प्रश्न विचारा...',
    loading: 'सरकारी मार्गदर्शक तत्त्वे तपासली जात आहेत...',
    suggestionsTitle: 'खालीलपैकी एक प्रश्न विचारून पहा:',
    connectionError:
      'क्षमस्व, सर्व्हरशी जोडण्यात अडचण आली. कृपया बॅकएंड चालू आहे का ते तपासा.',
    suggestions: [
      { label: 'आधार कार्ड हरवले', text: 'माझे आधार कार्ड हरवले आहे. मी नवीन आधार कार्ड कसे मिळवू?' },
      { label: 'पासपोर्ट अर्ज', text: 'मला नवीन भारतीय पासपोर्टसाठी अर्ज करायचा आहे. प्रक्रिया काय आहे?' },
      { label: 'उच्च शिक्षण शिष्यवृत्ती', text: 'पदवी अभ्यासासाठी कोणत्या सरकारी शिष्यवृत्त्या उपलब्ध आहेत?' },
      { label: 'स्थानिक खड्ड्याची तक्रार', text: 'मला माझ्या रस्त्यावरील मोठ्या खड्ड्याची तक्रार नोंदवायची आहे.' },
    ],
  },
};

export const getChatContent = (language) => CHAT_LANGUAGES[language] || CHAT_LANGUAGES.English;
