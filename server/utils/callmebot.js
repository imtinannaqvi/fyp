import fetch from "node-fetch"; // or use axios if already installed

export const sendWhatsApp = async (phone, message) => {
  const encodedMsg = encodeURIComponent(message);
  const apiKey     = process.env.CALLMEBOT_APIKEY;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apiKey}`;

  const res = await fetch(url);
  const text = await res.text();
  console.log(`📲 CallMeBot response for ${phone}:`, text);
  return text;
};