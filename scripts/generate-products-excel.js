const XLSX = require("xlsx");
const { resolve } = require("path");

// Dados dos produtos
const products = [
  // PIZZAS (30 itens)
  { name: "Pizza Margherita", description: "Molho de tomate, mussarela e manjericão fresco", type: "PIZZA", status: "ACTIVE", basePrice: 25.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 1 },
  { name: "Pizza Calabresa", description: "Calabresa, cebola e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 28.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 2 },
  { name: "Pizza Portuguesa", description: "Presunto, ovos, cebola, azeitona e mussarela", type: "PIZZA", status: "ACTIVE", basePrice: 32.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 3 },
  { name: "Pizza 4 Queijos", description: "Mussarela, provolone, parmesão e gorgonzola", type: "PIZZA", status: "ACTIVE", basePrice: 35.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 4 },
  { name: "Pizza Frango com Catupiry", description: "Frango desfiado, catupiry e milho", type: "PIZZA", status: "ACTIVE", basePrice: 30.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 5 },
  { name: "Pizza Pepperoni", description: "Pepperoni, mussarela e orégano", type: "PIZZA", status: "ACTIVE", basePrice: 33.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 6 },
  { name: "Pizza Napolitana", description: "Tomate, alho, azeitona e manjericão", type: "PIZZA", status: "ACTIVE", basePrice: 27.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 7 },
  { name: "Pizza Bacon", description: "Bacon crocante, mussarela e cebola", type: "PIZZA", status: "ACTIVE", basePrice: 34.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 8 },
  { name: "Pizza Atum", description: "Atum, cebola e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 29.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 9 },
  { name: "Pizza Vegetariana", description: "Pimentão, champignon, cebola, azeitona e milho", type: "PIZZA", status: "ACTIVE", basePrice: 31.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 10 },
  { name: "Pizza Quatro Estações", description: "Presunto, champignon, palmito e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 36.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 11 },
  { name: "Pizza Alho e Óleo", description: "Alho frito, azeite, mussarela e orégano", type: "PIZZA", status: "ACTIVE", basePrice: 26.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 12 },
  { name: "Pizza Strogonoff", description: "Strogonoff de carne, batata palha e mussarela", type: "PIZZA", status: "ACTIVE", basePrice: 37.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 13 },
  { name: "Pizza Chocolate", description: "Chocolate derretido e morangos", type: "PIZZA", status: "ACTIVE", basePrice: 28.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 14 },
  { name: "Pizza Banana com Canela", description: "Banana, canela e açúcar", type: "PIZZA", status: "ACTIVE", basePrice: 24.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 15 },
  { name: "Pizza Moda da Casa", description: "Presunto, bacon, ovos, cebola e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 38.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 16 },
  { name: "Pizza Camarão", description: "Camarão, catupiry e cebola", type: "PIZZA", status: "ACTIVE", basePrice: 45.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 17 },
  { name: "Pizza Rúcula com Tomate Seco", description: "Rúcula, tomate seco, mussarela de búfala", type: "PIZZA", status: "ACTIVE", basePrice: 32.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 18 },
  { name: "Pizza Lombo Canadense", description: "Lombo canadense, catupiry e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 35.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 19 },
  { name: "Pizza Escarola", description: "Escarola, alho e azeite", type: "PIZZA", status: "ACTIVE", basePrice: 27.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 20 },
  { name: "Pizza Brócolis", description: "Brócolis, alho e catupiry", type: "PIZZA", status: "ACTIVE", basePrice: 29.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 21 },
  { name: "Pizza Palmito", description: "Palmito, mussarela e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 30.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 22 },
  { name: "Pizza Milho Verde", description: "Milho verde, mussarela e orégano", type: "PIZZA", status: "ACTIVE", basePrice: 26.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 23 },
  { name: "Pizza Champignon", description: "Champignon, alho e catupiry", type: "PIZZA", status: "ACTIVE", basePrice: 31.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 24 },
  { name: "Pizza Aliche", description: "Aliche, alho e azeite", type: "PIZZA", status: "ACTIVE", basePrice: 33.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 25 },
  { name: "Pizza Dois Amores", description: "Meio margherita, meio calabresa", type: "PIZZA", status: "ACTIVE", basePrice: 30.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 26 },
  { name: "Pizza Baiana", description: "Calabresa, pimenta, cebola e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 29.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 27 },
  { name: "Pizza Carioca", description: "Presunto, catupiry, milho e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 32.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", sortOrder: 28 },
  { name: "Pizza Toscana", description: "Calabresa moída, cebola e azeitona", type: "PIZZA", status: "ACTIVE", basePrice: 28.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", sortOrder: 29 },
  { name: "Pizza Especial da Casa", description: "Presunto, bacon, ovos, champignon, azeitona e mussarela", type: "PIZZA", status: "ACTIVE", basePrice: 40.00, categoryName: "Pizzas", imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", sortOrder: 30 },
  
  // BEBIDAS - Refrigerantes Lata
  { name: "Coca-Cola Lata", description: "Refrigerante Coca-Cola 350ml", type: "DRINK", status: "ACTIVE", basePrice: 5.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 31 },
  { name: "Pepsi Lata", description: "Refrigerante Pepsi 350ml", type: "DRINK", status: "ACTIVE", basePrice: 5.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 32 },
  { name: "Guaraná Antarctica Lata", description: "Refrigerante Guaraná Antarctica 350ml", type: "DRINK", status: "ACTIVE", basePrice: 5.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 33 },
  { name: "Fanta Laranja Lata", description: "Refrigerante Fanta Laranja 350ml", type: "DRINK", status: "ACTIVE", basePrice: 5.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 34 },
  { name: "Sprite Lata", description: "Refrigerante Sprite 350ml", type: "DRINK", status: "ACTIVE", basePrice: 5.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 35 },
  
  // BEBIDAS - Refrigerantes 2L
  { name: "Coca-Cola 2L", description: "Refrigerante Coca-Cola 2 litros", type: "DRINK", status: "ACTIVE", basePrice: 8.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 36 },
  { name: "Pepsi 2L", description: "Refrigerante Pepsi 2 litros", type: "DRINK", status: "ACTIVE", basePrice: 7.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 37 },
  { name: "Guaraná Antarctica 2L", description: "Refrigerante Guaraná Antarctica 2 litros", type: "DRINK", status: "ACTIVE", basePrice: 7.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 38 },
  { name: "Fanta Laranja 2L", description: "Refrigerante Fanta Laranja 2 litros", type: "DRINK", status: "ACTIVE", basePrice: 7.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", sortOrder: 39 },
  
  // BEBIDAS - Sucos
  { name: "Suco de Laranja Natural", description: "Suco de laranja natural 500ml", type: "DRINK", status: "ACTIVE", basePrice: 6.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", sortOrder: 40 },
  { name: "Suco de Limão", description: "Suco de limão natural 500ml", type: "DRINK", status: "ACTIVE", basePrice: 5.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", sortOrder: 41 },
  { name: "Suco de Maracujá", description: "Suco de maracujá natural 500ml", type: "DRINK", status: "ACTIVE", basePrice: 6.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", sortOrder: 42 },
  { name: "Suco de Abacaxi", description: "Suco de abacaxi natural 500ml", type: "DRINK", status: "ACTIVE", basePrice: 6.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", sortOrder: 43 },
  { name: "Suco de Morango", description: "Suco de morango natural 500ml", type: "DRINK", status: "ACTIVE", basePrice: 6.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", sortOrder: 44 },
  
  // BEBIDAS - Água
  { name: "Água Mineral 500ml", description: "Água mineral sem gás 500ml", type: "DRINK", status: "ACTIVE", basePrice: 3.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", sortOrder: 45 },
  { name: "Água Mineral 1,5L", description: "Água mineral sem gás 1,5 litros", type: "DRINK", status: "ACTIVE", basePrice: 4.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", sortOrder: 46 },
  { name: "Água com Gás 500ml", description: "Água mineral com gás 500ml", type: "DRINK", status: "ACTIVE", basePrice: 3.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", sortOrder: 47 },
  
  // BEBIDAS - Cerveja
  { name: "Cerveja Brahma Lata", description: "Cerveja Brahma 350ml", type: "DRINK", status: "ACTIVE", basePrice: 4.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", sortOrder: 48 },
  { name: "Cerveja Skol Lata", description: "Cerveja Skol 350ml", type: "DRINK", status: "ACTIVE", basePrice: 4.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", sortOrder: 49 },
  { name: "Cerveja Antarctica Lata", description: "Cerveja Antarctica 350ml", type: "DRINK", status: "ACTIVE", basePrice: 4.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", sortOrder: 50 },
  { name: "Cerveja Heineken Lata", description: "Cerveja Heineken 350ml", type: "DRINK", status: "ACTIVE", basePrice: 6.00, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", sortOrder: 51 },
  { name: "Cerveja Stella Artois Lata", description: "Cerveja Stella Artois 350ml", type: "DRINK", status: "ACTIVE", basePrice: 6.50, categoryName: "Bebidas", imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", sortOrder: 52 },
];

// Cria o workbook
const workbook = XLSX.utils.book_new();

// Cabeçalhos
const headers = [
  "name",
  "description",
  "type",
  "status",
  "basePrice",
  "categoryName",
  "imageUrl",
  "sortOrder",
];

// Converte os dados para o formato da planilha
const sheetData = [
  headers,
  ...products.map((product) => [
    product.name,
    product.description,
    product.type,
    product.status,
    product.basePrice,
    product.categoryName,
    product.imageUrl,
    product.sortOrder,
  ]),
];

// Cria a worksheet
const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

// Ajusta a largura das colunas
worksheet["!cols"] = [
  { wch: 30 }, // name
  { wch: 50 }, // description
  { wch: 12 }, // type
  { wch: 12 }, // status
  { wch: 12 }, // basePrice
  { wch: 20 }, // categoryName
  { wch: 60 }, // imageUrl
  { wch: 12 }, // sortOrder
];

// Adiciona a worksheet ao workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

// Salva o arquivo na raiz do projeto
const outputPath = resolve(process.cwd(), "produtos-exemplo.xlsx");
XLSX.writeFile(workbook, outputPath);

console.log("✅ Planilha criada com sucesso!");
console.log(`📁 Arquivo salvo em: ${outputPath}`);
console.log(`📊 Total de produtos: ${products.length}`);
console.log(`   - Pizzas: 30`);
console.log(`   - Bebidas: ${products.length - 30}`);

