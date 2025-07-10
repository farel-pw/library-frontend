const { api } = require('./lib/api.ts');

// Test direct de la fonction getLivres
console.log("🔍 Test de la fonction getLivres...");

async function testGetLivres() {
  try {
    // Simuler localStorage pour le token si nécessaire
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    };

    console.log("📡 Appel de api.getLivres()...");
    const result = await api.getLivres();
    console.log("✅ Résultat:", result);
    console.log("📊 Type:", typeof result);
    console.log("🔢 Longueur:", Array.isArray(result) ? result.length : "Pas un tableau");
    
    if (Array.isArray(result) && result.length > 0) {
      console.log("📖 Premier livre:", result[0]);
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error("🔍 Stack:", error.stack);
  }
}

testGetLivres();
