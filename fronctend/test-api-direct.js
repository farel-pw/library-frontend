const fetch = require('node-fetch');

// Test direct de l'API
console.log("🔍 Test direct de l'API livres...");

async function testAPI() {
  try {
    console.log("📡 Appel de l'API http://localhost:4401/livres...");
    
    const response = await fetch('http://localhost:4401/livres');
    console.log("📊 Status:", response.status);
    console.log("📋 Headers:", response.headers.raw());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Données brutes:", JSON.stringify(data, null, 2));
    console.log("🔢 Type:", typeof data);
    
    if (data.data) {
      console.log("📖 data.data:", data.data);
      console.log("📈 Longueur de data.data:", Array.isArray(data.data) ? data.data.length : "Pas un tableau");
    }
    
    if (Array.isArray(data)) {
      console.log("📈 Longueur directe:", data.length);
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error("🔍 Stack:", error.stack);
  }
}

testAPI();
