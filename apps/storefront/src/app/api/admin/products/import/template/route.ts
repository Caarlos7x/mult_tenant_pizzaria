import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  // Cria um workbook vazio
  const workbook = XLSX.utils.book_new();

  // Define os dados da planilha com cabeçalhos e 52 produtos (30 pizzas + 22 bebidas)
  const data = [
    // Cabeçalhos
    [
      "name",
      "description",
      "type",
      "status",
      "basePrice",
      "categoryName",
      "imageUrl",
      "sortOrder",
    ],
    // PIZZAS (30 itens)
    ["Pizza Margherita", "Molho de tomate, mussarela e manjericão fresco", "PIZZA", "ACTIVE", 25.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 1],
    ["Pizza Calabresa", "Calabresa, cebola e azeitona", "PIZZA", "ACTIVE", 28.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 2],
    ["Pizza Portuguesa", "Presunto, ovos, cebola, azeitona e mussarela", "PIZZA", "ACTIVE", 32.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 3],
    ["Pizza 4 Queijos", "Mussarela, provolone, parmesão e gorgonzola", "PIZZA", "ACTIVE", 35.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 4],
    ["Pizza Frango com Catupiry", "Frango desfiado, catupiry e milho", "PIZZA", "ACTIVE", 30.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 5],
    ["Pizza Pepperoni", "Pepperoni, mussarela e orégano", "PIZZA", "ACTIVE", 33.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 6],
    ["Pizza Napolitana", "Tomate, alho, azeitona e manjericão", "PIZZA", "ACTIVE", 27.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 7],
    ["Pizza Bacon", "Bacon crocante, mussarela e cebola", "PIZZA", "ACTIVE", 34.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 8],
    ["Pizza Atum", "Atum, cebola e azeitona", "PIZZA", "ACTIVE", 29.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 9],
    ["Pizza Vegetariana", "Pimentão, champignon, cebola, azeitona e milho", "PIZZA", "ACTIVE", 31.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 10],
    ["Pizza Quatro Estações", "Presunto, champignon, palmito e azeitona", "PIZZA", "ACTIVE", 36.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 11],
    ["Pizza Alho e Óleo", "Alho frito, azeite, mussarela e orégano", "PIZZA", "ACTIVE", 26.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 12],
    ["Pizza Strogonoff", "Strogonoff de carne, batata palha e mussarela", "PIZZA", "ACTIVE", 37.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 13],
    ["Pizza Chocolate", "Chocolate derretido e morangos", "PIZZA", "ACTIVE", 28.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 14],
    ["Pizza Banana com Canela", "Banana, canela e açúcar", "PIZZA", "ACTIVE", 24.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 15],
    ["Pizza Moda da Casa", "Presunto, bacon, ovos, cebola e azeitona", "PIZZA", "ACTIVE", 38.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 16],
    ["Pizza Camarão", "Camarão, catupiry e cebola", "PIZZA", "ACTIVE", 45.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 17],
    ["Pizza Rúcula com Tomate Seco", "Rúcula, tomate seco, mussarela de búfala", "PIZZA", "ACTIVE", 32.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 18],
    ["Pizza Lombo Canadense", "Lombo canadense, catupiry e azeitona", "PIZZA", "ACTIVE", 35.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 19],
    ["Pizza Escarola", "Escarola, alho e azeite", "PIZZA", "ACTIVE", 27.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 20],
    ["Pizza Brócolis", "Brócolis, alho e catupiry", "PIZZA", "ACTIVE", 29.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 21],
    ["Pizza Palmito", "Palmito, mussarela e azeitona", "PIZZA", "ACTIVE", 30.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 22],
    ["Pizza Milho Verde", "Milho verde, mussarela e orégano", "PIZZA", "ACTIVE", 26.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 23],
    ["Pizza Champignon", "Champignon, alho e catupiry", "PIZZA", "ACTIVE", 31.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 24],
    ["Pizza Aliche", "Aliche, alho e azeite", "PIZZA", "ACTIVE", 33.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 25],
    ["Pizza Dois Amores", "Meio margherita, meio calabresa", "PIZZA", "ACTIVE", 30.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 26],
    ["Pizza Baiana", "Calabresa, pimenta, cebola e azeitona", "PIZZA", "ACTIVE", 29.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 27],
    ["Pizza Carioca", "Presunto, catupiry, milho e azeitona", "PIZZA", "ACTIVE", 32.00, "Pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop", 28],
    ["Pizza Toscana", "Calabresa moída, cebola e azeitona", "PIZZA", "ACTIVE", 28.00, "Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", 29],
    ["Pizza Especial da Casa", "Presunto, bacon, ovos, champignon, azeitona e mussarela", "PIZZA", "ACTIVE", 40.00, "Pizzas", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop", 30],
    // BEBIDAS - Refrigerantes Lata
    ["Coca-Cola Lata", "Refrigerante Coca-Cola 350ml", "DRINK", "ACTIVE", 5.50, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 31],
    ["Pepsi Lata", "Refrigerante Pepsi 350ml", "DRINK", "ACTIVE", 5.00, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 32],
    ["Guaraná Antarctica Lata", "Refrigerante Guaraná Antarctica 350ml", "DRINK", "ACTIVE", 5.00, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 33],
    ["Fanta Laranja Lata", "Refrigerante Fanta Laranja 350ml", "DRINK", "ACTIVE", 5.00, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 34],
    ["Sprite Lata", "Refrigerante Sprite 350ml", "DRINK", "ACTIVE", 5.00, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 35],
    // BEBIDAS - Refrigerantes 2L
    ["Coca-Cola 2L", "Refrigerante Coca-Cola 2 litros", "DRINK", "ACTIVE", 8.00, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 36],
    ["Pepsi 2L", "Refrigerante Pepsi 2 litros", "DRINK", "ACTIVE", 7.50, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 37],
    ["Guaraná Antarctica 2L", "Refrigerante Guaraná Antarctica 2 litros", "DRINK", "ACTIVE", 7.50, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 38],
    ["Fanta Laranja 2L", "Refrigerante Fanta Laranja 2 litros", "DRINK", "ACTIVE", 7.50, "Bebidas", "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop", 39],
    // BEBIDAS - Sucos
    ["Suco de Laranja Natural", "Suco de laranja natural 500ml", "DRINK", "ACTIVE", 6.00, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", 40],
    ["Suco de Limão", "Suco de limão natural 500ml", "DRINK", "ACTIVE", 5.50, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", 41],
    ["Suco de Maracujá", "Suco de maracujá natural 500ml", "DRINK", "ACTIVE", 6.50, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", 42],
    ["Suco de Abacaxi", "Suco de abacaxi natural 500ml", "DRINK", "ACTIVE", 6.00, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", 43],
    ["Suco de Morango", "Suco de morango natural 500ml", "DRINK", "ACTIVE", 6.50, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop", 44],
    // BEBIDAS - Água
    ["Água Mineral 500ml", "Água mineral sem gás 500ml", "DRINK", "ACTIVE", 3.00, "Bebidas", "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", 45],
    ["Água Mineral 1,5L", "Água mineral sem gás 1,5 litros", "DRINK", "ACTIVE", 4.50, "Bebidas", "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", 46],
    ["Água com Gás 500ml", "Água mineral com gás 500ml", "DRINK", "ACTIVE", 3.50, "Bebidas", "https://images.unsplash.com/photo-1548839140-5a6d48b49d3b?w=400&h=300&fit=crop", 47],
    // BEBIDAS ALCÓOLICAS - Cerveja
    ["Cerveja Brahma Lata", "Cerveja Brahma 350ml", "DRINK", "ACTIVE", 4.50, "Bebidas Alcóolicas", "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", 48],
    ["Cerveja Skol Lata", "Cerveja Skol 350ml", "DRINK", "ACTIVE", 4.50, "Bebidas Alcóolicas", "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", 49],
    ["Cerveja Antarctica Lata", "Cerveja Antarctica 350ml", "DRINK", "ACTIVE", 4.50, "Bebidas Alcóolicas", "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", 50],
    ["Cerveja Heineken Lata", "Cerveja Heineken 350ml", "DRINK", "ACTIVE", 6.00, "Bebidas Alcóolicas", "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", 51],
    ["Cerveja Stella Artois Lata", "Cerveja Stella Artois 350ml", "DRINK", "ACTIVE", 6.50, "Bebidas Alcóolicas", "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop", 52],
  ];

  // Cria a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Ajusta a largura das colunas
  worksheet["!cols"] = [
    { wch: 20 }, // name
    { wch: 40 }, // description
    { wch: 12 }, // type
    { wch: 12 }, // status
    { wch: 12 }, // basePrice
    { wch: 20 }, // categoryName
    { wch: 40 }, // imageUrl
    { wch: 12 }, // sortOrder
  ];

  // Adiciona a worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

  // Gera o buffer do arquivo Excel
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Retorna o arquivo como download
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-produtos.xlsx"',
    },
  });
}

