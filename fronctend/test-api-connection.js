// Test de connexion API côté frontend
const API_BASE_URL = 'http://localhost:4401';

async function testFrontendAPI() {
  console.log('🔍 Test de connexion API frontend...\n');
  
  try {
    // Test simple fetch
    console.log('📡 Test fetch basic...');
    const response = await fetch(`${API_BASE_URL}/livres`);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API accessible depuis le frontend!');
      console.log('📊 Nombre de livres:', data.data?.length || 'N/A');
      
      if (data.data && data.data.length > 0) {
        console.log('\n📚 Premier livre:');
        console.log(JSON.stringify(data.data[0], null, 2));
      }
    } else {
      console.log('❌ Erreur HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Réponse:', errorText);
    }
  } catch (error) {
    console.error('❌ Erreur fetch:', error.message);
    console.log('🔍 Vérifiez:');
    console.log('  - Le serveur backend est démarré sur le port 4401');
    console.log('  - Les politiques CORS sont configurées');
    console.log('  - Aucun firewall ne bloque la connexion');
  }
}

// Exécuter le test si on est dans un environnement Node
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testFrontendAPI();
} else {
  // Browser environment
  testFrontendAPI();
}
